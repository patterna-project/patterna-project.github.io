//utils/scripts.js

let sortableInstance = null;
let allPatternsData = {};
let currentCatalog = 'coplien';
let userCatalogs = {};
let originalSequence = []; 
let originalSimilarityMatrix = {}; 
let isSequenceReordered = false; 
let globalCheckedPatterns = {}; // { "catalogName": { "filename1": true, "filename2": true } }
let forcedStartPattern = null; // filename vzoru, ktorý má byť štartovací
let forcedGoalPattern = null;
let languageColorMap = {};


const patternLanguages = {
    "Agile_Practices_Pattern_Language": [
        "daily_standup.txt",
        "sprint_planning.txt",
        "retrospective.txt"
    ],
    "Architectural_Pattern_Language": [
        "layered_architecture.txt",
        "microservices_basics.txt",
        "event_driven.txt"
    ],
    "Software_Design_Pattern_Language": [
        "singleton_demo.txt",
        "factory_method_demo.txt",
        "observer_demo.txt"
    ],
    "Testing_Pattern_Language": [
        "unit_testing.txt",
        "integration_testing.txt",
        "test_driven_development.txt"
    ]
};

// ========== MODAL ==========

document.getElementById('loadCatalogBtn').addEventListener('click', () => {
    // Reset inputov a validácie
    document.getElementById('catalogName').value = '';
    document.getElementById('catalogFolderInput').value = '';

    // Reset error state
    const errorElement = document.getElementById('catalogNameError');
    errorElement.classList.add('hidden');
    errorElement.textContent = '';

    const catalogNameInput = document.getElementById('catalogName');
    catalogNameInput.classList.remove('border-red-500', 'focus:ring-red-500');
    catalogNameInput.classList.add('border-gray-300', 'focus:ring-indigo-500');

    const confirmBtn = document.getElementById('confirmCatalog');
    confirmBtn.disabled = true;
    confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
    confirmBtn.classList.remove('hover:bg-indigo-700');
    openModal('catalogModal');
});

