// methodsteps.js

// Uložíme posledné dáta pre prípadné prekreslenie pri zmene jazyka
let lastMDPResult = null;
let lastMDPPatterns = null;

// Funkcia na prekreslenie MDP krokov podľa aktuálneho jazyka
function refreshMDPSteps() {
    if (lastMDPResult && lastMDPPatterns) {
        displayMDPSolution(lastMDPResult, lastMDPPatterns);
    }
}

// Upravená funkcia – ukladá si dáta a nekreslí znovu, ak sa volá s rovnakými údajmi
function displayMDPSolution(result, patterns) {
    // Uložíme pre budúce použitie
    lastMDPResult = result;
    window.lastMDPResult = result; 
    lastMDPPatterns = patterns;

    const mdpSolution = document.getElementById("mdpSolution");
    const mdpSteps = document.getElementById("mdpSteps");
    mdpSteps.innerHTML = "";

    mdpSolution.classList.remove("hidden");

    // nadpis s prekladom
    const title = document.querySelector('#mdpSolution h3');
    if (title) {
        title.textContent = translations[currentLanguage].mdpTitle;
    }

    // jednoduchý summary text podľa typu kroku
    function summaryForStep(step) {
        const t = translations[currentLanguage];
        switch (step.type) {
            case 'goal_calculation': {
                // Zobrazí SKUTOČNÝ vybraný cieľ, nie len ten s najvyššou podobnosťou
                const goalPattern = patterns.find(p => p.filename === step.goalState);
                const goalName = goalPattern ? goalPattern.name : step.goalState;
                const goalSim = step.totalSimilarities[step.goalState] || 0;
                return `${t.mdpGoalState}: ${goalName} (${goalSim.toFixed(3)})`;
            }
            case 'goal_state':
                return `${t.mdpGoalState}: ${step.goalPattern ? step.goalPattern.name : step.goalState}`;
            case 'complete_transition_matrix':
                return `${t.mdpStep3} (${Object.keys(step.transitionMatrix).length}×${Object.keys(step.transitionMatrix).length})`;
            case 'initial_utilities':
                return `${t.mdpStep4} (${t.mdpUtility}: ${Object.keys(step.utilities).length})`;
            case 'iteration':
                return `${t.mdpIteration} ${step.iteration}: ${t.mdpMaxChange} ${step.maxChange.toFixed(4)}`;
            case 'convergence':
                return `${t.mdpConverged} ${step.iterations} ${t.mdpIterations}`;
            case 'policy_calculation':
                return `${t.mdpStep6} (${t.mdpCurrentState}: ${Object.keys(step.calculations).length})`;
            case 'sequence_build':
                return `${t.mdpStep7}: ${step.finalSequence ? step.finalSequence.length + ' ' + (currentLanguage === 'sk' ? 'položiek' : 'items') : '—'}`;
            default:
                return '';
        }
    }

    // Prejdeme kroky a vložíme ich ako collapsible
    result.steps.forEach((step, idx) => {
        let stepElement = document.createElement("div");

        // Reuse tvojich create* funkcií: tie vytvoria detailný div
        switch (step.type) {
            case 'goal_calculation':
                stepElement = createGoalCalculationStep(step, patterns);
                break;
            case 'goal_state':
                stepElement = createGoalStateStep(step, patterns);
                break;
            case 'complete_transition_matrix':
                stepElement = createCompleteTransitionMatrixStep(step, patterns);
                break;
            case 'initial_utilities':
                stepElement = createInitialUtilitiesStep(step, patterns);
                break;
            case 'iteration':
                stepElement = createIterationStep(step, patterns);
                break;
            case 'convergence':
                stepElement = createConvergenceStep(step);
                break;
            case 'policy_calculation':
                stepElement = createPolicyCalculationStep(step, patterns);
                break;
            case 'sequence_build':
                stepElement = createSequenceBuildStep(step, patterns);
                break;
            default:
                stepElement = document.createElement("div");
                stepElement.textContent = JSON.stringify(step);
        }

        // Krátky header názov s prekladmi
        const t = translations[currentLanguage];
        const headerTitleMap = {
            'goal_calculation': t.mdpStep1,
            'goal_state': t.mdpStep2,
            'complete_transition_matrix': t.mdpStep3,
            'initial_utilities': t.mdpStep4,
            'iteration': `${t.mdpStep5} ${step.iteration || ''}`.trim(),
            'convergence': t.mdpConvergence,
            'policy_calculation': t.mdpStep6,
            'sequence_build': t.mdpStep7
        };
        const headerTitle = headerTitleMap[step.type] || `${t.mdpStep5} ${idx + 1}`;

        // Vytvoríme stručný summary
        const summaryText = summaryForStep(step);

        // Zabalíme do collapsible
        const collapsible = wrapAsCollapsible(stepElement, headerTitle, summaryText, true);

        mdpSteps.appendChild(collapsible);
    });

    if (typeof renderMathInElement !== 'undefined') {
        try {
            renderMathInElement(mdpSteps, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false}
                ]
            });
        } catch (e) {
            console.warn('KaTeX render error:', e);
        }
    }
}

