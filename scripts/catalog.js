//catalog.js

function switchToCoplienCatalog() {
    currentCatalog = 'coplien';
    updateCatalogButtons();
    loadCatalog('coplien');
}

function switchToUserCatalog(catalogName) {
    if (!userCatalogs[catalogName]) {
        showToast(translations[currentLanguage]?.catalogNotFound || 'Katalóg nebol nájdený', 'error');
        switchToCoplienCatalog();
        return;
    }
    currentCatalog = catalogName;
    updateCatalogButtons();
    loadCatalog(catalogName);
}

function updateCatalogButtons() {
    const catalogButtonsContainer = document.getElementById('catalogButtonsContainer');
    if (!catalogButtonsContainer) return;

    const coplienBtn = document.getElementById('coplienBtn');
    if (!coplienBtn) return;

    catalogButtonsContainer.innerHTML = '';
    catalogButtonsContainer.appendChild(coplienBtn);

    Object.keys(userCatalogs).forEach(catalogName => {
        const catalogBtnContainer = document.createElement('div');
        catalogBtnContainer.className = 'relative group';

        const catalogBtn = document.createElement('button');

        if (currentCatalog === catalogName) {
            catalogBtn.className = 'bg-green-700 text-white px-4 py-2 rounded-lg border-2 border-green-300 shadow-lg transition-all duration-200';
        } else {
            catalogBtn.className = 'bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition';
        }

        catalogBtn.textContent = catalogName;
        catalogBtn.dataset.catalogName = catalogName;

        catalogBtn.addEventListener('click', () => {
            switchToUserCatalog(catalogName);
        });

        const removeBtn = document.createElement('button');
        removeBtn.className = 'absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600';
        removeBtn.innerHTML = '×';
        removeBtn.title = 'Odstrániť katalóg';

        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation(); 
            removeCatalog(catalogName);
        });

        catalogBtnContainer.appendChild(catalogBtn);
        catalogBtnContainer.appendChild(removeBtn);
        catalogButtonsContainer.appendChild(catalogBtnContainer);
    });

    if (currentCatalog === 'coplien') {
        coplienBtn.className = 'bg-blue-700 text-white px-4 py-2 rounded-lg border-2 border-blue-300 shadow-lg transition-all duration-200';
    } else {
        coplienBtn.className = 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition';
    }
}

// ========== JEDNOTNÉ NAČÍTANIE KATALÓGU ==========

async function loadCatalog(catalogName) {
    document.getElementById('loadingIndicator').classList.remove('hidden');
    
    const loadingText = document.querySelector('#loadingIndicator p');
    const originalText = loadingText.textContent;
    const t = translations[currentLanguage];
    
    try {
        let catalogData;
        let isCoplien = (catalogName === 'coplien');
        
        if (isCoplien) {
            // Coplien - načítame zo servera
            catalogData = {
                type: 'coplien',
                structure: {}
            };
            
            // Spočítame celkový počet vzorov
            let totalPatterns = 0;
            Object.values(patternLanguages).forEach(files => {
                totalPatterns += files.length;
            });
            
            let loadedCount = 0;
            
            for (const [language, files] of Object.entries(patternLanguages)) {
                catalogData.structure[language] = {};
                
                for (const file of files) {         
                    if (!allPatternsData[file]) {
                        const response = await fetch(`patterns/DefaultPatterns/${language}/${file}`);
                        if (response.ok) {
                            const content = await response.text();
                            allPatternsData[file] = {
                                name: file.replace('.txt', '').replace(/_/g, ' '),
                                content: content,
                                filename: file,
                                language: language,
                            };
                            catalogData.structure[language][file] = content;
                        }
                    } else {
                        // Už načítané
                        catalogData.structure[language][file] = allPatternsData[file].content;
                    }
                    loadedCount++;
                    loadingText.textContent = t.loadingProgress
                        .replace('{current}', loadedCount)
                        .replace('{total}', totalPatterns);
                }
            }
        } else {
            // User katalóg
            const catalog = userCatalogs[catalogName];
            if (!catalog) throw new Error('Katalóg neexistuje');
            
            catalogData = {
                type: 'user',
                structure: catalog.structure || {}
            };
            
            // Ak má starý formát, konvertujeme
            if (!catalog.structure && catalog.patterns) {
                catalogData.structure = {};
                catalogData.structure[catalogName] = catalog.patterns;
            }
            
            const totalPatterns = catalog.totalPatterns || 
                Object.values(catalogData.structure).reduce((sum, files) => sum + Object.keys(files).length, 0);
            let loadedCount = 0;
            
            // Prejdeme všetky priečinky a súbory
            for (const [folderName, files] of Object.entries(catalogData.structure)) {
                for (const [filename, content] of Object.entries(files)) {
                    if (!allPatternsData[filename]) {
                        allPatternsData[filename] = {
                            name: filename.replace('.txt', '').replace(/_/g, ' '),
                            content: content,
                            filename: filename,
                            language: folderName,
                            catalogName: catalogName
                        };
                    }
                    loadedCount++;
                    loadingText.textContent = t.loadingProgress
                        .replace('{current}', loadedCount)
                        .replace('{total}', totalPatterns);
                }
            }
        }
        
        // Inicializujeme sekcie podľa štruktúry
        initializeCatalogSections(catalogName, catalogData.structure, catalogData.type);
        
    } catch (err) {
        showToast((translations[currentLanguage]?.catalogLoadError || 'Chyba pri načítaní katalógu: ') + err.message, 'error');
    } finally {
        loadingText.textContent = originalText;
        document.getElementById('loadingIndicator').classList.add('hidden');
    }
}

