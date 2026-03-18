//markov.js

class MDPSequenceGenerator {
    constructor(similarityMatrix, patterns, gamma = 0.9, goalReward = 10.0, otherReward = 1.0, epsilon = 0.1, useSentiment = false, sentimentScores = {}) {
        this.similarityMatrix = similarityMatrix;
        this.patterns = patterns;
        this.states = patterns.map(p => p.filename);
        this.gamma = gamma;
        this.goalReward = goalReward;
        this.otherReward = otherReward;
        this.epsilon = epsilon;
        this.useSentiment = useSentiment;
        this.sentimentScores = sentimentScores;
        this.steps = [];
    }

    createTransitionMatrix(goalState) {
        const transitionMatrix = {};

        // kroky - PRIDÁME VŠETKY PARAMETRE
        this.steps.push({
            type: 'goal_state',
            goalState: goalState,
            goalPattern: this.patterns.find(p => p.filename === goalState),
            gamma: this.gamma,
            goalReward: this.goalReward,
            otherReward: this.otherReward,
            epsilon: this.epsilon
        });

        // Vypočítanie pre prechodovú maticu (bez zaznamenávania jednotlivých stavov)
        this.states.forEach(state => {
            transitionMatrix[state] = {};

            if (state === goalState) {
                this.states.forEach(nextState => {
                    transitionMatrix[state][nextState] = 0.0;
                });
            } else {
                const similarities = this.states.map(other =>
                    state === other ? 0 : (this.similarityMatrix[state][other] || 0)
                );
                const sum = similarities.reduce((a, b) => a + b, 0);

                this.states.forEach((nextState, j) => {
                    transitionMatrix[state][nextState] = sum > 0 ? similarities[j] / sum : 0;
                });
            }
        });

        return transitionMatrix;
    }

    determineGoalState() {

         // Ak je nastavený vynútený cieľový vzor a je medzi stavmi, použijeme ho
        if (forcedGoalPattern && this.states.includes(forcedGoalPattern)) {
            const forcedIndex = this.states.indexOf(forcedGoalPattern);
            
            // Zaznamenáme krok pre zobrazenie v UI
            this.steps.push({
                type: 'goal_calculation',
                totalSimilarities: {},
                goalState: forcedGoalPattern,
                forcedGoalUsed: true,
                forcedStartExcluded: (forcedStartPattern && this.states.includes(forcedStartPattern)) ? forcedStartPattern : null
            });
            
            return forcedGoalPattern;
        }

        // Vypočítame celkové podobnosti pre každý stav (súčet podobností so všetkými ostatnými)
        const totalSimilarities = this.states.map(state =>
            this.states.reduce((sum, other) => {
                if (state === other) return sum;
                return sum + (this.similarityMatrix[state][other] || 0);
            }, 0)
        );

        // Zoznam indexov všetkých stavov
        let candidateIndices = this.states.map((_, idx) => idx);

        // Ak existuje forcedStartPattern a je medzi stavmi, vylúčime ho z kandidátov na cieľ
        if (forcedStartPattern && this.states.includes(forcedStartPattern)) {
            candidateIndices = candidateIndices.filter(idx => this.states[idx] !== forcedStartPattern);
        }

        // Ak by po vylúčení nezostal žiadny kandidát (napr. keby bol len jeden vzor), vrátime sa k všetkým
        if (candidateIndices.length === 0) {
            candidateIndices = this.states.map((_, idx) => idx);
        }

        // Nájdeme index s najväčšou celkovou podobnosťou spomedzi kandidátov
        let maxIndex = candidateIndices[0];
        let maxVal = totalSimilarities[maxIndex];
        for (let i = 1; i < candidateIndices.length; i++) {
            const idx = candidateIndices[i];
            if (totalSimilarities[idx] > maxVal) {
                maxVal = totalSimilarities[idx];
                maxIndex = idx;
            }
        }

        const goalState = this.states[maxIndex];

        // Zaznamenáme krok pre zobrazenie v UI
        this.steps.push({
            type: 'goal_calculation',
            totalSimilarities: totalSimilarities.reduce((acc, similarity, index) => {
                acc[this.states[index]] = similarity;
                return acc;
            }, {}),
            goalState: goalState,
            forcedStartExcluded: (forcedStartPattern && this.states.includes(forcedStartPattern)) ? forcedStartPattern : null
        });

        return goalState;
    }