document.getElementById('confirmCatalog').addEventListener('click', async () => {
    const catalogNameInput = document.getElementById('catalogName');
    const folderInput = document.getElementById('catalogFolderInput');
    const errorElement = document.getElementById('catalogNameError');
    const t = translations[currentLanguage];

    const catalogName = catalogNameInput.value.trim();
    const errors = validateCatalogName(catalogName);

    if (errors.length > 0) {
        errorElement.textContent = errors[0];
        errorElement.classList.remove('hidden');
        catalogNameInput.classList.add('border-red-500', 'focus:ring-red-500');
        return;
    }

    if (!folderInput.files || folderInput.files.length === 0) {
        showToast(t.selectFolder || 'Vyberte priečinok s txt súbormi', 'warning');
        return;
    }

    document.getElementById('loadingIndicator').classList.remove('hidden');

    try {
        // Nová štruktúra: { "názov subfoldra": { "subor.txt": "obsah", ... } }
        const catalogStructure = {};
        const files = Array.from(folderInput.files).filter(file => 
            file.name.toLowerCase().endsWith('.txt')
        );

        if (files.length === 0) {
            showToast(t.noTxtFiles || 'Priečinok neobsahuje žiadne txt súbory', 'warning');
            return;
        }

        // Spracujeme každý súbor a zachováme cestu
        for (const file of files) {
            try {
                const content = await readFileAsText(file);
                
                // Získame relatívnu cestu k súboru (napr. "GoF/Structural_Patterns/adapter.txt")
                const relativePath = file.webkitRelativePath || file.name;
                const pathParts = relativePath.split('/');
                
                let folderName = 'Ostatné'; // predvolené
                let fileName = file.name;
                
                if (pathParts.length > 2) {
                    // Prvý part je koreňový priečinok (GoF), druhý je subfolder (Structural_Patterns)
                    folderName = pathParts[1];
                    // Zvyšok cesty (ak by boli ešte hlbšie) – stačí nám názov súboru
                    fileName = pathParts.slice(2).join('/');
                } else if (pathParts.length === 2) {
                    // Iba koreň + súbor, žiadny subfolder
                    folderName = 'Ostatné';
                    fileName = pathParts[1];
                } // else len názov súboru (starý spôsob) – folderName ostáva 'Ostatné'
                
                // Inicializujeme folder v štruktúre ak ešte neexistuje
                if (!catalogStructure[folderName]) {
                    catalogStructure[folderName] = {};
                }
                
                // Pridáme súbor do správneho foldra
                catalogStructure[folderName][file.name] = content;
                
            } catch (fileError) {
                console.warn('Chyba pri čítaní súboru:', file.name, fileError);
                continue;
            }
        }

        // Skontrolujeme či máme aspoň nejaké súbory
        const totalFiles = Object.values(catalogStructure).reduce(
            (sum, folder) => sum + Object.keys(folder).length, 0
        );
        
        if (totalFiles === 0) {
            showToast(t.failedToLoadFiles || 'Nepodarilo sa načítať žiadne txt súbory', 'error');
            return;
        }

        // Uložíme katalóg aj so štruktúrou
        userCatalogs[catalogName] = {
            name: catalogName,
            structure: catalogStructure,  // Tu máme { folder: { files } }
            totalPatterns: totalFiles
        };

        const successMsg = (t.catalogUploadSuccess || 'Katalóg "{catalogName}" bol úspešne nahraný')
            .replace('{catalogName}', catalogName);
        showToast(successMsg, 'success', 4000);
        closeModal('catalogModal');
        document.getElementById('catalogName').value = '';
        folderInput.value = '';

        // Reset validation state
        errorElement.classList.add('hidden');
        catalogNameInput.classList.remove('border-red-500', 'focus:ring-red-500');
        catalogNameInput.classList.add('border-gray-300', 'focus:ring-indigo-500');
        document.getElementById('confirmCatalog').disabled = false;
        document.getElementById('confirmCatalog').classList.remove('opacity-50', 'cursor-not-allowed');

        switchToUserCatalog(catalogName);

    } catch (err) {
        showToast((t.catalogLoadError || 'Chyba pri načítaní katalógu: ') + err.message, 'error');
    } finally {
        document.getElementById('loadingIndicator').classList.add('hidden');
    }
});

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = e => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

// ========== UI CONTROLS ==========