// ========== INICIALIZÁCIA SEKCIÍ ==========

function initializeCatalogSections(catalogName, structure, catalogType = 'user') {
    const checkboxContainer = document.getElementById("patternCheckboxes");
    if (!checkboxContainer) return;

    checkboxContainer.innerHTML = '';
    checkboxContainer.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-2');
    checkboxContainer.classList.add('flex', 'flex-col', 'gap-4');

    const isCoplien = (catalogType === 'coplien');

    // Pre každý priečinok/jazyk vytvoríme sekciu
    Object.entries(structure).forEach(([sectionName, files]) => {
        const sectionContainer = document.createElement("div");
        sectionContainer.className = "pattern-language-section w-full";

        const sectionHeader = document.createElement("div");
        sectionHeader.className = "pattern-language-header bg-gray-200 dark:bg-gray-700 p-3 rounded-lg cursor-pointer flex justify-between items-center w-full";
        
        const patternCount = Object.keys(files).length;
        const displayName = isCoplien ? sectionName.replace(/_/g, ' ') : sectionName;
        
        sectionHeader.innerHTML = `
            <div class="flex items-center flex-wrap gap-2">
                <h3 class="font-semibold text-gray-800 dark:text-gray-200">${displayName}</h3>
                <span class="language-counter text-sm font-normal text-gray-600 dark:text-gray-400">(0/${patternCount})</span>
                <div class="search-container relative ml-auto search-hidden" onclick="event.stopPropagation()">
                    <input type="text" 
                        class="search-input text-xs pl-7 pr-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-32 focus:w-48 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="${window.translations?.[window.currentLanguage]?.searchPlaceholder || 'Hľadať...'}">
                </div>
            </div>
            <div class="flex items-center space-x-2">
                <button class="select-all-btn text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors" title="Vybrať všetky">
                    ✓
                </button>
                <svg class="w-5 h-5 transform transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        `;

        const sectionContent = document.createElement("div");
        sectionContent.className = "pattern-language-content border border-gray-300 dark:border-gray-600 rounded-lg mt-2 hidden w-full";

        const patternsContainer = document.createElement("div");
        patternsContainer.className = "patterns-grid grid grid-cols-1 md:grid-cols-2 gap-2 p-2 max-h-48 overflow-y-auto w-full custom-scrollbar";
        patternsContainer.dataset.language = sectionName;

        // Vytvoríme checkboxy pre každý súbor
        Object.keys(files).forEach(filename => {
            const pattern = allPatternsData[filename];
            if (!pattern) return;
            
            const label = document.createElement("label");
            label.classList.add("flex", "items-center", "space-x-2", "p-2", "hover:bg-gray-50", "dark:hover:bg-gray-700", "rounded", "group");
            label.dataset.patternName = pattern.name.toLowerCase();

            const rowDiv = document.createElement('div');
            rowDiv.className = "flex items-center justify-between w-full";

            const leftDiv = document.createElement('div');
            leftDiv.className = "flex items-center space-x-2 flex-grow";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = filename;
            checkbox.classList.add("form-checkbox", "h-5", "w-5", "text-indigo-600", "flex-shrink-0");
            
            // ★ DÔLEŽITÉ: Pre Coplien používame ako kľúč v globalCheckedPatterns názov jazyka, nie 'coplien'
            const storageKey = isCoplien ? sectionName : catalogName;
            checkbox.checked = globalCheckedPatterns[storageKey]?.[filename] || false;
            checkbox.id = `cb-${storageKey}-${filename.replace(/[^a-z0-9]/gi, '_')}`;

            checkbox.addEventListener('change', (e) => {
                const storageKey = isCoplien ? sectionName : catalogName;
                if (!globalCheckedPatterns[storageKey]) {
                    globalCheckedPatterns[storageKey] = {};
                }
                globalCheckedPatterns[storageKey][filename] = e.target.checked;
                updateCatalogBadges();
                updateSelectAllButtonsColor();
                updateAllLanguageCounters();
                
                if (!e.target.checked && forcedStartPattern === filename) {
                    forcedStartPattern = null;
                    updateStartFlags();
                }
                if (!e.target.checked && forcedGoalPattern === filename) {
                    forcedGoalPattern = null;
                    updateGoalFlags();
                }
            });

            const span = document.createElement("span");
            span.textContent = pattern.name;
            span.classList.add("text-sm", "dark:text-gray-300", "flex-grow");

            leftDiv.appendChild(checkbox);
            leftDiv.appendChild(span);

            const iconsDiv = document.createElement('div');
            iconsDiv.className = "icons-container ml-2 flex items-center gap-1";

            const flagSpan = document.createElement('span');
            flagSpan.className = `start-flag cursor-pointer text-lg hover:opacity-100 transition-opacity ${forcedStartPattern === filename ? 'opacity-100' : 'opacity-0'}`;
            flagSpan.setAttribute('data-filename', filename);
            flagSpan.setAttribute('data-checkbox-id', checkbox.id);
            flagSpan.setAttribute('title', translations[currentLanguage]?.setAsStart || 'Nastaviť ako štartovací vzor');
            flagSpan.innerHTML = '🚩';

            const goalSpan = document.createElement('span');
            goalSpan.className = `goal-flag cursor-pointer text-lg hover:opacity-100 transition-opacity ${forcedGoalPattern === filename ? 'opacity-100' : 'opacity-0'}`;
            goalSpan.setAttribute('data-filename', filename);
            goalSpan.setAttribute('data-checkbox-id', checkbox.id);
            goalSpan.setAttribute('title', translations[currentLanguage]?.setAsGoal || 'Nastaviť ako cieľový vzor');
            goalSpan.innerHTML = '🎯';

           

            // Event listenery pre vlajočky
            flagSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const clickedFilename = flagSpan.dataset.filename;
                const checkboxId = flagSpan.dataset.checkboxId;
                const targetCheckbox = document.getElementById(checkboxId);
                const storageKey = isCoplien ? sectionName : catalogName;
                
                if (forcedStartPattern === clickedFilename) {
                    forcedStartPattern = null;
                } else {
                    forcedStartPattern = clickedFilename;
                    if (forcedGoalPattern === clickedFilename) {
                        forcedGoalPattern = null;
                    }
                    if (targetCheckbox && !targetCheckbox.checked) {
                        targetCheckbox.checked = true;
                        if (!globalCheckedPatterns[storageKey]) {
                            globalCheckedPatterns[storageKey] = {};
                        }
                        globalCheckedPatterns[storageKey][clickedFilename] = true;
                        updateCatalogBadges();
                        updateSelectAllButtonsColor();
                        updateAllLanguageCounters();
                        updateGenerateButtonState();
                    }
                }
                updateStartFlags();
                updateGoalFlags();
            });

            goalSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const clickedFilename = goalSpan.dataset.filename;
                const checkboxId = goalSpan.dataset.checkboxId;
                const targetCheckbox = document.getElementById(checkboxId);
                const storageKey = isCoplien ? sectionName : catalogName;
                
                if (forcedGoalPattern === clickedFilename) {
                    forcedGoalPattern = null;
                } else {
                    forcedGoalPattern = clickedFilename;
                    if (forcedStartPattern === clickedFilename) {
                        forcedStartPattern = null;
                    }
                    if (targetCheckbox && !targetCheckbox.checked) {
                        targetCheckbox.checked = true;
                        if (!globalCheckedPatterns[storageKey]) {
                            globalCheckedPatterns[storageKey] = {};
                        }
                        globalCheckedPatterns[storageKey][clickedFilename] = true;
                        updateCatalogBadges();
                        updateSelectAllButtonsColor();
                        updateAllLanguageCounters();
                        updateGenerateButtonState();
                    }
                }
                updateStartFlags();
                updateGoalFlags();
            });

            iconsDiv.appendChild(goalSpan);
            iconsDiv.appendChild(flagSpan);
            rowDiv.appendChild(leftDiv);
            rowDiv.appendChild(iconsDiv);
            label.appendChild(rowDiv);
            patternsContainer.appendChild(label);
        });

        sectionContent.appendChild(patternsContainer);

        // Vyhľadávanie
        const searchContainer = sectionHeader.querySelector('.search-container');
        const searchInput = searchContainer.querySelector('.search-input');

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const labels = patternsContainer.querySelectorAll('label');
            labels.forEach(label => {
                const patternName = label.dataset.patternName || '';
                label.style.display = patternName.includes(searchTerm) ? 'flex' : 'none';
            });
        });

        const selectAllBtn = sectionHeader.querySelector('.select-all-btn');
        selectAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            const checkboxes = patternsContainer.querySelectorAll('input[type="checkbox"]');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            const storageKey = isCoplien ? sectionName : catalogName;
            
            checkboxes.forEach(checkbox => {
                checkbox.checked = !allChecked;
                if (!globalCheckedPatterns[storageKey]) {
                    globalCheckedPatterns[storageKey] = {};
                }
                globalCheckedPatterns[storageKey][checkbox.value] = checkbox.checked;
            });
            
            if (allChecked) {
                checkboxes.forEach(checkbox => {
                    if (forcedStartPattern === checkbox.value) forcedStartPattern = null;
                    if (forcedGoalPattern === checkbox.value) forcedGoalPattern = null;
                });
                updateStartFlags();
                updateGoalFlags();
            }
            
            updateAllLanguageCounters();
            updateCatalogBadges();
            updateGenerateButtonState();
            updateSelectAllButtonsColor();
        });

        sectionHeader.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-input')) return;

            const isHidden = sectionContent.classList.contains('hidden');
            sectionContent.classList.toggle('hidden');

            if (isHidden) {
                searchContainer.classList.remove('search-hidden');
                searchInput.value = '';
                patternsContainer.querySelectorAll('label').forEach(label => label.style.display = 'flex');
            } else {
                searchContainer.classList.add('search-hidden');
            }

            const arrow = sectionHeader.querySelector('svg:last-child');
            arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        });

        sectionContainer.appendChild(sectionHeader);
        sectionContainer.appendChild(sectionContent);
        checkboxContainer.appendChild(sectionContainer);
    });

    updateCatalogBadges();
    updateAllLanguageCounters();
    updateSelectAllButtonsColor();
}