    valueIteration(transitionMatrix, goalState, maxIterations = 100) {
        // Definujeme pevnú odmenu pre každý stav (reward)
        const reward = {};
                this.states.forEach(state => {
                    // Základná odmena
                    let baseReward = state === goalState ? this.goalReward : this.otherReward;
                    
                    // Ak je zapnutý sentiment, upravíme odmenu
                    if (this.useSentiment && this.sentimentScores[state] !== undefined) {
                        const sentiment = this.sentimentScores[state];
                        // Sentiment upraví odmenu: pozitívny = vyššia odmena, negatívny = nižšia
                        // Škálujeme sentiment (-1..1) na faktor (0.5..1.5)
                        const sentimentFactor = 1.0 + (sentiment * 0.5);
                        baseReward *= sentimentFactor;
                    }
                    
                    reward[state] = baseReward;
                });

        // Počiatočné utility (môžu byť 0)
        let utilities = {};
        this.states.forEach(state => {
            utilities[state] = 0.0;
        });

        this.steps.push({
            type: 'initial_utilities',
            utilities: { ...utilities },
            gamma: this.gamma,
            goalReward: this.goalReward,
            otherReward: this.otherReward,
            epsilon: this.epsilon
        });

        for (let iteration = 0; iteration < maxIterations; iteration++) {
            const newUtilities = {};
            let maxChange = 0;

            this.states.forEach(state => {
                let expected = 0;
                this.states.forEach(nextState => {
                    const prob = transitionMatrix[state][nextState] || 0;
                    expected += prob * utilities[nextState];
                });

                newUtilities[state] = reward[state] + this.gamma * expected;

                const change = Math.abs(newUtilities[state] - utilities[state]);
                if (change > maxChange) maxChange = change;
            });

            this.steps.push({
                type: 'iteration',
                iteration: iteration + 1,
                utilities: { ...newUtilities },
                maxChange: maxChange
            });

            utilities = newUtilities;

            if (maxChange < this.epsilon) {
                this.steps.push({
                    type: 'convergence',
                    iterations: iteration + 1
                });
                break;
            }
        }

        return utilities;
    }

    calculateOptimalPolicy(transitionMatrix, utilities) {
        const policy = {};
        const policyCalculations = {};

        this.states.forEach(state => {
            let bestAction = null;
            let bestValue = -Infinity;
            const calculations = {};

            this.states.forEach(candidateNextState => {
                if (state === candidateNextState) return;
                const prob = transitionMatrix[state][candidateNextState] || 0;
                const value = prob * utilities[candidateNextState];
                calculations[candidateNextState] = {
                    probability: prob,
                    utility: utilities[candidateNextState],
                    value: value
                };

                if (value > bestValue) {
                    bestValue = value;
                    bestAction = candidateNextState;
                }
            });

            policy[state] = bestAction;
            policyCalculations[state] = {
                calculations: calculations,
                bestAction: bestAction,
                bestValue: bestValue
            };
        });

        // výpočet politiky
        this.steps.push({
            type: 'policy_calculation',
            calculations: policyCalculations
        });

        return policy;
    }

    buildSequence(policy, goalState, utilities) {
        

        // 1. Zistíme, či je vynútený štartovací vzor
        let startState = goalState; // predvolene
        
        if (forcedStartPattern && forcedStartPattern !== goalState) {
            // Použijeme vynútený štartovací vzor
            startState = forcedStartPattern;
            console.log('Používam vynútený štartovací vzor:', startState);
        } else {
            // Náhodný výber štartovacieho stavu (okrem cieľa)
            const nonGoalStates = this.states.filter(state => state !== goalState);
            if (nonGoalStates.length > 0) {
                const randomIndex = Math.floor(Math.random() * nonGoalStates.length);
                startState = nonGoalStates[randomIndex];
            }
        }

        // 2. Pre každý stav si pripravíme zoradené prechody z policyCalculations
        //    Tieto dáta už máme z calculateOptimalPolicy!
        const sortedTransitions = {};
        
        // Nájdeme policyCalculations z posledného kroku
        const policyStep = this.steps.find(step => step.type === 'policy_calculation');
        if (policyStep && policyStep.calculations) {
            Object.entries(policyStep.calculations).forEach(([state, calc]) => {
                // Zoradíme podľa hodnoty (value = prob * utility)
                const transitions = Object.entries(calc.calculations)
                    .map(([nextState, data]) => ({
                        nextState,
                        value: data.value
                    }))
                    .filter(t => t.value > 0.001) // len zmysluplné prechody
                    .sort((a, b) => b.value - a.value)
                    .map(t => t.nextState);
                
                sortedTransitions[state] = transitions;
            });
        }

        const sequence = [];
        const visited = new Set();
        let currentState = startState;
        const sequenceSteps = [];

        // 3. Kráčame podľa politiky, ale ak narazíme na cyklus, skúsime ďalšiu najlepšiu možnosť
        while (currentState && !visited.has(currentState)) {
            visited.add(currentState);
            const pattern = this.patterns.find(p => p.filename === currentState);
            sequence.push(pattern);

            sequenceSteps.push({
                state: currentState,
                pattern: pattern,
                utility: utilities[currentState],
                similarityToGoal: this.similarityMatrix[goalState][currentState] || 0
            });

            if (currentState === goalState) break;

            // Hľadáme najbližší nenavštívený stav podľa priority
            const possibleNextStates = sortedTransitions[currentState] || [];
            let nextState = null;
            
            for (const candidate of possibleNextStates) {
                if (!visited.has(candidate)) {
                    nextState = candidate;
                    break;
                }
            }

            if (nextState) {
                currentState = nextState;
            } else {
                // Ak už nie je žiadny nenavštívený prechod, skončíme
                break;
            }
        }

        // 4. Ak sme nedošli do cieľa, pridáme ho
        if (!visited.has(goalState)) {
            const goalPattern = this.patterns.find(p => p.filename === goalState);
            sequence.push(goalPattern);
            sequenceSteps.push({
                state: goalState,
                pattern: goalPattern,
                utility: utilities[goalState],
                similarityToGoal: 1.0
            });
        }

        // Zaznamenáme kroky pre zobrazenie
        this.steps.push({
            type: 'sequence_build',
            steps: sequenceSteps,
            finalSequence: sequence.map(p => p.name)
        });

        return sequence;
    }

