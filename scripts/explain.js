// explain.js - Generovanie vysvetlení sekvencií na základe textovej podobnosti

/**
 * Hlavná funkcia na vysvetlenie sekvencie
 * @param {Array} sequence - pole vzorov v aktuálnom poradí
 * @param {Object} similarityMatrix - matica podobností
 */
function explainSequence(sequence, similarityMatrix) {
    if (!sequence || sequence.length < 2) {
        showToast(translations[currentLanguage]?.explainNeedTwo || 'Pre vysvetlenie potrebujete aspoň 2 vzory v sekvencii', 'warning');
        return;
    }

    const modal = document.getElementById('explanationModal');
    const title = document.getElementById('explanationModalTitle');
    const content = document.getElementById('explanationModalContent');
    const t = translations[currentLanguage];

    title.textContent = t.explainSequenceTitle;

    // Vytvoríme inštanciu PatternSimilarity pre prístup k metódam
    const similarityCalculator = new PatternSimilarity();

    // Generujeme obsah
    let html = generateOverallSummary(sequence, similarityMatrix, t);

    html += '<div class="mt-6 space-y-4">';
    for (let i = 0; i < sequence.length - 1; i++) {
        html += generateStepExplanation(sequence[i], sequence[i+1], similarityMatrix, i+1, t, similarityCalculator);
    }
    html += '</div>';

    html += generateClosingNote(sequence, similarityMatrix, t);

    content.innerHTML = html;
    openModal('explanationModal');

}

/**
 * Generuje celkové zhrnutie sekvencie
 */
function generateOverallSummary(sequence, similarityMatrix, t) {
    const totalSim = calculateAverageSimilarity(sequence, similarityMatrix);
    const startPattern = sequence[0];
    const goalPattern = sequence[sequence.length - 1];
    const colors = getConfidenceColor(totalSim);

    const containsText = t.explainSequenceContains
        .replace('{count}', sequence.length)
        .replace('{start}', startPattern.name)
        .replace('{goal}', goalPattern.name);

    const avgSimText = t.explainSequenceAvgSim
        .replace('{color}', colors.text)
        .replace('{sim}', totalSim.toFixed(1));

    const consistencyText = totalSim > 50 ? t.explainSequenceConsistent : t.explainSequenceWeak;

    return `
        <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg mb-4 border-l-4 border-indigo-500">
            <p class="mb-2"><strong>${t.explainSequenceOverall}</strong></p>
            <p>${containsText}</p>
            <p class="mt-2">${avgSimText} ${consistencyText}</p>
        </div>
    `;
}

/**
 * Generuje vysvetlenie pre jeden krok (pattern i → pattern i+1)
 */
function generateStepExplanation(patternA, patternB, similarityMatrix, stepNumber, t, similarityCalculator) {
    const sim = similarityMatrix[patternA.filename]?.[patternB.filename] || 0;
    const percent = (sim * 100).toFixed(1);
    const colors = getConfidenceColor(sim * 100);

    // ★ POUŽIJEME ROVNAKÉ SPRACOVANIE AKO V MATICI ★
    const tokensA = similarityCalculator.preprocessText(patternA.content);
    const tokensB = similarityCalculator.preprocessText(patternB.content);
    
    // Získame frekvencie (TF) pre oba texty
    const tfA = similarityCalculator.calculateTF(tokensA);
    const tfB = similarityCalculator.calculateTF(tokensB);
    
    // Nájdeme TOP kľúčové slová (s najvyššou TF v danom texte)
    const keywordsA = Object.entries(tfA)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
    
    const keywordsB = Object.entries(tfB)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
    
    // Spoločné kľúčové slová (prienik)
    const commonKeywords = keywordsA.filter(kw => keywordsB.includes(kw));

    const stepTitle = t.explainSequenceStep
        .replace('{step}', stepNumber)
        .replace('{from}', patternA.name)
        .replace('{to}', patternB.name);

    const similarityText = t.explainSimilarity.replace('{percent}', percent);

    let stepHtml = `
        <div class="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:translate-x-1">
            <div class="flex items-center justify-between mb-2 flex-wrap gap-2">
                <h4 class="font-semibold">${stepTitle}</h4>
                <span class="px-3 py-1 rounded-full text-xs font-medium" 
                      style="background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border}">
                    ${similarityText}
                </span>
            </div>
    `;

    if (sim > 0.7) {
        stepHtml += `<p class="mb-2 text-green-700 dark:text-green-300">${t.explainStrong}</p>`;
    } else if (sim > 0.4) {
        stepHtml += `<p class="mb-2 text-amber-700 dark:text-amber-300">${t.explainMedium}</p>`;
    } else {
        stepHtml += `<p class="mb-2 text-gray-600 dark:text-gray-400">${t.explainWeak}</p>`;
    }

    if (commonKeywords.length > 0) {
        stepHtml += `
            <div class="mt-2">
                <p class="text-xs text-gray-500 dark:text-gray-400 mb-1">${t.explainCommonTopics}</p>
                <div class="flex flex-wrap gap-1">
                    ${commonKeywords.map(kw => `<span class="keyword-tag px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full text-xs transition-all duration-200 hover:scale-105">${kw}</span>`).join('')}
                </div>
            </div>
        `;
    } else {
        stepHtml += `<p class="mt-2 text-xs text-gray-400 italic">${t.explainNoCommon}</p>`;
    }

    const directReference = checkForDirectReference(patternA.content, patternB);
    if (directReference) {
        const refText = t.explainDirectReference.replace('{name}', patternB.name);
        stepHtml += `<p class="mt-2 text-xs text-green-600 dark:text-green-400">${refText}</p>`;
    }

    stepHtml += `</div>`;
    return stepHtml;
}

