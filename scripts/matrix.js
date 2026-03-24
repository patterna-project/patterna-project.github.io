// matrix.js


// Na začiatok matrix.js (za existujúce knižnice)
let useModel = null;
let useModelLoadPromise = null;

async function loadUSEModel() {
    if (useModel) return useModel;
    if (useModelLoadPromise) return useModelLoadPromise;
    
    useModelLoadPromise = (async () => {
        try {
            // Načítanie modelu (Universal Sentence Encoder)
            useModel = await use.load();
            console.log('USE model loaded');
            return useModel;
        } catch (error) {
            console.error('Failed to load USE model:', error);
            useModel = null;
            throw error;
        } finally {
            useModelLoadPromise = null;
        }
    })();
    
    return useModelLoadPromise;
}

// Pomocná funkcia na kosínusovú podobnosť dvoch vektorov
function cosineSimilarityVectors(vecA, vecB) {
    let dot = 0, magA = 0, magB = 0;
    for (let k = 0; k < vecA.length; k++) {
        dot += vecA[k] * vecB[k];
        magA += vecA[k] * vecA[k];
        magB += vecB[k] * vecB[k];
    }
    if (magA === 0 || magB === 0) return 0;
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

// Porter stemmer in Javascript (based on Martin Porter's algorithm)
// Source: https://tartarus.org/martin/PorterStemmer/
const porterStemmer = (function() {
    const step2list = {
        "ational": "ate", "tional": "tion", "enci": "ence", "anci": "ance",
        "izer": "ize", "bli": "ble", "alli": "al", "entli": "ent",
        "eli": "e", "ousli": "ous", "ization": "ize", "ation": "ate",
        "ator": "ate", "alism": "al", "iveness": "ive", "fulness": "ful",
        "ousness": "ous", "aliti": "al", "iviti": "ive", "biliti": "ble",
        "logi": "log"
    };
    const step3list = {
        "icate": "ic", "ative": "", "alize": "al", "iciti": "ic",
        "ical": "ic", "ful": "", "ness": ""
    };
    const c = "[^aeiou]";
    const v = "[aeiouy]";
    const C = c + "[^aeiouy]*";
    const V = v + "[aeiou]*";
    const mgr0 = "^(" + C + ")?" + V + C;
    const meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$";
    const mgr1 = "^(" + C + ")?" + V + C + V + C;
    const s_v = "^(" + C + ")?" + v;

    return function(w) {
        let stem, suffix, firstch, re, re2, re3, re4;
        if (w.length < 3) return w;

        firstch = w.substr(0, 1);
        if (firstch === "y") {
            w = firstch.toUpperCase() + w.substr(1);
        }

        // Step 1a
        re = /^(.+?)(ss|i)es$/;
        re2 = /^(.+?)([^s])s$/;
        if (re.test(w)) {
            w = w.replace(re, "$1$2");
        } else if (re2.test(w)) {
            w = w.replace(re2, "$1$2");
        }

        // Step 1b
        re = /^(.+?)eed$/;
        re2 = /^(.+?)(ed|ing)$/;
        if (re.test(w)) {
            let fp = re.exec(w);
            re = new RegExp(mgr0);
            if (re.test(fp[1])) {
                w = w.replace(/.$/, "");
            }
        } else if (re2.test(w)) {
            let fp = re2.exec(w);
            stem = fp[1];
            re2 = new RegExp(s_v);
            if (re2.test(stem)) {
                w = stem;
                re2 = /(at|bl|iz)$/;
                re3 = new RegExp("([^aeiouylsz])\\1$");
                re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");
                if (re2.test(w)) {
                    w += "e";
                } else if (re3.test(w)) {
                    w = w.replace(/.$/, "");
                } else if (re4.test(w)) {
                    w += "e";
                }
            }
        }

        // Step 1c
        re = /^(.+?)y$/;
        if (re.test(w)) {
            let fp = re.exec(w);
            stem = fp[1];
            re = new RegExp(s_v);
            if (re.test(stem)) {
                w = stem + "i";
            }
        }

        // Step 2
        re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
        if (re.test(w)) {
            let fp = re.exec(w);
            stem = fp[1];
            suffix = fp[2];
            re = new RegExp(mgr0);
            if (re.test(stem)) {
                w = stem + step2list[suffix];
            }
        }

        // Step 3
        re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
        if (re.test(w)) {
            let fp = re.exec(w);
            stem = fp[1];
            suffix = fp[2];
            re = new RegExp(mgr0);
            if (re.test(stem)) {
                w = stem + step3list[suffix];
            }
        }

        // Step 4
        re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
        re2 = /^(.+?)(s|t)(ion)$/;
        if (re.test(w)) {
            let fp = re.exec(w);
            stem = fp[1];
            re = new RegExp(mgr1);
            if (re.test(stem)) {
                w = stem;
            }
        } else if (re2.test(w)) {
            let fp = re2.exec(w);
            stem = fp[1] + fp[2];
            re2 = new RegExp(mgr1);
            if (re2.test(stem)) {
                w = stem;
            }
        }

        // Step 5
        re = /^(.+?)e$/;
        if (re.test(w)) {
            let fp = re.exec(w);
            stem = fp[1];
            re = new RegExp(mgr1);
            re2 = new RegExp(meq1);
            re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
            if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
                w = stem;
            }
        }

        re = /ll$/;
        re2 = new RegExp(mgr1);
        if (re.test(w) && re2.test(w)) {
            w = w.replace(/.$/, "");
        }

        // turn initial Y back to y
        if (firstch === "y") {
            w = firstch.toLowerCase() + w.substr(1);
        }

        return w;
    };
})();