    generateSequence() {
        // Reset krokov
        this.steps = [];

        const goalState = this.determineGoalState();
        window.currentGoalState = goalState;
        const transitionMatrix = this.createTransitionMatrix(goalState);

        this.transitionMatrix = transitionMatrix;

        this.steps.push({
            type: 'complete_transition_matrix',
            transitionMatrix: JSON.parse(JSON.stringify(transitionMatrix)),
            goalState: goalState
        });

        const utilities = this.valueIteration(transitionMatrix, goalState);
        const policy = this.calculateOptimalPolicy(transitionMatrix, utilities);
        const sequence = this.buildSequence(policy, goalState, utilities);

        return {
            sequence: sequence,
            steps: this.steps,
            goalState: goalState,
            transitionMatrix: transitionMatrix,
            utilities: utilities,
            policy: policy
        };
    }
}

function updateLoadingIndicator(progress, text) {
    const loadingIndicator = document.getElementById('loadingIndicatorBtn');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');

    if (progress === 0) {
        loadingIndicator.classList.remove('hidden');
        loadingProgress.style.width = '0%';
    }

    loadingProgress.style.width = `${progress}%`;
    loadingText.textContent = text;

    if (progress === 100) {
        setTimeout(() => {
            loadingIndicator.classList.add('hidden');
            loadingProgress.style.width = '0%';
        }, 1000); 
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateSequence() {  
    updateLoadingIndicator(0, 'Spúšťam analýzu...');
    await delay(100);

    try {
        // Načítanie hodnôt z inputov
        const gamma = parseFloat(document.getElementById('gammaInput').value) || 0.9;
        const goalReward = parseFloat(document.getElementById('goalRewardInput').value) || 10.0;
        const otherReward = parseFloat(document.getElementById('otherRewardInput').value) || 1.0;
        const epsilon = parseFloat(document.getElementById('epsilonInput').value) || 0.1;
        const useSentiment = document.getElementById('sentimentCheckbox')?.checked || false;
        
        // ★ NOVÉ: Zistenie, či je zaškrtnutý USE checkbox
        const useUSE = document.getElementById('useCheckbox')?.checked || false;
        const useIDF = document.getElementById('idfCheckbox')?.checked || false;

        // Zozbierame všetky zaškrtnuté vzory z globálneho stavu
        const selectedFiles = [];
        Object.keys(globalCheckedPatterns).forEach(catalogName => {
            Object.keys(globalCheckedPatterns[catalogName] || {}).forEach(filename => {
                if (globalCheckedPatterns[catalogName][filename]) {
                    selectedFiles.push(filename);
                }
            });
        });

        if (selectedFiles.length === 0) {
            showToast(translations[currentLanguage]?.selectAtLeastOnePattern || 'Vyber aspoň jeden vzor!', 'warning');
            updateLoadingIndicator(0, '');
            return;
        }

        // Skontrolujeme a vyfiltrujeme existujúce dáta
        const selectedPatterns = selectedFiles.map(file => {
            if (!allPatternsData[file]) {
                console.error('Chýbajúce dáta pre súbor:', file);
                return null;
            }
            return allPatternsData[file];
        }).filter(p => p !== null);

        if (selectedPatterns.length === 0) {
            throw new Error('Žiadne vybrané vzory (dáta nenájdené)');
        }

        languageColorMap = generateLanguageColors(selectedPatterns);
        window.languageColorMap = languageColorMap; // sprístupníme globálne

        // Fáza 1: Výpočet matice podobnosti
        updateLoadingIndicator(20, 'Načítavam vzory...');
        await delay(100);

        const similarityCalculator = new PatternSimilarity();
        let similarityMatrix;

        if (useUSE) {
            // Detailný loading pre USE - 3 fázy
            updateLoadingIndicator(30, 'Načítavam USE model...');
            await delay(100);
            
            updateLoadingIndicator(50, 'Generujem sémantické embeddingy...');
            await delay(100);
            
            // Overíme, či je USE model dostupný
            if (typeof use === 'undefined' || !use) {
                throw new Error('Universal Sentence Encoder nie je načítaný. Skontrolujte pripojenie k internetu.');
            }
            
            // Vytvoríme callback pre aktualizáciu loading textu počas výpočtu
            const updateUSEProgress = (msg) => {
                updateLoadingIndicator(60 + Math.floor(Math.random() * 20), msg);
            };
            
            similarityMatrix = await similarityCalculator.calculateUSESimilarityMatrix(selectedPatterns, updateUSEProgress);
            
            updateLoadingIndicator(80, 'Počítam maticu podobností...');
            await delay(100);
        } else {
            updateLoadingIndicator(40, 'Analyzujem textové opisy (TF-IDF)...');
            await delay(100);
            similarityMatrix = similarityCalculator.calculateSimilarityMatrix(selectedPatterns, useIDF);
        }

        // Výpočet sentiment skóre (ak je checkbox zapnutý)
        let sentimentScores = {};
        if (useSentiment && typeof getSentimentScores === 'function') {
            updateLoadingIndicator(50, 'Analyzujem sentiment...');
            await delay(100);
            sentimentScores = getSentimentScores(selectedPatterns);
        }

        // Fáza 2: Generovanie sekvencie pomocou MDP
        updateLoadingIndicator(60, 'Vypočítavam podobnosti...');
        await delay(100);

        updateLoadingIndicator(75, 'Optimalizujem sekvenciu...');
        await delay(100);

        const mdpGenerator = new MDPSequenceGenerator(
            similarityMatrix,
            selectedPatterns,
            gamma,
            goalReward,
            otherReward,
            epsilon,
            useSentiment,       
            sentimentScores       
        );

        const result = mdpGenerator.generateSequence();
        window.currentGoalState = result.goalState;

        // Fáza 3: Zobrazenie výsledkov
        updateLoadingIndicator(90, 'Pripravujem výsledky...');
        await delay(300);

        window.useSentiment = useSentiment;
        window.sentimentScores = sentimentScores;

        displayPatternSequence(result.sequence, similarityMatrix);
        displaySimilarityMatrixWithToggle(selectedPatterns, similarityMatrix);
        displayMDPSolution(result, selectedPatterns);

        document.getElementById("suggestionsSection").classList.remove("hidden");

        updateLoadingIndicator(100, 'Hotovo! Sekvencia vygenerovaná');

        evaluateWithAI(result.sequence, similarityMatrix);

    } catch (error) {
        showToast((translations[currentLanguage]?.sequenceGenerationError || 'Chyba pri generovaní sekvencie: ') + error.message, 'error');
        updateLoadingIndicator(0, 'Chyba - skúste znova');

        setTimeout(() => {
            document.getElementById('loadingIndicatorBtn').classList.add('hidden');
            document.getElementById('loadingProgress').style.width = '0%';
        }, 2000);
    }
}

// event listenery pre vzájomnú elimináciu checkboxov
document.addEventListener('DOMContentLoaded', () => {
    const useCheckbox = document.getElementById('useCheckbox');
    const idfCheckbox = document.getElementById('idfCheckbox');
    
    if (useCheckbox && idfCheckbox) {
        // USE zmena
        useCheckbox.addEventListener('change', function() {
            if (this.checked) {
                idfCheckbox.checked = false;
            }
        });
        
        // IDF zmena
        idfCheckbox.addEventListener('change', function() {
            if (this.checked) {
                useCheckbox.checked = false;
            }
        });
    }
});

function displayPatternSequence(sequence, similarityMatrix) {
    const patternsList = document.getElementById("patternsList");
    patternsList.innerHTML = "";

    patternCount.textContent = sequence.length;

    // Uloženie pôvodnej sekvencie a matice
    originalSequence = [...sequence];
    originalSimilarityMatrix = JSON.parse(JSON.stringify(similarityMatrix));
    isSequenceReordered = false;
    window.originalSimilarityMatrix = originalSimilarityMatrix; 

    sequence.forEach((pattern, index) => {
        const li = document.createElement("li");
        li.className = "pattern-item group";
        li.draggable = true;
        li.dataset.patternName = pattern.filename;

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-pattern-btn';
        removeBtn.innerHTML = '✕';
        removeBtn.setAttribute('aria-label', 'Odstrániť vzor zo sekvencie');
        removeBtn.setAttribute('data-filename', pattern.filename);
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            removePatternFromSequence(removeBtn);
        });
        li.appendChild(removeBtn);

        // Výpočet podobnosti s predchádzajúcim vzorom
        let similarityHTML = '';
        if (index === 0) {
            similarityHTML = `
                <span class="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                    -
                </span>
            `;
        } else {
            const previousPattern = sequence[index - 1];
            const similarityWithPrevious = similarityMatrix[previousPattern.filename][pattern.filename] || 0;
            const percent = similarityWithPrevious * 100;
            const colors = getConfidenceColor(percent);
            
            similarityHTML = `
                <span class="text-xs similarity-badge px-2 py-1 rounded" 
                      style="background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border};">
                    ${(similarityWithPrevious * 100).toFixed(0)}%
                </span>
            `;
        }

        let catalogName = 'C & H';
        let isUserCatalog = false;
        let languageName = '';

        if (pattern.catalogName) {
            // Vzor z user katalógu
            catalogName = pattern.catalogName;
            isUserCatalog = true;
            // language je názov subfoldra, zobrazíme ho samostatne
            if (pattern.language && pattern.language !== 'Ostatné') {
                languageName = pattern.language;
            }
        } else if (pattern.language) {
            // Coplien vzor
            languageName = pattern.language.replace(/_/g, ' ');
        }

        // Vytvorenie badgeov pre katalóg a jazyk
        const catalogBadge = `
            <span class="px-2 py-1 rounded-full text-xs font-medium ${
                !isUserCatalog 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }">
                ${catalogName}
            </span>
        `;

        let languageBadge = '';
        if (languageName) {
            const bgColor = window.languageColorMap?.[pattern.language] || '#8b5cf6';
            const isDark = document.documentElement.classList.contains('dark');
            const textColorClass = isDark ? 'text-gray-200' : 'text-white';
            
            languageBadge = `
                <span class="px-2 py-1 rounded-full text-xs font-medium ${textColorClass}" 
                    style="background-color: ${bgColor};">
                    ${languageName}
                </span>
            `;
        }

        // Obsahová časť - bez textu vzoru
        const contentDiv = document.createElement('div');
        contentDiv.className = "pattern-content";
        contentDiv.innerHTML = `
            <div class="flex justify-between items-start">
                <div class="flex items-center gap-2">
                    <span class="font-semibold text-indigo-600 dark:text-indigo-400">${pattern.name}</span>
                    <span class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded">#${index + 1}</span>
                </div>
                ${similarityHTML}
            </div>
            <div class="flex flex-wrap items-center gap-2 mt-2">
                ${catalogBadge}
                ${languageBadge}
            </div>
        `;

        // Tlačidlo
        const button = document.createElement('button');
        button.className = "view-pattern-btn";
        button.setAttribute('data-filename', pattern.filename);
        button.setAttribute('data-index', index);
        button.setAttribute('title', translations[currentLanguage]?.patternDetailViewButton || 'Zobraziť podrobnosti');
        button.innerHTML = `
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
            </svg>
        `;

        li.appendChild(contentDiv);
        li.appendChild(button);
        patternsList.appendChild(li);
    });

    // Pridáme event listenery pre tlačidlá detailu
    document.querySelectorAll('.view-pattern-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            const filename = btn.dataset.filename;
            const index = parseInt(btn.dataset.index);
            showPatternDetail(filename, index, sequence, similarityMatrix);
        });
    });

    // Výpočet celkovej spoľahlivosti
    let totalSim = 0;
    let count = 0;
    for (let i = 1; i < sequence.length; i++) {
        const prev = sequence[i-1];
        const curr = sequence[i];
        const sim = similarityMatrix[prev.filename][curr.filename] || 0;
        totalSim += sim;
        count++;
    }
    const avgConfidence = count > 0 ? (totalSim / count) * 100 : 0;
    const confidenceValue = document.getElementById('confidenceValue');
    if (confidenceValue) {
        confidenceValue.textContent = avgConfidence.toFixed(1) + '%';
        
        const colors = getConfidenceColor(avgConfidence);
        confidenceValue.style.background = colors.bg;
        confidenceValue.style.color = colors.text;
        confidenceValue.style.borderColor = colors.border;
        confidenceValue.style.borderWidth = '1px';
        confidenceValue.style.borderStyle = 'solid';
    }

    initializeSortable();
    document.getElementById('resetSequenceBtn').classList.add('hidden');
    document.getElementById('copySequenceBtn').classList.remove('hidden');
}

