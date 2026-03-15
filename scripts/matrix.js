// matrix.js

class PatternSimilarity {
    constructor() {
    this.stopWords = window.customStopWords || new Set([
        'a', 'an', 'the', 'and', 'it', 'is', 'to', 'at', 'in', 'we', 'of', 'be'
    ]);
}

    preprocessText(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(word =>
                word.length > 2 &&
                !this.stopWords.has(word) &&
                !/\d/.test(word)
            );
    }

    calculateTF(tokens) {
        const tf = {};
        const totalTerms = tokens.length;

        tokens.forEach(token => {
            tf[token] = (tf[token] || 0) + 1;
        });

        // Normalizácia TF
        Object.keys(tf).forEach(term => {
            tf[term] = tf[term] / totalTerms;
        });

        return tf;
    }

    calculateIDF(documentsTokens) {
        const idf = {};
        const totalDocs = documentsTokens.length;

        // Pre každý term spočítame, v koľkých dokumentoch sa vyskytuje
        documentsTokens.forEach(tokens => {
            const uniqueTerms = new Set(tokens);
            uniqueTerms.forEach(term => {
                idf[term] = (idf[term] || 0) + 1;
            });
        });

        // Výpočet IDF: log(počet_dokumentov / počet_dokumentov_s_termom)
        Object.keys(idf).forEach(term => {
            idf[term] = Math.log(totalDocs / idf[term]);
        });

        return idf;
    }

    calculateTFIDF(tokens, idf) {
        const tf = this.calculateTF(tokens);
        const tfidf = {};

        Object.keys(tf).forEach(term => {
            tfidf[term] = tf[term] * (idf[term] || 0);
        });

        return tfidf;
    }

    calculateTFVectors(patterns, useIDF = false) {
        // Najprv vytvoríme tokeny pre všetky dokumenty
        const documentsTokens = patterns.map(pattern =>
            this.preprocessText(pattern.content)
        );

        // Ak používame IDF, vypočítame ho
        const idf = useIDF ? this.calculateIDF(documentsTokens) : null;

        return patterns.map((pattern, index) => {
            const tokens = documentsTokens[index];
            
            let vector;
            if (useIDF) {
                vector = this.calculateTFIDF(tokens, idf);
            } else {
                vector = this.calculateTF(tokens);
            }

            return {
                pattern: pattern,
                vector: vector
            };
        });
    }

    cosineSimilarity(vecA, vecB) {
        const allTerms = new Set([...Object.keys(vecA), ...Object.keys(vecB)]);
        let dotProduct = 0;
        let magnitudeA = 0;
        let magnitudeB = 0;

        allTerms.forEach(term => {
            const a = vecA[term] || 0;
            const b = vecB[term] || 0;
            dotProduct += a * b;
            magnitudeA += a * a;
            magnitudeB += b * b;
        });

        magnitudeA = Math.sqrt(magnitudeA);
        magnitudeB = Math.sqrt(magnitudeB);

        if (magnitudeA === 0 || magnitudeB === 0) return 0;

        return dotProduct / (magnitudeA * magnitudeB);
    }

    calculateSimilarityMatrix(patterns, useIDF = false) {
        const vectors = this.calculateTFVectors(patterns, useIDF);
        const matrix = {};

        patterns.forEach((pattern1, i) => {
            matrix[pattern1.filename] = {};
            patterns.forEach((pattern2, j) => {
                if (i === j) {
                    matrix[pattern1.filename][pattern2.filename] = 0.0; // diagonála 0
                } else {
                    const similarity = this.cosineSimilarity(
                        vectors[i].vector,
                        vectors[j].vector
                    );
                    matrix[pattern1.filename][pattern2.filename] = similarity;
                }
            });
        });

        return matrix;
    }
}

