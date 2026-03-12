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