class PatternSimilarity {
    // Pomocná metóda pre stemming jednotlivého slova
    stemWord(word) {
        const stemmed = porterStemmer(word);
        // console.log(`Stemming: "${word}" → "${stemmed}"`); logovanie
        return stemmed;
    }

    preprocessText(text) {
        
        return text
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^\w\s]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .split(' ')
            .filter(word =>
                word.length > 2 &&
                !window.customStopWords.has(word) &&  
                !/\d/.test(word)
            )
            .map(word => this.stemWord(word));
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

    async calculateUSESimilarityMatrix(patterns) {
        // 1. Zabezpečíme načítanie modelu
        const model = await loadUSEModel();
        
        // 2. Extrahujeme texty v poradí podľa patterns
        const texts = patterns.map(p => p.content);
        
        // 3. Získame embeddingy (volanie modelu)
        const embeddings = await model.embed(texts);
        const vectors = await embeddings.array(); // premeníme na JS pole

        embeddings.dispose();
        
        // 4. Vypočítame kosínusovú podobnosť pre všetky dvojice
        const matrix = {};
        for (let i = 0; i < patterns.length; i++) {
            const p1 = patterns[i];
            matrix[p1.filename] = {};
            for (let j = 0; j < patterns.length; j++) {
                const p2 = patterns[j];
                if (i === j) {
                    matrix[p1.filename][p2.filename] = 0.0;
                } else {
                    const sim = cosineSimilarityVectors(vectors[i], vectors[j]);
                    matrix[p1.filename][p2.filename] = sim;
                }
            }
        }
        
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
    
    // Vždy vytvoríme tlačidlá nanovo (odstránime podmienku)
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
                        dark:bg-indigo-500 dark:hover:bg-indigo-600"
                    title="${t.matrixTooltip || 'Zobrazenie matice podobností medzi vzormi. Čím tmavšia farba, tým vyššia podobnosť.'}">
                    ${t.similarityMatrix}
                </button>
                <button id="graphViewBtn" 
                    class="px-4 py-2 rounded-lg transition-all duration-200 font-medium
                        bg-gray-200 text-gray-700 hover:bg-gray-300
                        dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    title="${t.graphTooltip || 'Interaktívny graf vzťahov medzi vzormi. Hrubšia čiara = vyššia podobnosť. Kliknutím na uzol zobrazíš detaily.'}">
                    ${t.similarityGraph}
                </button>
                <button id="statisticsViewBtn" 
                    class="px-4 py-2 rounded-lg transition-all duration-200 font-medium
                        bg-gray-200 text-gray-700 hover:bg-gray-300
                        dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
                    title="${t.statisticsTooltip || 'Základné štatistiky o podobnostiach medzi vzormi – priemery, najsilnejšie spojenia, distribúcia.'}">
                    ${t.statistics}
                </button>
            </div>
            <!-- NOVÉ TLAČIDLO VYSVETLI -->
            <button id="explainViewBtn" 
                class="px-4 py-2 rounded-lg transition-all duration-200 font-medium
                    bg-indigo-100 text-indigo-700 hover:bg-indigo-200
                    dark:bg-indigo-900 dark:text-indigo-300 dark:hover:bg-indigo-800"
                title="${t.explainButtonTooltip}">
                ${t.explainButton}
            </button>
        </div>
        <div id="similarityMatrix" class="text-sm overflow-x-auto custom-scrollbar"></div>
        <div id="similarityGraph" class="w-full min-h-[500px] hidden relative"></div>
    `;
    
    // Pridáme event listenery s aktuálnymi dátami
    document.getElementById('matrixViewBtn').addEventListener('click', () => {
        window.switchView('matrix', sequence, similarityMatrix);
    });
    
    document.getElementById('graphViewBtn').addEventListener('click', () => {
        window.switchView('graph', sequence, similarityMatrix);
    });
    
    document.getElementById('statisticsViewBtn').addEventListener('click', () => {
        window.switchView('statistics', sequence, similarityMatrix);
    });

    document.getElementById('explainViewBtn').addEventListener('click', () => {
        const currentView = window.currentView || 'matrix'; // 'matrix', 'graph', 'statistics'
        openExplanationModal(currentView);
    });

    
    // Predvolene zobrazíme maticu
    window.switchView('matrix', sequence, similarityMatrix);
    
    // Uložíme dáta pre neskoršie použitie (napr. pre graf)
    currentGraphData = { patterns: sequence, matrix: similarityMatrix };
}

window.openExplanationModal = function(view) {
    const modal = document.getElementById('explanationModal');
    const title = document.getElementById('explanationModalTitle');
    const content = document.getElementById('explanationModalContent');
    const t = window.translations?.[window.currentLanguage] || window.translations?.sk;
    
    // Zistíme aktuálne nastavenia (pre maticu)
    const useIDF = document.getElementById('idfCheckbox')?.checked || false;
    const useUSE = document.getElementById('useCheckbox')?.checked || false;
    const useSentiment = document.getElementById('sentimentCheckbox')?.checked || false;
    
    let extraInfo = '';
    if (view === 'matrix' && (useIDF || useUSE)) {
        extraInfo = `<p class="mt-3 p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded text-sm">
            <strong>⚙️ Aktuálne nastavenie:</strong> ${useUSE ? 'Universal Sentence Encoder' : 'TF-IDF'} 
            ${useIDF ? '(IDF zapnutý)' : ''} ${useSentiment ? '· so sentimentom' : ''}
        </p>`;
    }
    
    // Nastavíme obsah podľa view s použitím prekladov
    if (view === 'matrix') {
        title.textContent = t.explainMatrixTitle;
        content.innerHTML = `
            <p class="mb-3">${t.explainMatrixText1}</p>
            <p class="mb-3">${t.explainMatrixText2}</p>
            <p class="mb-3">${t.explainMatrixText3}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">ℹ️ ${t.explainMatrixNote}</p>
            ${extraInfo}
        `;
    } else if (view === 'graph') {
        title.textContent = t.explainGraphTitle;
        content.innerHTML = `
            <p class="mb-3">${t.explainGraphText1}</p>
            <p class="mb-3">${t.explainGraphText2}</p>
            <p class="mb-3">${t.explainGraphText3}</p>
            <p class="mb-3">${t.explainGraphText4}</p>
            <p class="text-sm text-gray-500 dark:text-gray-400">ℹ️ ${t.explainGraphNote}</p>
        `;
    } else if (view === 'statistics') {
        title.textContent = t.explainStatsTitle;
        content.innerHTML = `
            <p class="mb-3">${t.explainStatsText1}</p>
            <p class="mb-2">${t.explainStatsText2}</p>
            <p class="mb-2">${t.explainStatsText3}</p>
            <p class="mb-2">${t.explainStatsText4}</p>
            <p class="mb-2">${t.explainStatsText5}</p>
        `;
    }
    
    openModal('explanationModal');
};