/**
 * Generuje záverečnú poznámku
 */
function generateClosingNote(sequence, similarityMatrix, t) {
    const goalPattern = sequence[sequence.length - 1];
    const goalSimilarityToOthers = calculateAverageSimilarityToOthers(goalPattern, sequence, similarityMatrix);
    
    let note = `
        <div class="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 border-l-4 border-amber-500">
            <p class="mb-1"><strong>${t.explainTakeaway}</strong></p>
    `;

    if (goalSimilarityToOthers > 50) {
        const text = t.explainGoalWellConnected
            .replace('{name}', goalPattern.name)
            .replace('{sim}', goalSimilarityToOthers.toFixed(1));
        note += `<p>${text}</p>`;
    } else {
        const text = t.explainGoalSpecific.replace('{name}', goalPattern.name);
        note += `<p>${text}</p>`;
    }

    note += `</div>`;
    return note;
}

/**
 * Pomocné funkcie
 */

// Skontroluje, či textA priamo odkazuje na textB (napr. "see PATTERN_NAME")
function checkForDirectReference(textA, patternB) {
    const patternName = patternB.name.toLowerCase();
    const patternFilename = patternB.filename.replace('.txt', '').toLowerCase().replace(/_/g, ' ');
    
    const patterns = [
        new RegExp(`\\b(?:see|cf\\.?|refer to|as in)\\s+${patternName}\\b`, 'i'),
        new RegExp(`\\b${patternName}\\s+pattern\\b`, 'i'),
        new RegExp(`\\bpattern\\s+${patternName}\\b`, 'i'),
        new RegExp(`\\b${patternFilename}\\b`, 'i')
    ];

    for (let regex of patterns) {
        if (regex.test(textA)) {
            return true;
        }
    }
    return false;
}

// Vypočíta priemernú podobnosť medzi po sebe idúcimi vzormi
function calculateAverageSimilarity(sequence, similarityMatrix) {
    if (sequence.length < 2) return 0;
    
    let total = 0;
    for (let i = 0; i < sequence.length - 1; i++) {
        total += similarityMatrix[sequence[i].filename]?.[sequence[i+1].filename] || 0;
    }
    return (total / (sequence.length - 1)) * 100;
}

// Vypočíta priemernú podobnosť vzoru k ostatným v sekvencii
function calculateAverageSimilarityToOthers(pattern, sequence, similarityMatrix) {
    let total = 0;
    let count = 0;
    
    sequence.forEach(p => {
        if (p.filename !== pattern.filename) {
            total += similarityMatrix[pattern.filename]?.[p.filename] || 0;
            count++;
        }
    });
    
    return count > 0 ? (total / count) * 100 : 0;
}

// Event listener pre tlačidlo
document.addEventListener('DOMContentLoaded', () => {
    const explainBtn = document.getElementById('explainSequenceBtn');
    if (explainBtn) {
        explainBtn.addEventListener('click', () => {
            const patternsList = document.getElementById('patternsList');
            const items = patternsList.querySelectorAll('.pattern-item');
            
            if (items.length === 0) {
                showToast(translations[currentLanguage]?.explainNoSequence || 'Žiadna sekvencia na vysvetlenie', 'warning');
                return;
            }

            const currentOrder = Array.from(items).map(item => {
                const filename = item.dataset.patternName;
                return allPatternsData[filename];
            }).filter(p => p !== undefined);

            explainSequence(currentOrder, originalSimilarityMatrix);
        });
    }
});