function createCompleteTransitionMatrixStep(step, patterns) {
    const t = translations[currentLanguage];
    const stepDiv = document.createElement("div");
    stepDiv.className = "bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600";

    let content = `<h4 class="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">${t.mdpStep3}</h4>`;
    content += `<p class="mb-2 text-sm text-gray-600 dark:text-gray-400">${t.mdpTransitionMatrix}</p>`;

    // Check if reference bonus was used
    const useReferences = window.referenceBonusActive || false;
    if (useReferences) {
        const msg = t.referenceBonusActive?.replace('{bonus}', window.referenceBonusValue || 0.1) || 
                    `📎 Reference bonus active (bonus: ${window.referenceBonusValue || 0.1}) – values shown as: raw (raw+bonus)`;
        content += `<p class="mb-2 text-xs text-blue-600 dark:text-blue-400">${msg}</p>`;
    }

    content += `
        <div class="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <p class="font-semibold mb-1">${t.formulaLabel}</p>
            <p>${t.formulaTransitionMatrix}</p>
            <p class="text-gray-500 text-xs mt-1">${t.formulaSelfTransition}</p>
        </div>
    `;

    // Vytvoríme wrapper pre tabuľku so scrollbarom
    const tableWrapper = document.createElement("div");
    tableWrapper.className = "text-sm overflow-x-auto custom-scrollbar";
    tableWrapper.style.maxWidth = "100%";
    tableWrapper.style.overflowX = "auto";

    const table = document.createElement("table");
    table.className = "w-full text-xs border-collapse";
    table.style.minWidth = "600px";

    // Hlavička tabuľky
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = "<th class='p-2 bg-gray-100 dark:bg-gray-700 w-24'></th>" +
        patterns.map(p => {
            const shortName = p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name;
            return `<th class="text-left p-2 bg-gray-100 dark:bg-gray-700 font-medium" title="${p.name}">${escapeHtml(shortName)}</th>`;
        }).join("");
    table.appendChild(headerRow);

    // Get raw and boosted scores if available
    const rawScores = window.rawTransitionScores || {};
    const boostedScores = window.boostedTransitionScores || {};

    // Riadky
    patterns.forEach((pattern1, i) => {
        const row = document.createElement("tr");
        const shortName1 = pattern1.name.length > 15 ? pattern1.name.substring(0, 15) + '...' : pattern1.name;
        row.innerHTML = `<td class="font-medium p-2 bg-gray-50 dark:bg-gray-600" title="${pattern1.name}">${escapeHtml(shortName1)}<\/td>`;

        patterns.forEach((pattern2, j) => {
            const probability = step.transitionMatrix[pattern1.filename][pattern2.filename] || 0;
            const cell = document.createElement("td");
            cell.className = "p-2 text-center";
            
            const raw = rawScores[pattern1.filename]?.[pattern2.filename] || 0;
            const boosted = boostedScores[pattern1.filename]?.[pattern2.filename] || 0;
            
            if (useReferences && raw !== boosted && boosted > 0) {
                const bonusValue = window.referenceBonusValue || 0.1;
                cell.innerHTML = `${raw.toFixed(3)}<span class="text-xs text-green-500 dark:text-green-400">(+${bonusValue.toFixed(2)})</span> → ${probability.toFixed(3)}`;
            } else {
                cell.textContent = probability.toFixed(3);
            }
            
            const intensity = probability * 0.7;
            cell.style.backgroundColor = `rgba(99, 102, 241, ${intensity})`;
            cell.style.color = probability > 0.5 ? 'white' : 'black';
            
            if (useReferences && raw !== boosted) {
                cell.title = `${pattern1.name} → ${pattern2.name}: raw=${raw.toFixed(3)}, boosted=${boosted.toFixed(3)} → probability=${probability.toFixed(3)} (bonus applied)`;
            } else {
                cell.title = `${pattern1.name} → ${pattern2.name}: ${probability.toFixed(3)}`;
            }

            row.appendChild(cell);
        });

        table.appendChild(row);
    });

    tableWrapper.appendChild(table);
    stepDiv.innerHTML = content;
    stepDiv.appendChild(tableWrapper);

    const explanation = document.createElement("div");
    explanation.className = "mt-3 p-2 bg-blue-50 dark:bg-blue-900 rounded text-xs";
    explanation.innerHTML = `
        <strong>${currentLanguage === 'sk' ? 'Vysvetlenie:' : 'Explanation:'}</strong> ${t.mdpTransitionExplanation}
    `;
    stepDiv.appendChild(explanation);

    return stepDiv;
}