function removePatternFromSequence(btn) {
    const li = btn.closest('.pattern-item');
    if (!li) return;
    
    li.remove();
    
    const remainingItems = document.querySelectorAll('#patternsList .pattern-item');
    document.getElementById('patternCount').textContent = remainingItems.length;
    
    updateSimilaritiesAfterRemoval();
    updateOverallConfidenceFromDOM();
    
    isSequenceReordered = true;
    document.getElementById('resetSequenceBtn').classList.remove('hidden');
}

function updateSimilaritiesAfterRemoval() {
    const items = document.querySelectorAll('#patternsList .pattern-item');
    for (let i = 1; i < items.length; i++) {
        const prevFilename = items[i-1].dataset.patternName;
        const currFilename = items[i].dataset.patternName;
        const similarity = originalSimilarityMatrix[prevFilename]?.[currFilename] || 0;
        const percent = similarity * 100;
        const colors = getConfidenceColor(percent);
        
        const badgeSpan = items[i].querySelector('.similarity-badge');
        if (badgeSpan) {
            badgeSpan.textContent = percent.toFixed(0) + '%';
            badgeSpan.style.background = colors.bg;
            badgeSpan.style.color = colors.text;
            badgeSpan.style.borderColor = colors.border;
        }
    }
    // Prvý vzor má pomlčku
    if (items.length > 0) {
        const firstBadge = items[0].querySelector('.similarity-badge');
        if (firstBadge) {
            firstBadge.textContent = '-';
            firstBadge.style.background = '';
            firstBadge.style.color = '';
            firstBadge.style.borderColor = '';
        }
    }
}

