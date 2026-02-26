//markov.js

class MDPSequenceGenerator {
    constructor(similarityMatrix, patterns, gamma = 0.9, goalReward = 10.0, otherReward = 1.0, epsilon = 0.1) {
        this.similarityMatrix = similarityMatrix;
        this.patterns = patterns;
        this.states = patterns.map(p => p.filename);
        this.gamma = gamma;                       // ← použije sa zadaná hodnota
        this.goalReward = goalReward;              // ← nové
        this.otherReward = otherReward;            // ← nové
        this.epsilon = epsilon;                    // ← nové
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
        const totalSimilarities = this.states.map(state =>
            this.states.reduce((sum, other) => {
                if (state === other) return sum;
                return sum + (this.similarityMatrix[state][other] || 0);
            }, 0)
        );

        const maxIndex = totalSimilarities.indexOf(Math.max(...totalSimilarities));

        // výpočet cieľového stavu
        this.steps.push({
            type: 'goal_calculation',
            totalSimilarities: totalSimilarities.reduce((acc, similarity, index) => {
                acc[this.states[index]] = similarity;
                return acc;
            }, {}),
            goalState: this.states[maxIndex]
        });

        return this.states[maxIndex];
    }

    valueIteration(transitionMatrix, goalState, maxIterations = 100) {
        // Definujeme pevnú odmenu pre každý stav (reward)
        const reward = {};
        this.states.forEach(state => {
            reward[state] = state === goalState ? this.goalReward : this.otherReward;
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
        // 1. Nájdeme štartovací stav – ten s NAJNIŽŠOU utility (okrem cieľa)
        let startState = null;
        let minUtil = Infinity;
        for (const state of this.states) {
            if (state === goalState) continue;
            if (utilities[state] < minUtil) {
                minUtil = utilities[state];
                startState = state;
            }
        }
        // Ak existuje len jeden vzor, začneme cieľom
        if (!startState) startState = goalState;

        const sequence = [];
        const visited = new Set();
        let currentState = startState;
        const sequenceSteps = [];

        // 2. Kráčame podľa politiky, kým neprídeme do cieľa
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

            // Ďalší stav podľa politiky
            currentState = policy[currentState];
            if (!currentState) break; // bezpečnosť
        }

        // 3. Ak by sme náhodou nedošli do cieľa (napr. cyklus), pridáme ho
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
        const transitionMatrix = this.createTransitionMatrix(goalState);

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

async function generateSequence() {  // Odstráň parameter selectedFiles
    updateLoadingIndicator(0, 'Spúšťam analýzu...');
    await delay(100);

    try {
        // Načítanie hodnôt z inputov
        const gamma = parseFloat(document.getElementById('gammaInput').value) || 0.9;
        const goalReward = parseFloat(document.getElementById('goalRewardInput').value) || 10.0;
        const otherReward = parseFloat(document.getElementById('otherRewardInput').value) || 1.0;
        const epsilon = parseFloat(document.getElementById('epsilonInput').value) || 0.1;

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
            alert("Vyber aspoň jeden vzor!");
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

        console.log('Načítané vzory:', selectedPatterns.map(p => p.name));

        // Fáza 1: Výpočet matice podobnosti
        updateLoadingIndicator(20, 'Načítavam vzory...');
        await delay(100);

        updateLoadingIndicator(40, 'Analyzujem textové opisy...');
        await delay(100);

        const similarityCalculator = new PatternSimilarity();
        const similarityMatrix = similarityCalculator.calculateSimilarityMatrix(selectedPatterns);

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
            epsilon
        );

        const result = mdpGenerator.generateSequence();

        // Fáza 3: Zobrazenie výsledkov
        updateLoadingIndicator(90, 'Pripravujem výsledky...');
        await delay(300);

        displayPatternSequence(result.sequence, similarityMatrix);
        displaySimilarityMatrix(selectedPatterns, similarityMatrix);
        displayMDPSolution(result, selectedPatterns);

        document.getElementById("suggestionsSection").classList.remove("hidden");

        updateLoadingIndicator(100, 'Hotovo! Sekvencia vygenerovaná');
        await delay(1000);

    } catch (error) {
        alert('Chyba pri generovaní sekvencie: ' + error.message);
        updateLoadingIndicator(0, 'Chyba - skúste znova');

        setTimeout(() => {
            document.getElementById('loadingIndicatorBtn').classList.add('hidden');
            document.getElementById('loadingProgress').style.width = '0%';
        }, 2000);
    }
}

function displayPatternSequence(sequence, similarityMatrix) {
    const patternsList = document.getElementById("patternsList");
    patternsList.innerHTML = "";

    patternCount.textContent = sequence.length;

    // Uloženie pôvodnej sekvencie a matice
    originalSequence = [...sequence];
    originalSimilarityMatrix = JSON.parse(JSON.stringify(similarityMatrix));
    isSequenceReordered = false;

    sequence.forEach((pattern, index) => {
        const li = document.createElement("li");
        li.className = "pattern-item bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border border-gray-200 dark:border-gray-600 cursor-move";
        li.draggable = true;
        li.dataset.patternName = pattern.filename;

        // Výpočet podobnosti s predchádzajúcim vzorom
        let similarityHTML = '';
        if (index === 0) {
            // First pattern - show "-" instead of percentage
            similarityHTML = `
                <span class="text-xs bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 px-2 py-1 rounded">
                    -
                </span>
            `;
        } else {
            // Calculate similarity with previous pattern for other patterns
            const previousPattern = sequence[index - 1];
            const similarityWithPrevious = similarityMatrix[previousPattern.filename][pattern.filename] || 0;

            similarityHTML = `
                <span class="text-sm text-gray-500 similarity-badge" 
                      style="background-color: rgba(99, 102, 241, ${similarityWithPrevious * 0.5})">
                    ${(similarityWithPrevious * 100).toFixed(0)}%
                </span>
            `;
        }

        li.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <span class="font-semibold text-indigo-600 dark:text-indigo-400">${pattern.name}</span>
                    <span class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded ml-2">#${index + 1}</span>
                </div>
                <div class="flex items-center space-x-2">
                    <span class="text-xs bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 px-2 py-1 rounded">
                        ${pattern.language ? pattern.language.split('_')[0] : 'User'}
                    </span>
                    ${similarityHTML}
                </div>
            </div>
            <div class="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                ${pattern.content.substring(0, 150)}...
            </div>
        `;

        patternsList.appendChild(li);
    });

    initializeSortable();

    document.getElementById('resetSequenceBtn').classList.add('hidden');
    document.getElementById('copySequenceBtn').classList.remove('hidden');
}