document.getElementById('clearBtn').addEventListener('click', () => {
    const t = translations[currentLanguage]; 

    globalCheckedPatterns = {};

    // 1. Zruší všetky zvolené checkboxy
    const checkboxes = document.querySelectorAll('#patternCheckboxes input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);
    forcedStartPattern = null;
    forcedGoalPattern = null;
    updateStartFlags(); // Aktualizujeme vlajočky
    updateGoalFlags();

    // 2. Vymaže navrhnutú sekvenciu
    const patternsList = document.getElementById('patternsList');
    patternsList.innerHTML = '';

    // 3. Skryje sekciu navrhnutej sekvencie
    document.getElementById('suggestionsSection').classList.add('hidden');

    // 4. Vymaže maticu podobností
    document.getElementById('similarityMatrix').innerHTML = '';
    document.getElementById('similarityInfo').classList.add('hidden');

    document.getElementById('similarityMatrix').innerHTML = '';
    const graphDiv = document.getElementById('similarityGraph');
    if (graphDiv) {
        graphDiv.innerHTML = ''; // Vyčistíme graf
    }

    // 5. Vymaže postup MDP riešenia
    const mdpSolution = document.getElementById('mdpSolution');
    const mdpSteps = document.getElementById('mdpSteps');
    if (mdpSolution) mdpSolution.classList.add('hidden');
    if (mdpSteps) mdpSteps.innerHTML = '';

    // 5a. VYMAŽEME AJ ULOŽENÉ MDP DÁTA
    if (typeof lastMDPResult !== 'undefined') {
        lastMDPResult = null;
        lastMDPPatterns = null;
    }

    // 6. Reset loading indicator
    document.getElementById('loadingIndicator').classList.add('hidden');

    // 7. Reset sekvenčné premenné
    originalSequence = [];
    originalSimilarityMatrix = {};
    isSequenceReordered = false;

    updateCatalogBadges();
    updateAllLanguageCounters();
    updateGenerateButtonState();
    updateSelectAllButtonsColor();
    resetParametersToDefault();

    showToast(t?.allPatternsCleared || 'Všetky vzory boli vymazané', 'info');
});

// ========== CATALOG BADGES ==========

function updateCatalogBadges() {
    // Pre Coplien katalóg - spočítame všetky jazyky dohromady
    let totalCoplienCount = 0;
    Object.keys(patternLanguages).forEach(language => {
        const count = Object.keys(globalCheckedPatterns[language] || {})
            .filter(f => globalCheckedPatterns[language][f]).length;
        totalCoplienCount += count;
    });
    // Zavoláme pre Coplien len raz s celkovým počtom
    updateCatalogBadge('coplien', totalCoplienCount);

    // Pre user katalógy (každý samostatne)
    Object.keys(userCatalogs).forEach(catalogName => {
        const count = Object.keys(globalCheckedPatterns[catalogName] || {})
            .filter(f => globalCheckedPatterns[catalogName][f]).length;
        updateCatalogBadge(catalogName, count);
    });
}

function updateCatalogBadge(catalogName, count) {
    const catalogButtons = document.querySelectorAll('#catalogButtonsContainer button');

    catalogButtons.forEach(btn => {
        if (catalogName === 'coplien' && btn.id === 'coplienBtn') {
            // Pre Coplien - badge v tlačidle
            const existingBadge = btn.querySelector('.catalog-badge');
            if (existingBadge) existingBadge.remove();

            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'catalog-badge';
                badge.textContent = count;
                btn.style.position = 'relative';
                btn.appendChild(badge);
            }
        }
        // Pre user katalógy
        else if (btn.textContent.includes(catalogName) && !btn.id) {
            const container = btn.closest('.relative.group');
            if (!container) return;

            const existingBadge = container.querySelector('.catalog-badge');
            if (existingBadge) existingBadge.remove();

            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'catalog-badge';
                badge.textContent = count;
                container.appendChild(badge);
            }
        }
    });
}

// ========== DISPLAY & DRAG/DROP ==========

function initializeSortable() {
    if (sortableInstance) {
        sortableInstance.destroy();
        updateOverallConfidenceFromDOM();
    }

    sortableInstance = new Sortable(document.getElementById('patternsList'), {
        animation: 150,
        ghostClass: 'bg-blue-50',
        onEnd: function (evt) {
            updateSequenceOrder(); // Toto sa volá pri každom pretiahnutí
        }
    });
}

function updateSequenceOrder() {
    const items = document.querySelectorAll('#patternsList .pattern-item');
    const newOrder = Array.from(items).map(item => item.dataset.patternName);

    // Porovnaj s pôvodným poradím
    const originalOrder = originalSequence.map(pattern => pattern.filename);
    const isSameOrder = JSON.stringify(newOrder) === JSON.stringify(originalOrder);

    if (isSameOrder) {
        // Ak je poradie rovnaké ako pôvodné, skry reset button
        document.getElementById('resetSequenceBtn').classList.add('hidden');
        isSequenceReordered = false;
    } else {
        // Ak je poradie iné, zobraz reset button
        document.getElementById('resetSequenceBtn').classList.remove('hidden');
        isSequenceReordered = true;
    }
}

// ========== INITIALIZE APP ==========

