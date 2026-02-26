//matrix.js

class PatternSimilarity {
    constructor() {
        this.stopWords = new Set([
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

        // Normalizácia
        Object.keys(tf).forEach(term => {
            tf[term] = tf[term] / totalTerms;
        });

        return tf;
    }

    calculateTFVectors(patterns) {
        const documents = patterns.map(pattern =>
            this.preprocessText(pattern.content)
        );

        return patterns.map((pattern, index) => {
            const tokens = documents[index];
            const tf = this.calculateTF(tokens);

            return {
                pattern: pattern,
                vector: tf // Používame priamo TF, nie TF-IDF
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

    calculateSimilarityMatrix(patterns) {
        const vectors = this.calculateTFVectors(patterns); // Zmenené na TF vektory
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
    const similarityInfo = document.getElementById("similarityInfo");
    matrixDiv.innerHTML = "";

    similarityInfo.classList.remove("hidden");

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