function updateOverallConfidenceFromDOM() {
    const listItems = document.querySelectorAll('#patternsList .pattern-item');
    const currentOrder = Array.from(listItems).map(item => item.dataset.patternName);
    if (currentOrder.length < 2) {
        document.getElementById('confidenceValue').textContent = '0%';
        return;
    }

    let totalSim = 0;
    for (let i = 1; i < currentOrder.length; i++) {
        const prev = currentOrder[i-1];
        const curr = currentOrder[i];
        const sim = originalSimilarityMatrix[prev]?.[curr] || 0;
        totalSim += sim;
    }
    const avg = (totalSim / (currentOrder.length - 1)) * 100;
    const confidenceValue = document.getElementById('confidenceValue');
    confidenceValue.textContent = avg.toFixed(1) + '%';
    
    // Nastav farbu podľa hodnoty
    const colors = getConfidenceColor(avg);
    confidenceValue.style.background = colors.bg;
    confidenceValue.style.color = colors.text;
    confidenceValue.style.borderColor = colors.border;
    confidenceValue.style.borderWidth = '1px';
    confidenceValue.style.borderStyle = 'solid';
}

function getConfidenceColor(percent) {
    // percent je 0-100
    // HSL pre plynulý prechod: červená (0°), oranžová (30°), žltá (60°), zelená (120°)
    
    const p = Math.min(100, Math.max(0, percent)) / 100; // 0-1
    
    // Pre light mode
    if (!document.documentElement.classList.contains('dark')) {
        // Prechod cez HSL pre plynulé farby
        if (p < 0.25) {
            // Červená -> oranžová (0-25%)
            const t = p / 0.25; // 0-1
            const hue = 0 + (30 * t); // 0° -> 30°
            return {
                bg: `hsl(${hue}, 100%, 95%)`,
                text: `hsl(${hue}, 80%, 30%)`,
                border: `hsl(${hue}, 80%, 70%)`
            };
        } else if (p < 0.5) {
            // Oranžová -> žltá (25-50%)
            const t = (p - 0.25) / 0.25; // 0-1
            const hue = 30 + (30 * t); // 30° -> 60°
            return {
                bg: `hsl(${hue}, 100%, 92%)`,
                text: `hsl(${hue}, 80%, 30%)`,
                border: `hsl(${hue}, 80%, 65%)`
            };
        } else if (p < 0.75) {
            // Žltá -> svetlozelená (50-75%)
            const t = (p - 0.5) / 0.25; // 0-1
            const hue = 60 + (30 * t); // 60° -> 90°
            return {
                bg: `hsl(${hue}, 90%, 90%)`,
                text: `hsl(${hue}, 80%, 25%)`,
                border: `hsl(${hue}, 70%, 60%)`
            };
        } else {
            // Svetlozelená -> zelená (75-100%)
            const t = (p - 0.75) / 0.25; // 0-1
            const hue = 90 + (30 * t); // 90° -> 120°
            return {
                bg: `hsl(${hue}, 85%, 88%)`,
                text: `hsl(${hue}, 80%, 25%)`,
                border: `hsl(${hue}, 70%, 55%)`
            };
        }
    } 
    // Pre dark mode
    else {
        if (p < 0.25) {
            // Tmavo červená -> tmavo oranžová
            const t = p / 0.25;
            const hue = 0 + (30 * t);
            return {
                bg: `hsl(${hue}, 70%, 20%)`,
                text: `hsl(${hue}, 90%, 85%)`,
                border: `hsl(${hue}, 70%, 35%)`
            };
        } else if (p < 0.5) {
            // Tmavo oranžová -> tmavo žltá
            const t = (p - 0.25) / 0.25;
            const hue = 30 + (30 * t);
            return {
                bg: `hsl(${hue}, 70%, 22%)`,
                text: `hsl(${hue}, 90%, 85%)`,
                border: `hsl(${hue}, 70%, 38%)`
            };
        } else if (p < 0.75) {
            // Tmavo žltá -> tmavo zelenkavá
            const t = (p - 0.5) / 0.25;
            const hue = 60 + (30 * t);
            return {
                bg: `hsl(${hue}, 65%, 20%)`,
                text: `hsl(${hue}, 85%, 85%)`,
                border: `hsl(${hue}, 65%, 35%)`
            };
        } else {
            // Tmavo zelenkavá -> tmavo zelená
            const t = (p - 0.75) / 0.25;
            const hue = 90 + (30 * t);
            return {
                bg: `hsl(${hue}, 65%, 18%)`,
                text: `hsl(${hue}, 85%, 85%)`,
                border: `hsl(${hue}, 65%, 32%)`
            };
        }
    }
}