function displaySimilarityMatrix(sequence, similarityMatrix) {
    const matrixDiv = document.getElementById("similarityMatrix");
    matrixDiv.innerHTML = "";

    const table = document.createElement("table");
    table.className = "w-full text-xs border-collapse";

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th class='p-2 bg-gray-100 dark:bg-gray-700 w-24'></th>" +
        sequence.map(p => {
            const shortName = p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name;
            return `<th class="text-left p-2 bg-gray-100 dark:bg-gray-700 font-medium" title="${p.name}">${escapeHtml(shortName)}</th>`;
        }).join("");
    table.appendChild(headerRow);

    // Riadky
    sequence.forEach((pattern1, i) => {
        const row = document.createElement("tr");
        const shortName1 = pattern1.name.length > 15 ? pattern1.name.substring(0, 15) + '...' : pattern1.name;
        row.innerHTML = `<td class="font-medium p-2 bg-gray-50 dark:bg-gray-600" title="${pattern1.name}">${escapeHtml(shortName1)}</td>`;

        sequence.forEach((pattern2, j) => {
            const similarity = similarityMatrix[pattern1.filename][pattern2.filename] || 0;
            const cell = document.createElement("td");
            cell.className = "p-2 text-center";
            cell.textContent = similarity.toFixed(2);

            // Farba podľa podobnosti
            const intensity = similarity * 0.7;
            cell.style.backgroundColor = `rgba(99, 102, 241, ${intensity})`;
            cell.style.color = similarity > 0.5 ? 'white' : 'black';
            cell.title = `${pattern1.name} → ${pattern2.name}: ${(similarity * 100).toFixed(1)}%`;

            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    matrixDiv.appendChild(table);
}

// Jednotná funkcia na prepínanie medzi view
window.switchView = function(view, patterns, similarityMatrix) {
    const matrixBtn = document.getElementById('matrixViewBtn');
    const graphBtn = document.getElementById('graphViewBtn');
    const statsBtn = document.getElementById('statisticsViewBtn');
    const matrixDiv = document.getElementById('similarityMatrix');
    const graphDiv = document.getElementById('similarityGraph');
    
    if (!matrixBtn || !graphBtn || !statsBtn || !matrixDiv || !graphDiv) return;
    
    // Reset všetkých tlačidiel
    [matrixBtn, graphBtn, statsBtn].forEach(btn => {
        btn.className = 'px-4 py-2 rounded-lg transition-all duration-200 font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600';
    });
    
    // Aktivujeme vybrané tlačidlo
    if (view === 'matrix') {
        matrixBtn.className = 'px-4 py-2 rounded-lg transition-all duration-200 font-medium bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600';
        matrixDiv.classList.remove('hidden');
        graphDiv.classList.add('hidden');
        displaySimilarityMatrix(patterns, similarityMatrix);
    } else if (view === 'graph') {
        graphBtn.className = 'px-4 py-2 rounded-lg transition-all duration-200 font-medium bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600';
        matrixDiv.classList.add('hidden');
        graphDiv.classList.remove('hidden');
        if (typeof renderSimilarityGraph === 'function') {
            renderSimilarityGraph(patterns, similarityMatrix);
        }
    } else if (view === 'statistics') {
        statsBtn.className = 'px-4 py-2 rounded-lg transition-all duration-200 font-medium bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600';
        matrixDiv.classList.remove('hidden');
        graphDiv.classList.add('hidden');
        if (typeof displayStatistics === 'function') {
            displayStatistics(patterns, similarityMatrix);
        }
    }
    
    window.currentView = view;
};

function displaySimilarityMatrixWithToggle(sequence, similarityMatrix) {
    const similarityInfo = document.getElementById('similarityInfo');
    if (similarityInfo) {
        similarityInfo.classList.remove('hidden');
    }
    
    // Skontrolujeme, či už tlačidlá existujú
    if (!document.getElementById('matrixViewBtn')) {
        // Vytvoríme tlačidlá
        const t = window.translations?.[window.currentLanguage] || { 
            similarityMatrix: "📊 Matica podobností",
            similarityGraph: "🕸️ Graf podobností",
            statistics: "📊 Štatistiky"
        };
        
        // Vyčistíme similarityInfo a vytvoríme novú štruktúru
        similarityInfo.innerHTML = `
            <div class="flex justify-between items-center mb-4">
                <div class="flex gap-2">
                    <button id="matrixViewBtn" 
                        class="px-4 py-2 rounded-lg transition-all duration-200 font-medium
                               bg-indigo-600 text-white hover:bg-indigo-700
                               dark:bg-indigo-500 dark:hover:bg-indigo-600">
                        ${t.similarityMatrix}
                    </button>
                    <button id="graphViewBtn" 
                        class="px-4 py-2 rounded-lg transition-all duration-200 font-medium
                               bg-gray-200 text-gray-700 hover:bg-gray-300
                               dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                        ${t.similarityGraph}
                    </button>
                    <button id="statisticsViewBtn" 
                        class="px-4 py-2 rounded-lg transition-all duration-200 font-medium
                               bg-gray-200 text-gray-700 hover:bg-gray-300
                               dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                        ${t.statistics}
                    </button>
                </div>
            </div>
            <div id="similarityMatrix" class="text-sm overflow-x-auto"></div>
            <div id="similarityGraph" class="w-full min-h-[500px] hidden relative"></div>
        `;
        
        // Pridáme event listenery
        document.getElementById('matrixViewBtn').addEventListener('click', () => {
            window.switchView('matrix', sequence, similarityMatrix);
        });
        
        document.getElementById('graphViewBtn').addEventListener('click', () => {
            window.switchView('graph', sequence, similarityMatrix);
        });
        
        document.getElementById('statisticsViewBtn').addEventListener('click', () => {
            window.switchView('statistics', sequence, similarityMatrix);
        });
        
    } else {
        // Aktualizujeme texty tlačidiel
        const t = window.translations?.[window.currentLanguage] || { 
            similarityMatrix: "📊 Matica podobností",
            similarityGraph: "🕸️ Graf podobností",
            statistics: "📊 Štatistiky"
        };
        
        const matrixBtn = document.getElementById('matrixViewBtn');
        const graphBtn = document.getElementById('graphViewBtn');
        const statsBtn = document.getElementById('statisticsViewBtn');
        
        if (matrixBtn) matrixBtn.innerHTML = t.similarityMatrix;
        if (graphBtn) graphBtn.innerHTML = t.similarityGraph;
        if (statsBtn) statsBtn.innerHTML = t.statistics;
    }
    
    // Predvolene zobrazíme maticu
    window.switchView('matrix', sequence, similarityMatrix);
    
    // Uložíme dáta pre neskoršie použitie
    currentGraphData = { patterns: sequence, matrix: similarityMatrix };
}