document.addEventListener('DOMContentLoaded', () => {
    // ===== 1. INITIALIZE APP =====
    loadCatalog('coplien');
    updateCatalogButtons();
    setupCheckboxChangeListeners();
    initExportDropdown();
    
    setTimeout(() => {
        const paramsArrow = document.getElementById('paramsArrow');
        if (paramsArrow) {
            paramsArrow.style.transform = 'rotate(180deg)';
        }
    }, 100);
    
    setTimeout(updateGenerateButtonState, 500);
    
    // ===== 2. WATCH LOADING INDICATOR =====
    watchLoadingIndicator();
    validateInputs();
    
    // ===== 3. COOKIE CONSENT =====
    const cookieConsent = document.getElementById('cookieConsent');
    if (!localStorage.getItem('cookies_accepted') && cookieConsent) {
        cookieConsent.classList.remove('hidden');
    }

    const acceptCookiesBtn = document.getElementById('acceptCookies');
    if (acceptCookiesBtn) {
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookies_accepted', 'true');
            if (cookieConsent) {
                cookieConsent.classList.add('hidden');
            }
            if (typeof gtag !== 'undefined') {
                gtag('consent', 'update', {
                    'analytics_storage': 'granted'
                });
            }
        });
    }
});

// ========== COUNTER FUNCTIONS ==========

// Funkcia na aktualizáciu počítadla pre konkrétny jazyk
function updateLanguageCounter(languageName, checkedCount, totalPatterns) {
    const sectionHeaders = document.querySelectorAll('.pattern-language-header h3');

    sectionHeaders.forEach(header => {
        // Pre Coplien jazyky
        if (header.textContent.includes(languageName.replace(/_/g, ' '))) {
            const parentDiv = header.closest('.pattern-language-header');
            if (!parentDiv) return;

            // Nájdi existujúce počítadlo
            let counter = parentDiv.querySelector('.language-counter');

            // Ak neexistuje, vytvor nové
            if (!counter) {
                counter = document.createElement('span');
                counter.className = 'language-counter text-sm font-normal ml-2 text-gray-600 dark:text-gray-400';
                header.appendChild(counter);
            }

            // Aktualizuj text
            counter.textContent = `(${checkedCount}/${totalPatterns})`;
        }

        // Pre user katalógy (keď je zhodný názov)
        if (header.textContent.trim() === languageName) {
            const parentDiv = header.closest('.pattern-language-header');
            if (!parentDiv) return;

            let counter = parentDiv.querySelector('.language-counter');
            if (!counter) {
                counter = document.createElement('span');
                counter.className = 'language-counter text-sm font-normal ml-2 text-gray-600 dark:text-gray-400';
                header.appendChild(counter);
            }

            counter.textContent = `(${checkedCount}/${totalPatterns})`;
        }
    });
}

function updateAllLanguageCounters() {
    // Pre všetky jazyky v patternLanguages (Coplien)
    Object.keys(patternLanguages).forEach(language => {
        const totalPatterns = patternLanguages[language].length;
        const checkedCount = Object.keys(globalCheckedPatterns[language] || {})
            .filter(f => globalCheckedPatterns[language][f]).length;
        updateLanguageCounter(language, checkedCount, totalPatterns);
    });

    // Pre user katalógy
    Object.keys(userCatalogs).forEach(catalogName => {
        const catalog = userCatalogs[catalogName];
        
        if (catalog.structure) {
            // Nový formát - prejdeme všetky foldre
            Object.entries(catalog.structure).forEach(([folderName, files]) => {
                const totalPatterns = Object.keys(files).length;
                
                // DÔLEŽITÉ: Filtrujeme podľa catalogName a zároveň kontrolujeme, či súbor patrí do tohto foldra
                const checkedCount = Object.keys(globalCheckedPatterns[catalogName] || {})
                    .filter(filename => {
                        // Je súbor zaškrtnutý?
                        if (!globalCheckedPatterns[catalogName][filename]) return false;
                        // Patrí tento súbor do aktuálneho foldra?
                        return files.hasOwnProperty(filename);
                    }).length;
                
                updateLanguageCounter(folderName, checkedCount, totalPatterns);
            });
        } else {
            // Starý formát
            const totalPatterns = Object.keys(catalog.patterns).length;
            const checkedCount = Object.keys(globalCheckedPatterns[catalogName] || {})
                .filter(f => globalCheckedPatterns[catalogName][f]).length;
            updateLanguageCounter(catalogName, checkedCount, totalPatterns);
        }
    });
}
// Event listener pre zmenu checkboxov
function setupCheckboxChangeListeners() {
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.closest('#patternCheckboxes')) {
            updateAllLanguageCounters();
            updateGenerateButtonState();
        }
    });
}