function createGoalCalculationStep(step, patterns) {
    const t = translations[currentLanguage];
    const stepDiv = document.createElement("div");
    stepDiv.className = "bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600";

    let content = `<h4 class="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">${t.mdpStep1}</h4>`;

    if (step.forcedGoalUsed) {
        const goalPattern = patterns.find(p => p.filename === step.goalState);
        content += `<p class="mb-2 text-green-600 dark:text-green-400">🎯 Používateľom vynútený cieľový vzor: <strong>${goalPattern ? goalPattern.name : step.goalState}</strong></p>`;
        content += `<p class="mb-2 text-sm text-gray-600 dark:text-gray-400">${t.standardCalculationSkipped || 'Štandardný výpočet celkových podobností bol preskočený.'}</p>`;
        stepDiv.innerHTML = content;
        return stepDiv;
    }

    if (step.forcedStartExcluded) {
        const excludedPattern = patterns.find(p => p.filename === step.forcedStartExcluded);
        const excludedName = excludedPattern ? excludedPattern.name : step.forcedStartExcluded;
        content += `<p class="mb-2 text-amber-600 dark:text-amber-400 text-xs flex items-center gap-1">⚠️ <span class="text-red-500">🚩</span> ${t.mdpForcedStartExcluded?.replace('{pattern}', excludedName) || 'Vynútený štartovací vzor bol vylúčený z výberu cieľa'}</p>`;
    }

    content += `<p class="mb-2">${t.mdpGoalCalculation}</p>`;

    content += `
        <div class="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <p class="font-semibold mb-1">${t.formulaLabel}</p>
            <p>${t.formulaTotalSimilarity}</p>
            <p class="mt-1">${t.formulaVariance}</p>
            <p class="mt-1">${t.formulaWeightedSelection}</p>
        </div>
    `;

    const sortedEntries = Object.entries(step.totalSimilarities)
        .sort((a, b) => b[1] - a[1]);

    const table = document.createElement("table");
    table.className = "w-full text-xs border-collapse mb-2";

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th class="p-2 bg-gray-100 dark:bg-gray-600 text-left">${t.mdpCurrentState}</th>
        <th class="p-2 bg-gray-100 dark:bg-gray-600 text-right">${t.totalSimilarity || 'Celková podobnosť'}</th>
        <th class="p-2 bg-gray-100 dark:bg-gray-600 text-right">${t.variance || 'Rozptyl'}</th>
        <th class="p-2 bg-gray-100 dark:bg-gray-600 text-center">#</th>
    `;
    table.appendChild(headerRow);

    const topCandidatesMap = new Map();
    if (step.selectionInfo && step.selectionInfo.topCandidates) {
        step.selectionInfo.topCandidates.forEach(c => {
            topCandidatesMap.set(c.state, c.variance);
        });
    }

    sortedEntries.forEach(([filename, similarity], index) => {
        const pattern = patterns.find(p => p.filename === filename);
        const row = document.createElement("tr");
        
        const isGoal = (filename === step.goalState);
        const isExcluded = (filename === step.forcedStartExcluded);
        const isInTopCandidates = topCandidatesMap.has(filename);
        const variance = topCandidatesMap.get(filename) || 0;
        
        let nameHtml = pattern.name;
        let iconHtml = '';
        
        if (isExcluded) {
            iconHtml = '<span class="text-red-500 mr-1" title="Vynútený štartovací vzor (vylúčený z výberu cieľa)">🚩</span>';
        } else if (isGoal) {
            iconHtml = '<span class="text-green-600 mr-1" title="Cieľový vzor (vybraný)">🎯</span>';
        } else if (isInTopCandidates && step.selectionInfo?.selectedByVariance) {
            iconHtml = '<span class="text-amber-500 mr-1" title="Top kandidát (bol v užšom výbere)">⭐</span>';
        }
        
        nameHtml = `<span class="inline-flex items-center gap-1">${iconHtml}${pattern.name}</span>`;
        
        const rank = index + 1;
        let rankDisplay = rank === 1 ? '🥇' : (rank === 2 ? '🥈' : (rank === 3 ? '🥉' : `${rank}.`));
        const varianceDisplay = variance > 0 ? variance.toFixed(4) : '0.0000';
        const varianceClass = isGoal && step.selectionInfo?.selectedWeightedRandom ? 'font-bold text-blue-600 dark:text-blue-400' : '';
        
        row.innerHTML = `
            <td class="p-2 border-b border-gray-200 dark:border-gray-600 ${isGoal ? 'font-bold bg-green-50 dark:bg-green-900/20' : ''}">${nameHtml}<\/td>
            <td class="p-2 border-b border-gray-200 dark:border-gray-600 text-right ${isGoal ? 'font-bold text-green-600 dark:text-green-400' : ''}">${similarity.toFixed(3)}<\/td>
            <td class="p-2 border-b border-gray-200 dark:border-gray-600 text-right ${varianceClass}">${varianceDisplay}<\/td>
            <td class="p-2 border-b border-gray-200 dark:border-gray-600 text-center">${rankDisplay}<\/td>
        `;
        table.appendChild(row);
    });

    if (step.selectionInfo && step.selectionInfo.selectedByVariance && step.selectionInfo.topCandidates) {
        const topCount = step.selectionInfo.topCandidates.length;
        
        if (step.selectionInfo.selectedWeightedRandom) {
            content += `<p class="mt-2 text-xs text-blue-600 dark:text-blue-400">
                🎲 ${t.goalSelectionTopCandidates?.replace('{topCount}', topCount) || `Výber cieľa: Z ${topCount} najlepších kandidátov (top 30%) bol náhodne vybraný vzor s pravdepodobnosťou úmernou rozptylu (špecifickejšie vzory majú vyššiu šancu).`}
            </p>`;
        } else {
            content += `<p class="mt-2 text-xs text-blue-600 dark:text-blue-400">
                🔍 ${t.goalSelectionDeterministic?.replace('{topCount}', topCount) || `Výber cieľa: Z ${topCount} najlepších kandidátov (top 30%) bol vybraný vzor s najväčším rozptylom podobností (najšpecifickejší).`}
            </p>`;
        }
        
        const topList = step.selectionInfo.topCandidates.map((c, idx) => {
            const pattern = patterns.find(p => p.filename === c.state);
            const isSelected = c.state === step.goalState;
            const varianceDisplay = c.variance ? c.variance.toFixed(4) : '0.0000';
            return `<span class="${isSelected ? 'font-bold text-green-600 dark:text-green-400' : ''}">${pattern?.name || c.state} (sim:${c.totalSim.toFixed(3)}, σ²:${varianceDisplay})</span>`;
        }).join(', ');
        
        content += `<p class="mt-1 text-xs text-gray-500 dark:text-gray-400">
            ${t.topCandidatesList?.replace('{list}', topList) || `📋 Top kandidáti: ${topList}`}
        </p>`;
    }

    if (sortedEntries.length >= 2) {
        const first = sortedEntries[0];
        const second = sortedEntries[1];
        const difference = (first[1] - second[1]) * 100;
        
        content += `<p class="mt-2 text-xs text-gray-600 dark:text-gray-400">
            ${t.differenceBetweenFirstAndSecond?.replace('{diff}', difference.toFixed(1)) || `📊 Rozdiel medzi 1. a 2. miestom: ${difference.toFixed(1)}%`}
            <span class="font-semibold ${difference > 5 ? 'text-green-600' : 'text-amber-600'}">
                ${difference > 5 ? (t.significantDifference || '(výrazný rozdiel)') : (t.tightDifference || '(tesný rozdiel)')}
            </span>
        </p>`;
    }

    const goalPattern = patterns.find(p => p.filename === step.goalState);
    let similarityInfo = '';
    if (sortedEntries.length > 0) {
        const topSim = sortedEntries[0][1];
        const goalSim = step.totalSimilarities[step.goalState];
        const goalVariance = topCandidatesMap.get(step.goalState) || 0;
        
        if (goalSim === topSim && sortedEntries[0][0] === step.goalState) {
            similarityInfo = t.selectedByHighestTotal?.replace('{sim}', topSim.toFixed(3)) || `(najvyššia celková podobnosť = ${topSim.toFixed(3)})`;
        } else if (step.selectionInfo?.selectedWeightedRandom) {
            similarityInfo = t.selectedByWeightedRandom?.replace('{variance}', goalVariance.toFixed(4)).replace('{sim}', goalSim.toFixed(3)) || `(náhodne vybraný z top 30% s váhou rozptylu ${goalVariance.toFixed(4)}, celková podobnosť = ${goalSim.toFixed(3)})`;
        } else {
            similarityInfo = t.selectedByVariance?.replace('{variance}', goalVariance.toFixed(4)).replace('{sim}', goalSim.toFixed(3)) || `(vybraný podľa rozptylu z top 30%, rozptyl = ${goalVariance.toFixed(4)}, celková podobnosť = ${goalSim.toFixed(3)})`;
        }
    }
    content += `<p class="mt-2 font-semibold flex items-center gap-1">${t.mdpGoalState}: <span class="text-green-600 flex items-center gap-1 text-base"><span>🎯</span>${goalPattern.name}</span> ${similarityInfo}</p>`;

    stepDiv.innerHTML = content;
    stepDiv.appendChild(table);
    return stepDiv;
}

function createGoalStateStep(step, patterns) {
    const t = translations[currentLanguage];
    const stepDiv = document.createElement("div");
    stepDiv.className = "bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600";

    let content = `<h4 class="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">${t.mdpStep2}</h4>`;

    content += `
        <div class="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <p class="font-semibold mb-1">${t.formulaLabel}</p>
            <p>${t.formulaReward}</p>
        </div>
    `;

    content += `<p>${t.mdpGoalState} <strong class="inline-flex items-center gap-1"><span class="text-green-600">🎯</span>${step.goalPattern.name}</strong> ${t.mdpGoalReward} = ${step.goalReward?.toFixed(1) ?? '10.0'}</p>`;
    content += `<p>${t.mdpOtherReward} = ${step.otherReward?.toFixed(1) ?? '1.0'}</p>`;
    
    if (window.useSentiment && window.sentimentScores) {
        content += `<p class="mt-2 text-xs text-gray-500 dark:text-gray-400">${t.sentimentActive}</p>`;
    }
        
    content += `<p class="mt-2">${t.mdpGamma} ${step.gamma?.toFixed(2) ?? '0.9'}</p>`;
    content += `<p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${t.mdpEpsilon} ${step.epsilon?.toFixed(4) ?? '0.001'}</p>`;

    stepDiv.innerHTML = content;
    return stepDiv;
}

function createInitialUtilitiesStep(step, patterns) {
    const t = translations[currentLanguage];
    const stepDiv = document.createElement("div");
    stepDiv.className = "bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600";

    let content = `<h4 class="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">${t.mdpStep4}</h4>`;
    
    content += `
        <div class="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <p class="font-semibold mb-1">${t.formulaLabel}</p>
            <p>${t.formulaInitialUtilities}</p>
            <p class="text-gray-500 text-xs mt-1">${t.formulaInitialUtilitiesNote}</p>
        </div>
    `;

    const goalState = window.currentGoalState || null;
    
    if (window.useSentiment && window.sentimentScores) {
        content += `<p class="mb-2 text-xs text-gray-500 dark:text-gray-400">${t.sentimentRewardInfo}</p>`;
    }

    const table = document.createElement("table");
    table.className = "w-full text-xs border-collapse";

    let headerHtml = '<th class="p-2 bg-gray-100 dark:bg-gray-600 text-left">' + t.mdpCurrentState + '</th>';
    if (window.useSentiment && window.sentimentScores) {
        headerHtml += '<th class="p-2 bg-gray-100 dark:bg-gray-600 text-right">🎭 Sentiment</th>';
    }
    headerHtml += '<th class="p-2 bg-gray-100 dark:bg-gray-600 text-right">' + t.mdpUtility + '</th>';
    
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = headerHtml;
    table.appendChild(headerRow);

    Object.entries(step.utilities).forEach(([filename, utility]) => {
        const pattern = patterns.find(p => p.filename === filename);
        const row = document.createElement("tr");
        
        let nameHtml = pattern.name;
        let iconHtml = '';
        
        if (filename === forcedStartPattern) {
            iconHtml = '<span class="text-red-500 mr-1" title="Štartovací vzor">🚩</span>';
        } else if (filename === goalState) {
            iconHtml = '<span class="text-green-600 mr-1" title="Cieľový vzor">🎯</span>';
        }
        
        nameHtml = `<span class="inline-flex items-center gap-1">${iconHtml}${pattern.name}</span>`;
        
        let rowHtml = `<td class="p-2 border-b border-gray-200 dark:border-gray-600">${nameHtml}<\/td>`;
        
        if (window.useSentiment && window.sentimentScores) {
            const sentiment = window.sentimentScores[filename] || 0;
            const sentimentClass = sentiment > 0.1 ? 'text-green-600' : (sentiment < -0.1 ? 'text-red-600' : 'text-gray-500');
            rowHtml += `<td class="p-2 border-b border-gray-200 dark:border-gray-600 text-right ${sentimentClass}">${(sentiment * 100).toFixed(0)}%<\/td>`;
        }
        
        rowHtml += `<td class="p-2 border-b border-gray-200 dark:border-gray-600 text-right">${utility.toFixed(3)}<\/td>`;
        
        row.innerHTML = rowHtml;
        table.appendChild(row);
    });

    stepDiv.innerHTML = content;
    stepDiv.appendChild(table);
    return stepDiv;
}

function createIterationStep(step, patterns) {
    const t = translations[currentLanguage];
    const stepDiv = document.createElement("div");
    stepDiv.className = "bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600";

    let content = `<h4 class="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">${t.mdpStep5} ${step.iteration}</h4>`;
    content += `<p class="mb-2 text-xs text-gray-600 dark:text-gray-400">${t.mdpMaxChange} ${step.maxChange.toFixed(4)}</p>`;

    content += `
        <div class="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <p class="font-semibold mb-1">${t.formulaLabel}</p>
            <p>${t.formulaBellman}</p>
            <p class="text-gray-500 text-xs mt-1">${t.formulaBellmanNote}</p>
        </div>
    `;

    const goalState = window.currentGoalState || null;

    const table = document.createElement("table");
    table.className = "w-full text-xs border-collapse";

    let headerHtml = '<th class="p-2 bg-gray-100 dark:bg-gray-600 text-left">' + t.mdpCurrentState + '</th>';
    if (window.useSentiment && window.sentimentScores) {
        headerHtml += '<th class="p-2 bg-gray-100 dark:bg-gray-600 text-right">🎭 Sentiment</th>';
    }
    headerHtml += '<th class="p-2 bg-gray-100 dark:bg-gray-600 text-right">' + t.mdpUtility + '</th>';
    
    const headerRow = document.createElement("tr");
    headerRow.innerHTML = headerHtml;
    table.appendChild(headerRow);

    Object.entries(step.utilities).forEach(([filename, utility]) => {
        const pattern = patterns.find(p => p.filename === filename);
        const row = document.createElement("tr");
        
        let nameHtml = pattern.name;
        let iconHtml = '';
        
        if (filename === forcedStartPattern) {
            iconHtml = '<span class="text-red-500 mr-1" title="Štartovací vzor">🚩</span>';
        } else if (filename === goalState) {
            iconHtml = '<span class="text-green-600 mr-1" title="Cieľový vzor">🎯</span>';
        }
        
        nameHtml = `<span class="inline-flex items-center gap-1">${iconHtml}${pattern.name}</span>`;
        
        let rowHtml = `<td class="p-2 border-b border-gray-200 dark:border-gray-600">${nameHtml}<\/td>`;
        
        if (window.useSentiment && window.sentimentScores) {
            const sentiment = window.sentimentScores[filename] || 0;
            const sentimentClass = sentiment > 0.1 ? 'text-green-600' : (sentiment < -0.1 ? 'text-red-600' : 'text-gray-500');
            rowHtml += `<td class="p-2 border-b border-gray-200 dark:border-gray-600 text-right ${sentimentClass}">${(sentiment * 100).toFixed(0)}%<\/td>`;
        }
        
        rowHtml += `<td class="p-2 border-b border-gray-200 dark:border-gray-600 text-right">${utility.toFixed(3)}<\/td>`;
        
        row.innerHTML = rowHtml;
        table.appendChild(row);
    });

    stepDiv.innerHTML = content;
    stepDiv.appendChild(table);
    return stepDiv;
}

function createConvergenceStep(step) {
    const t = translations[currentLanguage];
    const stepDiv = document.createElement("div");
    stepDiv.className = "bg-green-50 dark:bg-green-900 dark:bg-opacity-30 p-4 rounded-lg border border-green-200 dark:border-green-600";

    stepDiv.innerHTML = `
        <h4 class="font-semibold mb-2 text-green-600 dark:text-green-400">${t.mdpConvergence}</h4>
        <p>${t.mdpConverged} ${step.iterations} ${t.mdpIterations}</p>
    `;

    return stepDiv;
}

function createPolicyCalculationStep(step, patterns) {
    const t = translations[currentLanguage];
    const stepDiv = document.createElement("div");
    stepDiv.className = "bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600";

    let content = `<h4 class="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">${t.mdpStep6}</h4>`;
    content += `<p class="mb-2">${t.mdpPolicyCalculation}</p>`;

    content += `
        <div class="mb-3 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs">
            <p class="font-semibold mb-1">${t.formulaLabel}</p>
            <p>${t.formulaOptimalPolicy}</p>
            <p class="text-gray-500 text-xs mt-1">${t.formulaOptimalPolicyNote}</p>
        </div>
    `;

    const goalState = window.currentGoalState || null;

    const table = document.createElement("table");
    table.className = "w-full text-xs border-collapse";

    const headerRow = document.createElement("tr");
    headerRow.innerHTML = `
        <th class="p-2 bg-gray-100 dark:bg-gray-600 text-left">${t.mdpCurrentState}</th>
        <th class="p-2 bg-gray-100 dark:bg-gray-600 text-left">${t.mdpOptimalAction}</th>
    `;
    table.appendChild(headerRow);

    Object.entries(step.calculations).forEach(([state, calc]) => {
        const statePattern = patterns.find(p => p.filename === state);
        
        if (calc.bestAction === null) {
            const row = document.createElement("tr");
            
            let stateNameHtml = statePattern.name;
            let stateIconHtml = '';
            
            if (state === forcedStartPattern) {
                stateIconHtml = '<span class="text-red-500 mr-1" title="Štartovací vzor">🚩</span>';
            } else if (state === goalState) {
                stateIconHtml = '<span class="text-green-600 mr-1" title="Cieľový vzor">🎯</span>';
            }
            
            stateNameHtml = `<span class="inline-flex items-center gap-1">${stateIconHtml}${statePattern.name}</span>`;
            
            row.innerHTML = `
                <td class="p-2 border-b border-gray-200 dark:border-gray-600">${stateNameHtml}<\/td>
                <td class="p-2 border-b border-gray-200 dark:border-gray-600 text-gray-400 italic">—<\/td>
            `;
            table.appendChild(row);
        } else {
            const actionPattern = patterns.find(p => p.filename === calc.bestAction);
            
            if (actionPattern) {
                const row = document.createElement("tr");
                
                let stateNameHtml = statePattern.name;
                let stateIconHtml = '';
                
                if (state === forcedStartPattern) {
                    stateIconHtml = '<span class="text-red-500 mr-1" title="Štartovací vzor">🚩</span>';
                } else if (state === goalState) {
                    stateIconHtml = '<span class="text-green-600 mr-1" title="Cieľový vzor">🎯</span>';
                }
                
                stateNameHtml = `<span class="inline-flex items-center gap-1">${stateIconHtml}${statePattern.name}</span>`;
                
                let actionNameHtml = actionPattern.name;
                let actionIconHtml = '';
                
                if (calc.bestAction === forcedStartPattern) {
                    actionIconHtml = '<span class="text-red-500 mr-1" title="Štartovací vzor">🚩</span>';
                } else if (calc.bestAction === goalState) {
                    actionIconHtml = '<span class="text-green-600 mr-1" title="Cieľový vzor">🎯</span>';
                }
                
                actionNameHtml = `<span class="inline-flex items-center gap-1">${actionIconHtml}${actionPattern.name}</span>`;
                
                row.innerHTML = `
                    <td class="p-2 border-b border-gray-200 dark:border-gray-600">${stateNameHtml}<\/td>
                    <td class="p-2 border-b border-gray-200 dark:border-gray-600">${actionNameHtml}<\/td>
                `;
                table.appendChild(row);
            }
        }
    });

    stepDiv.innerHTML = content;
    stepDiv.appendChild(table);
    return stepDiv;
}

function createSequenceBuildStep(step, patterns) {
    const t = translations[currentLanguage];
    const stepDiv = document.createElement("div");
    stepDiv.className = "bg-white dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600";

    let content = `<h4 class="font-semibold mb-2 text-indigo-600 dark:text-indigo-400">${t.mdpStep7}</h4>`;
    content += `<p class="mb-2">${t.mdpSequenceBuild}</p>`;

    // Zistíme, ktorý vzor je cieľový (posledný v sekvencii)
    const goalPattern = step.steps[step.steps.length - 1].pattern;
    
    // Zistíme, ktorý vzor je štartovací (prvý v sekvencii) - ak je forcedStartPattern nastavený, použijeme ho
    const startPattern = step.steps[0].pattern;

    const list = document.createElement("ol");
    list.className = "list-decimal pl-5 space-y-1";

    step.steps.forEach((buildStep, index) => {
        const item = document.createElement("li");
        item.className = "text-sm flex items-center gap-2";
        
        // Pridáme ikonky pre štart a cieľ
        let iconHtml = '';
        if (buildStep.pattern.filename === startPattern.filename && forcedStartPattern === startPattern.filename) {
            // Štartovací vzor (len ak je forcedStartPattern nastavený)
            iconHtml = '<span class="text-red-500 mr-1" title="Štartovací vzor">🚩</span>';
        } else if (buildStep.pattern.filename === goalPattern.filename) {
            // Cieľový vzor
            iconHtml = '<span class="text-green-600 mr-1" title="Cieľový vzor">🎯</span>';
        }
        
        item.innerHTML = `${iconHtml} <strong>${buildStep.pattern.name}</strong> (${t.mdpUtility}: ${buildStep.utility.toFixed(3)})`;
        list.appendChild(item);
    });

    // Pridáme aj do finálnej sekvencie v texte
    let finalSequenceHtml = '';
    step.finalSequence.forEach((name, index) => {
        const pattern = patterns.find(p => p.name === name);
        if (index === 0 && forcedStartPattern === pattern?.filename) {
            finalSequenceHtml += `<span class="inline-flex items-center"><span class="text-red-500 mr-1">🚩</span>${name}</span>`;
        } else if (index === step.finalSequence.length - 1) {
            finalSequenceHtml += `<span class="inline-flex items-center"><span class="text-green-600 mr-1">🎯</span>${name}</span>`;
        } else {
            finalSequenceHtml += name;
        }
        if (index < step.finalSequence.length - 1) {
            finalSequenceHtml += ' → ';
        }
    });

    content += `<p class="mt-2 font-semibold">${t.mdpFinalSequence} ${finalSequenceHtml}</p>`;

    stepDiv.innerHTML = content;
    stepDiv.appendChild(list);
    return stepDiv;
}

// Pomocná funkcia: vytvorí kolapsovateľný obal pre stepDiv
function wrapAsCollapsible(stepDiv, headerTitle, collapsedSummary, defaultCollapsed = true) {
    // Vytvoríme hlavný wrapper
    const wrapper = document.createElement('div');
    wrapper.className = 'mdp-collapsible bg-transparent rounded-lg';
    // ARIA: aria-expanded true/false
    wrapper.setAttribute('role', 'region');

    // Header (clickable)
    const header = document.createElement('button');
    header.type = 'button';
    header.className = 'mdp-header w-full text-left rounded p-0';
    header.setAttribute('aria-controls', 'mdp-content-' + Math.random().toString(36).slice(2, 9));
    header.setAttribute('aria-expanded', String(!defaultCollapsed));

    // Title + summary
    const titleWrap = document.createElement('div');
    titleWrap.className = 'mdp-title';

    // small title label
    const titleEl = document.createElement('div');
    titleEl.className = 'font-medium mr-2 text-indigo-600 dark:text-indigo-400';
    titleEl.style.minWidth = '6rem';
    titleEl.textContent = headerTitle;

    const summaryEl = document.createElement('div');
    summaryEl.className = 'mdp-summary mdp-collapsed-summary';
    summaryEl.title = collapsedSummary || '';
    summaryEl.textContent = collapsedSummary || '';

    titleWrap.appendChild(titleEl);
    titleWrap.appendChild(summaryEl);

    // Arrow
    const arrow = document.createElement('span');
    arrow.className = 'mdp-arrow inline-block text-gray-500 dark:text-gray-300';
    arrow.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
        </svg>
    `;

    header.appendChild(titleWrap);
    header.appendChild(arrow);

    // Content wrapper
    const contentWrap = document.createElement('div');
    const contentId = header.getAttribute('aria-controls');
    contentWrap.id = contentId;
    contentWrap.className = 'mdp-content';
    contentWrap.setAttribute('aria-hidden', String(defaultCollapsed));

    // Presuneme stepDiv (ktorý obsahuje detail) dovnútra contentWrap
    contentWrap.appendChild(stepDiv);

    // Nastavíme počiatočný stav podľa defaultCollapsed
    if (!defaultCollapsed) {
        contentWrap.classList.add('expanded');
        wrapper.setAttribute('aria-expanded', 'true');
        header.setAttribute('aria-expanded', 'true');
        contentWrap.setAttribute('aria-hidden', 'false');
    } else {
        wrapper.setAttribute('aria-expanded', 'false');
        header.setAttribute('aria-expanded', 'false');
        contentWrap.setAttribute('aria-hidden', 'true');
    }

    // Toggle handler
    header.addEventListener('click', (ev) => {
        const expanded = wrapper.getAttribute('aria-expanded') === 'true';
        if (expanded) {
            // collapse
            wrapper.setAttribute('aria-expanded', 'false');
            header.setAttribute('aria-expanded', 'false');
            contentWrap.classList.remove('expanded');
            contentWrap.setAttribute('aria-hidden', 'true');
        } else {
            // expand
            wrapper.setAttribute('aria-expanded', 'true');
            header.setAttribute('aria-expanded', 'true');
            contentWrap.classList.add('expanded');
            contentWrap.setAttribute('aria-hidden', 'false');
            setTimeout(() => {
                contentWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }, 250);
        }
    });

    // Zložíme wrapper
    wrapper.appendChild(header);
    wrapper.appendChild(contentWrap);

    // Môžeš pridať medzeru medzi sekciami cez triedu outer
    wrapper.classList.add('p-2');

    return wrapper;
}