async function removeCatalog(catalogName) {
    const t = translations[currentLanguage];
    
    const confirmed = await showConfirmToast(
        `${t.confirmDelete} "${catalogName}"?`,
        t.confirmYes,
        t.confirmNo,
        10000
    );
    
    if (confirmed) {
        // 1. Odstráni všetky vzory tohto katalógu z allPatternsData
        const catalog = userCatalogs[catalogName];
        if (catalog) {
            if (catalog.structure) {
                // Nový formát - prejde všetky priečinky
                Object.values(catalog.structure).forEach(files => {
                    Object.keys(files).forEach(filename => {
                        delete allPatternsData[filename];
                    });
                });
            } else if (catalog.patterns) {
                // Starý formát
                Object.keys(catalog.patterns).forEach(filename => {
                    delete allPatternsData[filename];
                });
            }
        }

        // 2. Odstráni katalóg z userCatalogs
        delete userCatalogs[catalogName];
        
        // 3. Odstráni z globalCheckedPatterns
        delete globalCheckedPatterns[catalogName];

        // 4. Prepne na Coplien, ak bol práve odstránený aktuálny katalóg
        if (currentCatalog === catalogName) {
            switchToCoplienCatalog();
        } else {
            updateCatalogButtons();
        }

        // 5. Aktualizuje UI
        updateCatalogBadges(); 
        updateGenerateButtonState();
        
        const successMessage = t.catalogDeleted.replace('{catalogName}', `"${catalogName}"`);
        showToast(successMessage, 'success');
    } else {
        showToast(t.catalogDeletionCancelled, 'info', 2000);
    }
}