// ========== SEQUENCE RESET + COPY FUNCTIONALITY ==========

function resetSequenceToOriginal() {
    if (!originalSequence.length) return;

    displayPatternSequence(originalSequence, originalSimilarityMatrix);
}

function copySequenceToClipboard() {
    const patterns = Array.from(document.querySelectorAll('#patternsList .pattern-item'));
    const sequenceText = patterns.map((item, index) => {
        const patternName = item.dataset.patternName;
        const pattern = allPatternsData[patternName];
        return `${index + 1}. ${pattern.name}`;
    }).join('\n');

    navigator.clipboard.writeText(sequenceText).then(() => {
        const copyBtn = document.getElementById('copySequenceBtn');
        const originalEmoji = copyBtn.innerHTML;
        copyBtn.innerHTML = '✅';
        copyBtn.classList.remove('bg-blue-600');
        copyBtn.classList.add('bg-green-600');

        setTimeout(() => {
            copyBtn.innerHTML = originalEmoji;
            copyBtn.classList.remove('bg-green-600');
            copyBtn.classList.add('bg-blue-600');
        }, 2000);
    }).catch(err => {
        showToast(translations[currentLanguage]?.copyFailed || 'Nepodarilo sa skopírovať sekvenciu', 'error');
    });
}

document.getElementById('resetSequenceBtn').addEventListener('click', resetSequenceToOriginal);
document.getElementById('copySequenceBtn').addEventListener('click', copySequenceToClipboard);

// ========== PARAMETRE ROZBALOVANIE ==========

let paramsExpanded = true; // true = parametre sú viditeľné

function toggleParams(expand) {
    const paramsContainer = document.getElementById('paramsContainer');
    const paramsArrow = document.getElementById('paramsArrow');
    
    if (!paramsContainer || !paramsArrow) return;
    
    if (expand === undefined) {
        expand = !paramsExpanded;
    }
    
    if (expand) {
        // Dynamický výpočet šírky podľa počtu checkboxov
        const checkboxes = paramsContainer.querySelectorAll('.group');
        // Každý checkbox group má cca 80px šírku (vrátane medzier)
        const estimatedWidth = checkboxes.length * 85;
        // Minimálne 520px, maximálne 800px
        const newWidth = Math.min(800, Math.max(520, estimatedWidth));
        
        paramsContainer.style.maxWidth = newWidth + 'px';
        paramsContainer.style.opacity = '1';
        paramsContainer.style.padding = '0.5rem';
        paramsArrow.style.transform = 'rotate(180deg)';
        paramsExpanded = true;

    } else {
        // ZBALIŤ - parametre sú skryté
        paramsContainer.style.maxWidth = '0';
        paramsContainer.style.opacity = '0';
        paramsContainer.style.padding = '0';
        paramsArrow.style.transform = 'rotate(0deg)'; // Šípka doprava = parametre sú skryté
        paramsExpanded = false;
    }
}

document.getElementById('toggleParamsBtn')?.addEventListener('click', () => {
    toggleParams();
});

// Upravíme generovanie - pridáme event listener, ktorý zavolá toggleParams pred generovaním
document.getElementById("generateBtn").addEventListener("click", async () => {
    // Zbalíme parametre
    toggleParams(false);
    
    try {
        await generateSequence();
    } catch (error) {
        showToast(translations[currentLanguage]?.sequenceGenerationError || 'Chyba pri generovaní sekvencie. Skúste to znova.', 'error');
    }
});

// Sledujeme loading indicator a po jeho zmiznutí rozbalíme parametre
function watchLoadingIndicator() {
    const loadingIndicator = document.getElementById('loadingIndicatorBtn');
    if (!loadingIndicator) return;
    
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (loadingIndicator.classList.contains('hidden')) {
                    // Loading bar zmizol - rozbalíme parametre
                    toggleParams(true);
                }
            }
        });
    });
    
    observer.observe(loadingIndicator, { attributes: true });
}