// Funkcia pre zobrazenie detailu vzoru
function showPatternDetail(filename, position, sequence, similarityMatrix) {
    const modal = document.getElementById('patternDetailModal');
    if (!modal) return;
    
    const t = translations[currentLanguage];

    // Nájdeme pattern podľa filename
    const pattern = allPatternsData[filename];
    if (!pattern) {
        showToast('Nepodarilo sa načítať dáta vzoru', 'error');
        return;
    }

    // Uložíme dáta pre neskoršie použitie vo filtroch
    modal.dataset.currentFilename = filename;
    modal.dataset.currentPosition = position;
    modal.dataset.currentSequence = JSON.stringify(sequence.map(p => p.filename));
    
    // RESET FILTRA - vždy nastavíme na "Všetky" pri otvorení
    const filterAllBtn = document.getElementById('filterAllPatternsBtn');
    const filterSeqBtn = document.getElementById('filterSequenceBtn');
    
    // Reset štýlov na predvolené
    const resetButtonsStyle = () => {
        filterAllBtn.className = 'px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium transition-all duration-200';
        filterSeqBtn.className = 'px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium transition-all duration-200';
    };
    
    resetButtonsStyle();
    // Nastavíme "Všetky" ako aktívne
    filterAllBtn.className = 'px-3 py-1 text-xs rounded-full bg-indigo-600 text-white font-medium transition-all duration-200';
    
    // Aktualizácia textov tlačidiel
    if (filterAllBtn) filterAllBtn.textContent = t.patternDetailFilterAll || 'Všetky';
    if (filterSeqBtn) filterSeqBtn.textContent = t.patternDetailFilterSequence || 'Len sekvencia';

    // Aktualizácia nadpisov - používame ID, nie querySelector
    document.getElementById('patternDetailName').textContent = pattern.name;
    
    const headers = modal.querySelectorAll('h4');
    if (headers.length >= 3) {
        if (headers[0]) headers[0].textContent = t.patternDetailBasicInfo || 'Základné informácie';
        if (headers[1]) headers[1].textContent = t.patternDetailFullText || 'Celý text vzoru';
        if (headers[2]) headers[2].textContent = t.patternDetailSimilarities || 'Podobnosti s ostatnými vzormi';
    }

    // Základné informácie
    document.getElementById('patternDetailFullName').textContent = pattern.name;
    document.getElementById('patternDetailFilename').textContent = pattern.filename;
    document.getElementById('patternDetailPosition').textContent = `#${position + 1} z ${sequence.length}`;
    document.getElementById('patternDetailContent').textContent = pattern.content;

    // Badges (katalóg a jazyk)
    const badgesContainer = document.getElementById('patternDetailBadges');
    badgesContainer.innerHTML = '';

    let catalogName = 'C & H';
    let isUserCatalog = false;
    let languageName = '';

    if (pattern.catalogName) {
        // Vzor z user katalógu
        catalogName = pattern.catalogName;
        isUserCatalog = true;
        // language je názov subfoldra
        if (pattern.language && pattern.language !== 'Ostatné') {
            languageName = pattern.language;
        }
    } else if (pattern.language) {
        // Coplien vzor
        languageName = pattern.language.replace(/_/g, ' ');
    }

    // Katalóg badge
    const catalogBadge = document.createElement('span');
    catalogBadge.className = `px-3 py-1 rounded-full text-xs font-medium ${
        !isUserCatalog 
            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
    }`;
    catalogBadge.textContent = catalogName;
    badgesContainer.appendChild(catalogBadge);

    // Jazyk badge (ak existuje) - s farbou podľa languageColorMap
    if (languageName) {
        const langBadge = document.createElement('span');
        
        // Získame farbu z mapy, alebo použijeme predvolenú fialovú
        const bgColor = window.languageColorMap?.[pattern.language] || '#8b5cf6'; // predvolená fialová
        
        // Pre dark mode použijeme svetlejší text
        const isDark = document.documentElement.classList.contains('dark');
        const textColorClass = isDark ? 'text-gray-200' : 'text-white';
        
        langBadge.className = `px-3 py-1 rounded-full text-xs font-medium ${textColorClass}`;
        langBadge.style.backgroundColor = bgColor;
        langBadge.textContent = languageName;
        
        // Pridáme data attribute pre prípadnú neskoršiu manipuláciu
        langBadge.setAttribute('data-language-badge', 'true');
        
        badgesContainer.appendChild(langBadge);
    }

    // Podobnosť s predchádzajúcim vzorom
    const prevSimilaritySpan = document.getElementById('patternDetailPreviousSimilarity');
    if (position > 0) {
        const prevPattern = sequence[position - 1];
        const similarity = similarityMatrix[prevPattern.filename]?.[filename] || 0;
        const percent = similarity * 100;
        const colors = getConfidenceColor(percent);
        prevSimilaritySpan.innerHTML = `<span style="background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border};" class="px-2 py-1 rounded text-xs">${percent.toFixed(1)}%</span>`;
    } else {
        prevSimilaritySpan.innerHTML = `<span class="text-gray-500 dark:text-gray-400 text-xs">${t.patternDetailFirstPattern || 'Prvý vzor v sekvencii'}</span>`;
    }

    // Funkcia na zobrazenie podobností podľa filtra
    function renderSimilarities(filterType) {
        // ZÍSKAME VŠETKY VYBRANÉ VZORY (z globCheckedPatterns)
        const allSelectedPatterns = [];
        Object.keys(globalCheckedPatterns).forEach(catalogName => {
            Object.keys(globalCheckedPatterns[catalogName] || {}).forEach(f => {
                if (globalCheckedPatterns[catalogName][f] && allPatternsData[f]) {
                    allSelectedPatterns.push(allPatternsData[f]);
                }
            });
        });

        // Filtrovanie podľa typu
        let patternsToShow = [];
        if (filterType === 'sequence') {
            // Iba vzory v sekvencii
            patternsToShow = sequence;
        } else {
            // Všetky vybrané vzory
            patternsToShow = allSelectedPatterns;
        }

        const similaritiesContainer = document.getElementById('patternDetailSimilarities');
        similaritiesContainer.innerHTML = '';

        const similarities = [];
        patternsToShow.forEach((p, idx) => {
            if (p.filename !== filename) {
                const sim = similarityMatrix[filename]?.[p.filename] || 0;
                
                // Zistíme, či je vzor v sekvencii
                const seqIndex = sequence.findIndex(s => s.filename === p.filename);
                
                // Určíme, či je pred/po LEN AK je v sekvencii
                let isNext = false;
                let isPrev = false;
                if (seqIndex !== -1) {
                    isNext = seqIndex === position + 1;
                    isPrev = seqIndex === position - 1;
                }
                
                similarities.push({
                    name: p.name,
                    similarity: sim,
                    filename: p.filename,
                    isNext: isNext,
                    isPrev: isPrev,
                    inSequence: seqIndex !== -1
                });
            }
        });

        // Zoradenie podľa podobnosti (od najväčšej)
        similarities.sort((a, b) => b.similarity - a.similarity);

        if (similarities.length === 0) {
            const emptyMsg = document.createElement('div');
            emptyMsg.className = 'text-gray-500 dark:text-gray-400 text-sm italic text-center py-4';
            emptyMsg.textContent = t.patternDetailNoSimilarities || 'Žiadne podobnosti s ostatnými vzormi';
            similaritiesContainer.appendChild(emptyMsg);
        } else {
            similarities.forEach(sim => {
                const percent = sim.similarity * 100;
                const colors = getConfidenceColor(percent);
                
                const item = document.createElement('div');
                item.className = `flex justify-between items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors`;
                
                const nextLabel = t.patternDetailNextLabel || '(nasledujúci)';
                const prevLabel = t.patternDetailPrevLabel || '(predchádzajúci)';
                
                // Zobrazíme označenie LEN AK je vzor v sekvencii a je pred/po
                let labelHtml = '';
                if (sim.inSequence) {
                    if (sim.isNext) labelHtml = `<span class="text-xs text-indigo-600 dark:text-indigo-400 ml-2">${nextLabel}</span>`;
                    if (sim.isPrev) labelHtml = `<span class="text-xs text-indigo-600 dark:text-indigo-400 ml-2">${prevLabel}</span>`;
                }
                
                // Pre lepšiu prehľadnosť môžeme pridať indikátor, že vzor nie je v sekvencii
                let notInSequenceHtml = '';
                if (!sim.inSequence && filterType === 'all') {
                    notInSequenceHtml = `<span class="text-xs text-gray-400 dark:text-gray-500 ml-2">${t.patternDetailNotInSequence || '(mimo sekvencie)'}</span>`;
                }
                
                item.innerHTML = `
                    <div class="flex items-center gap-2">
                        <span class="text-sm text-gray-700 dark:text-gray-300">${sim.name}</span>
                        ${labelHtml}
                        ${notInSequenceHtml}
                    </div>
                    <span class="text-sm font-medium similarity-badge px-2 py-1 rounded" 
                        style="background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border};">
                        ${percent.toFixed(1)}%
                    </span>
                `;
                
                similaritiesContainer.appendChild(item);
            });
        }
    }

    // Štandardne zobrazíme všetky
    renderSimilarities('all');

    // Event listenery pre tlačidlá
    const allBtn = document.getElementById('filterAllPatternsBtn');
    const seqBtn = document.getElementById('filterSequenceBtn');

    allBtn.onclick = () => {
        resetButtonsStyle();
        allBtn.className = 'px-3 py-1 text-xs rounded-full bg-indigo-600 text-white font-medium transition-all duration-200';
        renderSimilarities('all');
    };

    seqBtn.onclick = () => {
        resetButtonsStyle();
        seqBtn.className = 'px-3 py-1 text-xs rounded-full bg-indigo-600 text-white font-medium transition-all duration-200';
        renderSimilarities('sequence');
    };

    // Zobrazenie modálu
    modal.classList.remove('hidden');

    // Event listener pre zatvorenie
    const closeModal = () => modal.classList.add('hidden');
    
    document.getElementById('closePatternDetailModal').onclick = closeModal;
    
    // Zatvorenie kliknutím mimo modál
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };

    // ESC klávesa
    const escHandler = (e) => {
        if (e.key === 'Escape') {
            closeModal();
            document.removeEventListener('keydown', escHandler);
        }
    };
    document.addEventListener('keydown', escHandler);
}