// ========== SELECT ALL BUTTONS COLOR ==========

function updateSelectAllButtonsColor() {
    // Prejdeme všetky sekcie
    const sections = document.querySelectorAll('.pattern-language-section');
    
    sections.forEach(section => {
        const sectionHeader = section.querySelector('.pattern-language-header');
        const selectAllBtn = sectionHeader?.querySelector('.select-all-btn');
        const patternsContainer = section.querySelector('.patterns-grid');
        
        if (!selectAllBtn || !patternsContainer) return;
        
        // Zistíme všetky checkboxy v tejto sekcii (aj skryté)
        const checkboxes = patternsContainer.querySelectorAll('input[type="checkbox"]');
        const allChecked = Array.from(checkboxes).every(cb => cb.checked);
        
        if (allChecked && checkboxes.length > 0) {
            // Všetky vybraté -> VÝRAZNÁ ZELENÁ
            selectAllBtn.classList.add(
                'text-green-600', 
                'dark:text-green-400',
                'font-bold',           // pridané tučné písmo
                'scale-110'             // pridané zväčšenie
            );
            selectAllBtn.classList.remove(
                'text-gray-600', 
                'dark:text-gray-400', 
                'hover:text-indigo-600', 
                'dark:hover:text-indigo-400'
            );
            selectAllBtn.title = 'Všetky vybraté';
            
            // Pridáme inline style pre ešte väčšiu výraznosť (voliteľné)
            selectAllBtn.style.textShadow = '0 2px 4px rgba(0,128,0,0.3)';
            selectAllBtn.style.transition = 'all 0.2s ease';
        } else {
            // Nie všetky vybraté -> pôvodná farba
            selectAllBtn.classList.remove(
                'text-green-600', 
                'dark:text-green-400',
                'font-bold',
                'scale-110'
            );
            selectAllBtn.classList.add(
                'text-gray-600', 
                'dark:text-gray-400', 
                'hover:text-indigo-600', 
                'dark:hover:text-indigo-400'
            );
            selectAllBtn.title = 'Vybrať všetky';
            
            // Odstránime inline style
            selectAllBtn.style.textShadow = '';
        }
    });
}