// ========== VALIDÁCIA HODNÔT V PARAMETROCH ==========

function validateInputs() {
    // Gamma input - rozsah 0-1
    const gammaInput = document.getElementById('gammaInput');
    if (gammaInput) {
        gammaInput.addEventListener('blur', function() {
            let value = parseFloat(this.value);
            if (isNaN(value)) {
                this.value = 0.9; // predvolená hodnota
            } else {
                // Obmedzenie na rozsah 0-1
                value = Math.min(Math.max(value, 0), 1);
                this.value = value;
            }
        });
    }

    // Epsilon input - rozsah 0.0001-1
    const epsilonInput = document.getElementById('epsilonInput');
    if (epsilonInput) {
        epsilonInput.addEventListener('blur', function() {
            let value = parseFloat(this.value);
            if (isNaN(value)) {
                this.value = 0.1; // predvolená hodnota
            } else {
                // Zachováme desatinné miesta
                value = Math.min(Math.max(value, 0.0001), 1);
                // Zaokrúhlime na 4 desatinné miesta pre čitateľnosť
                this.value = Math.round(value * 10000) / 10000;
            }
        });
    }

    // Goal Reward - len nezáporné čísla
    const goalInput = document.getElementById('goalRewardInput');
    if (goalInput) {
        goalInput.addEventListener('blur', function() {
            let value = parseFloat(this.value);
            if (isNaN(value) || value < 0) {
                this.value = 10; // predvolená hodnota
            }
        });
    }

    // Other Reward - len nezáporné čísla
    const otherInput = document.getElementById('otherRewardInput');
    if (otherInput) {
        otherInput.addEventListener('blur', function() {
            let value = parseFloat(this.value);
            if (isNaN(value) || value < 0) {
                this.value = 1; // predvolená hodnota
            }
        });
    }
}

// ========== DISABLE GENERATE BUTTON WHEN NO PATTERNS SELECTED ==========

function updateGenerateButtonState() {
    const generateBtn = document.getElementById('generateBtn');
    if (!generateBtn) return;
    
    // Spočítame všetky zaškrtnuté vzory z globálneho stavu
    let totalSelected = 0;
    Object.keys(globalCheckedPatterns).forEach(catalogName => {
        totalSelected += Object.keys(globalCheckedPatterns[catalogName] || {})
            .filter(f => globalCheckedPatterns[catalogName][f]).length;
    });
    
    if (totalSelected < 2) {  // Zmena: 0 -> < 2
        // Disable tlačidlo
        generateBtn.disabled = true;
        generateBtn.classList.add('opacity-50', 'cursor-not-allowed');
        generateBtn.classList.remove('hover:bg-indigo-700');
        generateBtn.title = translations[currentLanguage]?.selectAtLeastTwoPatterns || 'Vyber aspoň 2 vzory!';
    } else {
        // Enable tlačidlo
        generateBtn.disabled = false;
        generateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        generateBtn.classList.add('hover:bg-indigo-700');
        generateBtn.title = '';
    }
}

window.updateCatalogSearchPlaceholders = function() {
    const t = window.translations?.[window.currentLanguage];
    if (!t) return;
    
    // Nájdeme všetky vyhľadávacie inputy v sekciách
    const searchInputs = document.querySelectorAll('.pattern-language-header .search-input');
    searchInputs.forEach(input => {
        input.placeholder = t.searchPlaceholder;
    });
};