// ========== CATALOG NAME VALIDATION ==========

const MAX_CATALOG_NAME_LENGTH = 12;

function validateCatalogName(name) {
    const t = translations[currentLanguage];
    const errors = [];

    // Kontrola dĺžky
    if (name.length === 0) {
        errors.push(t.catalogNameRequired || 'Názov katalógu je povinný');
    } else if (name.length > MAX_CATALOG_NAME_LENGTH) {
        const message = currentLanguage === 'sk'
            ? `Názov katalógu môže mať maximálne ${MAX_CATALOG_NAME_LENGTH} znakov (aktuálne: ${name.length})`
            : `Catalog name can have maximum ${MAX_CATALOG_NAME_LENGTH} characters (current: ${name.length})`;
        errors.push(message);
    }

    // Kontrola povolených znakov (písmená, čísla, medzery, pomlčky, podčiarkovníky)
    const validPattern = /^[a-zA-Z0-9\s\-_]+$/;
    if (name.length > 0 && !validPattern.test(name)) {
        errors.push(t.catalogNameInvalidChars || 'Názov môže obsahovať len písmená, čísla, medzery, pomlčky a podčiarkovníky');
    }

    // Kontrola duplicity (len ak je aspoň 1 znak)
    if (name.length > 0) {
        const existingNames = Object.keys(userCatalogs).map(key => key.toLowerCase());
        if (existingNames.includes(name.toLowerCase())) {
            errors.push(t.catalogNameExists || 'Katalóg s týmto názvom už existuje');
        }
    }

    return errors;
}

function updateCatalogNameValidation() {
    const catalogNameInput = document.getElementById('catalogName');
    const errorElement = document.getElementById('catalogNameError');
    const confirmBtn = document.getElementById('confirmCatalog');

    if (!catalogNameInput || !errorElement || !confirmBtn) return;

    const name = catalogNameInput.value.trim();
    const errors = validateCatalogName(name);

    // Aktualizujeme UI
    if (errors.length > 0) {
        // Zobrazíme prvú chybu
        errorElement.textContent = errors[0];
        errorElement.classList.remove('hidden');

        // Zvýrazníme input
        catalogNameInput.classList.add('border-red-500', 'focus:ring-red-500');
        catalogNameInput.classList.remove('border-gray-300', 'focus:ring-indigo-500');

        // Deaktivujeme tlačidlo
        confirmBtn.disabled = true;
        confirmBtn.classList.add('opacity-50', 'cursor-not-allowed');
        confirmBtn.classList.remove('hover:bg-indigo-700');
    } else {
        // Skryjeme chybu
        errorElement.classList.add('hidden');
        errorElement.textContent = '';

        // Vrátime normálny štýl inputu
        catalogNameInput.classList.remove('border-red-500', 'focus:ring-red-500');
        catalogNameInput.classList.add('border-gray-300', 'focus:ring-indigo-500');

        // Aktivujeme tlačidlo
        confirmBtn.disabled = false;
        confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');
        confirmBtn.classList.add('hover:bg-indigo-700');
    }
}

// Pridáme event listenery pre validáciu
document.getElementById('catalogName')?.addEventListener('input', updateCatalogNameValidation);
document.getElementById('catalogName')?.addEventListener('blur', updateCatalogNameValidation);

document.getElementById('coplienBtn').addEventListener('click', switchToCoplienCatalog);