function updateStartFlags() {
    document.querySelectorAll('.start-flag').forEach(flag => {
        const filename = flag.dataset.filename;
        const checkboxId = flag.dataset.checkboxId;
        const checkbox = checkboxId ? document.getElementById(checkboxId) : null;
        
        // Ak je nastavený forcedStartPattern a zodpovedá tomuto filename
        if (forcedStartPattern === filename) {
            // Skontrolujeme, či je checkbox zaškrtnutý (ak existuje)
            if (checkbox && !checkbox.checked) {
                // Checkbox nie je zaškrtnutý - zrušíme forcedStartPattern
                forcedStartPattern = null;
                flag.classList.remove('opacity-100');
                flag.classList.add('opacity-0');
                flag.title = translations[currentLanguage]?.setAsStart || 'Nastaviť ako štartovací vzor';
            } else {
                // Všetko OK - zobrazíme vlajočku
                flag.classList.remove('opacity-0');
                flag.classList.add('opacity-100');
                flag.title = translations[currentLanguage]?.removeAsStart || 'Zrušiť štartovací vzor';
            }
        } else {
            flag.classList.remove('opacity-100');
            flag.classList.add('opacity-0', 'group-hover:opacity-100');
            flag.title = translations[currentLanguage]?.setAsStart || 'Nastaviť ako štartovací vzor';
        }
    });
}

function updateGoalFlags() {
    document.querySelectorAll('.goal-flag').forEach(flag => {
        const filename = flag.dataset.filename;
        const checkboxId = flag.dataset.checkboxId;
        const checkbox = checkboxId ? document.getElementById(checkboxId) : null;
        
        // Ak je nastavený forcedGoalPattern a zodpovedá tomuto filename
        if (forcedGoalPattern === filename) {
            // Skontrolujeme, či je checkbox zaškrtnutý
            if (checkbox && !checkbox.checked) {
                // Checkbox nie je zaškrtnutý - zrušíme forcedGoalPattern
                forcedGoalPattern = null;
                flag.classList.remove('opacity-100');
                flag.classList.add('opacity-0');
                flag.title = translations[currentLanguage]?.setAsGoal || 'Nastaviť ako cieľový vzor';
            } else {
                // Všetko OK - zobrazíme terč
                flag.classList.remove('opacity-0');
                flag.classList.add('opacity-100');
                flag.title = translations[currentLanguage]?.removeAsGoal || 'Zrušiť cieľový vzor';
            }
        } else {
            flag.classList.remove('opacity-100');
            flag.classList.add('opacity-0', 'group-hover:opacity-100');
            flag.title = translations[currentLanguage]?.setAsGoal || 'Nastaviť ako cieľový vzor';
        }
    });
}

// ========== RESET PARAMETERS TO DEFAULT ==========

function resetParametersToDefault() {
    const defaultValues = {
        gamma: 0.9,
        goalReward: 10,
        otherReward: 1,
        epsilon: 0.1,
        idfCheckbox: false,
        sentimentCheckbox: false,
        referenceCheckbox: false,
        useCheckbox: false
    };
    
    const gammaInput = document.getElementById('gammaInput');
    if (gammaInput) gammaInput.value = defaultValues.gamma;
    
    const goalRewardInput = document.getElementById('goalRewardInput');
    if (goalRewardInput) goalRewardInput.value = defaultValues.goalReward;
    
    const otherRewardInput = document.getElementById('otherRewardInput');
    if (otherRewardInput) otherRewardInput.value = defaultValues.otherReward;
    
    const epsilonInput = document.getElementById('epsilonInput');
    if (epsilonInput) epsilonInput.value = defaultValues.epsilon;
    
    const idfCheckbox = document.getElementById('idfCheckbox');
    if (idfCheckbox) idfCheckbox.checked = defaultValues.idfCheckbox;
    
    const sentimentCheckbox = document.getElementById('sentimentCheckbox');
    if (sentimentCheckbox) sentimentCheckbox.checked = defaultValues.sentimentCheckbox;
    
    const referenceCheckbox = document.getElementById('referenceCheckbox');
    if (referenceCheckbox) referenceCheckbox.checked = defaultValues.referenceCheckbox;
    
    const useCheckbox = document.getElementById('useCheckbox');
    if (useCheckbox) useCheckbox.checked = defaultValues.useCheckbox;
    
    // Voliteľne: reset aj stop slov na predvolené
    if (window.resetStopWordsToDefault && typeof window.resetStopWordsToDefault === 'function') {
        window.resetStopWordsToDefault();
    }
}