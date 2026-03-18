// ========== CATALOG ==========

function switchToCoplienCatalog() {
    currentCatalog = 'coplien';
    updateCatalogButtons();
    loadAllPatterns();
}

function switchToUserCatalog(catalogName) {
    if (!userCatalogs[catalogName]) {
        showToast(translations[currentLanguage]?.catalogNotFound || 'Katalóg nebol nájdený', 'error');
        switchToCoplienCatalog();
        return;
    }
    currentCatalog = catalogName;
    updateCatalogButtons();
    loadUserCatalog(catalogName);
}

function updateCatalogButtons() {
    const catalogButtonsContainer = document.getElementById('catalogButtonsContainer');

    // Ochrana pred null
    if (!catalogButtonsContainer) {
        return;
    }

    const coplienBtn = document.getElementById('coplienBtn');

    // Ochrana pred null pre coplienBtn
    if (!coplienBtn) {
        return;
    }

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

async function loadUserCatalog(catalogName) {
    document.getElementById('loadingIndicator').classList.remove('hidden');
    
    const loadingText = document.querySelector('#loadingIndicator p');
    const originalText = loadingText.textContent;
    const t = translations[currentLanguage];
    
    try {
        const catalog = userCatalogs[catalogName];
        
        // Ak má katalóg štruktúru (nový formát)
        if (catalog.structure) {
            const totalPatterns = catalog.totalPatterns;
            let loadedCount = 0;
            
            // Prejdeme všetky foldre a súbory
            for (const [folderName, files] of Object.entries(catalog.structure)) {
                for (const [filename, content] of Object.entries(files)) {
                    allPatternsData[filename] = {
                        name: filename.replace('.txt', '').replace(/_/g, ' '),
                        content: content,
                        filename: filename,
                        language: folderName,  // Dôležité: jazyk = názov subfoldra
                        catalogName: catalogName
                    };
                    loadedCount++;
                    
                    loadingText.textContent = t.loadingProgress
                        .replace('{current}', loadedCount)
                        .replace('{total}', totalPatterns);
                }
            }
            
            // Inicializujeme sekcie podľa folderov
            initializeUserCatalogSections(catalogName, catalog.structure);
            
        } else {
            // Starý formát (pre kompatibilitu)
            const totalPatterns = Object.keys(catalog.patterns).length;
            let loadedCount = 0;
            
            for (const [filename, content] of Object.entries(catalog.patterns)) {
                allPatternsData[filename] = {
                    name: filename.replace('.txt', '').replace(/_/g, ' '),
                    content: content,
                    filename: filename,
                    language: catalogName
                };
                loadedCount++;
                
                loadingText.textContent = t.loadingProgress
                    .replace('{current}', loadedCount)
                    .replace('{total}', totalPatterns);
            }
            
            // Stará inicializácia - jeden folder
            const oldStructure = {};
            oldStructure[catalogName] = catalog.patterns;
            initializeUserCatalogSections(catalogName, oldStructure);
        }
        
    } catch (err) {
        showToast((translations[currentLanguage]?.catalogLoadError || 'Chyba pri načítaní katalógu: ') + err.message, 'error');
    } finally {
        loadingText.textContent = originalText;
        document.getElementById('loadingIndicator').classList.add('hidden');
    }
}

function initializeUserCatalogSections(catalogName, structure) {
    const checkboxContainer = document.getElementById("patternCheckboxes");

    if (!checkboxContainer) return;

    checkboxContainer.innerHTML = '';
    checkboxContainer.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-2');
    checkboxContainer.classList.add('flex', 'flex-col', 'gap-4');

    // Pre každý folder vytvoríme sekciu
    Object.entries(structure).forEach(([folderName, files]) => {
        const sectionContainer = document.createElement("div");
        sectionContainer.className = "pattern-language-section w-full";

        const sectionHeader = document.createElement("div");
        sectionHeader.className = "pattern-language-header bg-gray-200 dark:bg-gray-700 p-3 rounded-lg cursor-pointer flex justify-between items-center w-full";
        
        const patternCount = Object.keys(files).length;
        
        sectionHeader.innerHTML = `
            <div class="flex items-center flex-wrap gap-2">
                <h3 class="font-semibold text-gray-800 dark:text-gray-200">${folderName}</h3>
                <span class="language-counter text-sm font-normal text-gray-600 dark:text-gray-400">(0/${patternCount})</span>
                <!-- Vyhľadávacie pole v hlavičke - spočiatku skryté -->
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
        patternsContainer.className = "patterns-grid grid grid-cols-1 md:grid-cols-2 gap-2 p-2 max-h-48 overflow-y-auto w-full";
        patternsContainer.dataset.language = folderName;

        Object.keys(files).forEach(filename => {
            const pattern = allPatternsData[filename];
            if (!pattern) return;
            
            const label = document.createElement("label");
            label.classList.add("flex", "items-center", "space-x-2", "p-2", "hover:bg-gray-50", "dark:hover:bg-gray-700", "rounded", "group");
            label.dataset.patternName = pattern.name.toLowerCase();

            // Vytvoríme kontajner pre celý riadok
            const rowDiv = document.createElement('div');
            rowDiv.className = "flex items-center justify-between w-full";

            // Ľavá časť - checkbox a názov
            const leftDiv = document.createElement('div');
            leftDiv.className = "flex items-center space-x-2 flex-grow";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.value = filename;
            checkbox.classList.add("form-checkbox", "h-5", "w-5", "text-indigo-600", "flex-shrink-0");
            checkbox.checked = globalCheckedPatterns[catalogName]?.[filename] || false;

            // PRIDANÉ: ID pre checkbox pre jednoduchšie prepojenie s vlajočkou
            checkbox.id = `cb-${catalogName}-${filename.replace(/[^a-z0-9]/gi, '_')}`;

            // Pridaj event listener pre zmenu checkboxu
            checkbox.addEventListener('change', (e) => {
                if (!globalCheckedPatterns[catalogName]) {
                    globalCheckedPatterns[catalogName] = {};
                }
                globalCheckedPatterns[catalogName][filename] = e.target.checked;
                updateCatalogBadges();
                updateSelectAllButtonsColor();
                updateAllLanguageCounters();
                
                // PRIDANÉ: Ak sa checkbox odškrtne, zrušíme vlajočku
                if (!e.target.checked && forcedStartPattern === filename) {
                    forcedStartPattern = null;
                    updateStartFlags();
                }
            });

            const span = document.createElement("span");
            span.textContent = pattern.name;
            span.classList.add("text-sm", "dark:text-gray-300", "flex-grow");

            leftDiv.appendChild(checkbox);
            leftDiv.appendChild(span);

            // Namiesto jedného flagDiv vytvoríme kontajner pre dve ikony
            const iconsDiv = document.createElement('div');
            iconsDiv.className = "icons-container ml-2 flex items-center gap-1";

            // Terč (cieľ)
            const goalSpan = document.createElement('span');
            goalSpan.className = `goal-flag cursor-pointer text-lg hover:opacity-100 transition-opacity ${forcedGoalPattern === filename ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`;
            goalSpan.setAttribute('data-filename', filename);
            goalSpan.setAttribute('data-checkbox-id', checkbox.id);
            goalSpan.setAttribute('title', translations[currentLanguage]?.setAsGoal || 'Nastaviť ako cieľový vzor');
            goalSpan.innerHTML = '🎯';

            // Vlajka (štart)
            const flagSpan = document.createElement('span');
            flagSpan.className = `start-flag cursor-pointer text-lg hover:opacity-100 transition-opacity ${forcedStartPattern === filename ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`;
            flagSpan.setAttribute('data-filename', filename);
            flagSpan.setAttribute('data-checkbox-id', checkbox.id);
            flagSpan.setAttribute('title', translations[currentLanguage]?.setAsStart || 'Nastaviť ako štartovací vzor');
            flagSpan.innerHTML = '🚩';

            // 🔴 UPRAVENÝ EVENT LISTENER PRE VLAJKU
            flagSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const clickedFilename = flagSpan.dataset.filename;
                const checkboxId = flagSpan.dataset.checkboxId;
                const targetCheckbox = document.getElementById(checkboxId);
                
                // Ak klikáme na už aktívnu vlajku, zrušíme štart
                if (forcedStartPattern === clickedFilename) {
                    forcedStartPattern = null;
                } else {
                    forcedStartPattern = clickedFilename;
                    
                    // Ak bol nastavený cieľ na rovnakom vzore, zrušíme ho
                    if (forcedGoalPattern === clickedFilename) {
                        forcedGoalPattern = null;
                    }
                    
                    // Automaticky zaškrtneme checkbox
                    if (targetCheckbox && !targetCheckbox.checked) {
                        targetCheckbox.checked = true;
                        
                        // Aktualizujeme globálny stav
                        if (!globalCheckedPatterns[catalogName]) {
                            globalCheckedPatterns[catalogName] = {};
                        }
                        globalCheckedPatterns[catalogName][clickedFilename] = true;
                        
                        // Aktualizujeme UI
                        updateCatalogBadges();
                        updateSelectAllButtonsColor();
                        updateAllLanguageCounters();
                        updateGenerateButtonState();
                    }
                }
                
                // Aktualizujeme všetky vlajky a terče
                updateStartFlags();
                updateGoalFlags();
            });

            // PRE TERČ (cieľ)
            goalSpan.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                
                const clickedFilename = goalSpan.dataset.filename;
                const checkboxId = goalSpan.dataset.checkboxId;
                const targetCheckbox = document.getElementById(checkboxId);
                
                // Ak klikáme na už aktívny terč, zrušíme cieľ
                if (forcedGoalPattern === clickedFilename) {
                    forcedGoalPattern = null;
                } else {
                    forcedGoalPattern = clickedFilename;
                    
                    // Ak bol nastavený štart na rovnakom vzore, zrušíme ho
                    if (forcedStartPattern === clickedFilename) {
                        forcedStartPattern = null;
                    }
                    
                    // Automaticky zaškrtneme checkbox
                    if (targetCheckbox && !targetCheckbox.checked) {
                        targetCheckbox.checked = true;
                        
                        // Aktualizujeme globálny stav
                        if (!globalCheckedPatterns[catalogName]) {
                            globalCheckedPatterns[catalogName] = {};
                        }
                        globalCheckedPatterns[catalogName][clickedFilename] = true;
                        
                        // Aktualizujeme UI
                        updateCatalogBadges();
                        updateSelectAllButtonsColor();
                        updateAllLanguageCounters();
                        updateGenerateButtonState();
                    }
                }
                
                // Aktualizujeme všetky vlajky a terče
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

        // Vyhľadávací input
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
            
            // Zistíme všetky checkboxy v tejto sekcii
            const checkboxes = patternsContainer.querySelectorAll('input[type="checkbox"]');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
            
            // Prejdeme všetky checkboxy
            checkboxes.forEach(checkbox => {
                checkbox.checked = !allChecked;
                if (!globalCheckedPatterns[catalogName]) {
                    globalCheckedPatterns[catalogName] = {};
                }
                globalCheckedPatterns[catalogName][checkbox.value] = checkbox.checked;
            });
            
            // ★ NOVÉ: Ak sme všetky odškrtli (allChecked bolo true, teraz sú všetky false)
            if (allChecked) {
                // Prejdeme všetky checkboxy v tejto sekcii a zistíme, či niektorý nebol štart alebo cieľ
                checkboxes.forEach(checkbox => {
                    // Ak bol tento vzor nastavený ako štart, zrušíme ho
                    if (forcedStartPattern === checkbox.value) {
                        forcedStartPattern = null;
                    }
                    // Ak bol tento vzor nastavený ako cieľ, zrušíme ho
                    if (forcedGoalPattern === checkbox.value) {
                        forcedGoalPattern = null;
                    }
                });
                
                // Aktualizujeme vlajky a terče
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
                const labels = patternsContainer.querySelectorAll('label');
                labels.forEach(label => label.style.display = 'flex');
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

async function loadAllPatterns() {
    if (currentCatalog !== 'coplien') {
        await loadUserCatalog(currentCatalog);
        return;
    }

    document.getElementById('loadingIndicator').classList.remove('hidden');
    
    // Pridáme počítadlo do loading indikátora
    const loadingText = document.querySelector('#loadingIndicator p');
    const originalText = loadingText.textContent;
    const t = translations[currentLanguage];
    
    try {
        // Spočítame celkový počet vzorov
        let totalPatterns = 0;
        Object.values(patternLanguages).forEach(files => {
            totalPatterns += files.length;
        });
        
        let loadedCount = 0;
        
        // NEMAŽEME allPatternsData, len pridávame
        for (const [language, files] of Object.entries(patternLanguages)) {
            for (const file of files) {
                // Pridávame len ak ešte nie je nahratý
                if (!allPatternsData[file]) {
                    const response = await fetch(`patterns/${language}/${file}`);
                    if (response.ok) {
                        const content = await response.text();
                        allPatternsData[file] = {
                            name: file.replace('.txt', '').replace(/_/g, ' '),
                            content: content,
                            filename: file,
                            language: language
                        };
                        loadedCount++;
                        
                        // Aktualizujeme text loading indikátora s prekladom
                        loadingText.textContent = t.loadingProgress
                            .replace('{current}', loadedCount)
                            .replace('{total}', totalPatterns);
                    }
                } else {
                    // Ak už bol nahratý, tiež ho počítame
                    loadedCount++;
                    loadingText.textContent = t.loadingProgress
                        .replace('{current}', loadedCount)
                        .replace('{total}', totalPatterns);
                }
            }
        }
        
        initializePatternSections();
    } catch (err) {
        showToast(translations[currentLanguage]?.loadError || 'Chyba pri načítavaní vzorov.', 'error');
    } finally {
        // Obnovíme pôvodný text a skryjeme loading
        loadingText.textContent = originalText;
        document.getElementById('loadingIndicator').classList.add('hidden');
    }
}

function initializePatternSections() {
    const checkboxContainer = document.getElementById("patternCheckboxes");
    checkboxContainer.innerHTML = '';

    checkboxContainer.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-2');
    checkboxContainer.classList.add('flex', 'flex-col', 'gap-4');

    for (const [language, files] of Object.entries(patternLanguages)) {
        const sectionContainer = document.createElement("div");
        sectionContainer.className = "pattern-language-section w-full";

        const sectionHeader = document.createElement("div");
        sectionHeader.className = "pattern-language-header bg-gray-200 dark:bg-gray-700 p-3 rounded-lg cursor-pointer flex justify-between items-center w-full";
        sectionHeader.innerHTML = `
            <div class="flex items-center flex-wrap gap-2">
                <h3 class="font-semibold text-gray-800 dark:text-gray-200">${language.replace(/_/g, ' ')}</h3>
                <span class="language-counter text-sm font-normal text-gray-600 dark:text-gray-400">(0/${files.length})</span>
                <!-- Vyhľadávacie pole v hlavičke - spočiatku skryté -->
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
        patternsContainer.className = "patterns-grid grid grid-cols-1 md:grid-cols-2 gap-2 p-2 max-h-48 overflow-y-auto w-full";
        patternsContainer.dataset.language = language;


        files.forEach(file => {
            if (allPatternsData[file]) {
                const label = document.createElement("label");
                label.classList.add("flex", "items-center", "space-x-2", "p-2", "hover:bg-gray-50", "dark:hover:bg-gray-700", "rounded", "group");
                label.dataset.patternName = allPatternsData[file].name.toLowerCase();

                // Vytvoríme kontajner pre celý riadok
                const rowDiv = document.createElement('div');
                rowDiv.className = "flex items-center justify-between w-full";

                // Ľavá časť - checkbox a názov
                const leftDiv = document.createElement('div');
                leftDiv.className = "flex items-center space-x-2 flex-grow";

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = file;
                checkbox.classList.add("form-checkbox", "h-5", "w-5", "text-indigo-600", "flex-shrink-0");
                checkbox.checked = globalCheckedPatterns[language]?.[file] || false;
                checkbox.id = `cb-${language}-${file.replace(/[^a-z0-9]/gi, '_')}`;

                checkbox.addEventListener('change', (e) => {
                    if (!globalCheckedPatterns[language]) {
                        globalCheckedPatterns[language] = {};
                    }
                    globalCheckedPatterns[language][file] = e.target.checked;
                    updateCatalogBadges();
                    updateSelectAllButtonsColor();
                    updateAllLanguageCounters();
                    
                    if (!e.target.checked && forcedStartPattern === file) {
                        forcedStartPattern = null;
                        updateStartFlags();
                    }
                    if (!e.target.checked && forcedGoalPattern === file) {
                        forcedGoalPattern = null;
                        updateGoalFlags();
                    }
                });

                const span = document.createElement("span");
                span.textContent = allPatternsData[file].name;
                span.classList.add("text-sm", "dark:text-gray-300", "flex-grow");

                leftDiv.appendChild(checkbox);
                leftDiv.appendChild(span);

                // KONTAJNER PRE DVE IKONY
                const iconsDiv = document.createElement('div');
                iconsDiv.className = "icons-container ml-2 flex items-center gap-1";

                // TERČ (cieľ)
                const goalSpan = document.createElement('span');
                goalSpan.className = `goal-flag cursor-pointer text-lg hover:opacity-100 transition-opacity ${forcedGoalPattern === file ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`;
                goalSpan.setAttribute('data-filename', file);
                goalSpan.setAttribute('data-checkbox-id', checkbox.id);
                goalSpan.setAttribute('title', translations[currentLanguage]?.setAsGoal || 'Nastaviť ako cieľový vzor');
                goalSpan.innerHTML = '🎯';

                // VLAJKA (štart)
                const flagSpan = document.createElement('span');
                flagSpan.className = `start-flag cursor-pointer text-lg hover:opacity-100 transition-opacity ${forcedStartPattern === file ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`;
                flagSpan.setAttribute('data-filename', file);
                flagSpan.setAttribute('data-checkbox-id', checkbox.id);
                flagSpan.setAttribute('title', translations[currentLanguage]?.setAsStart || 'Nastaviť ako štartovací vzor');
                flagSpan.innerHTML = '🚩';

                // EVENT LISTENER PRE VLAJKU
                flagSpan.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const clickedFilename = flagSpan.dataset.filename;
                    const checkboxId = flagSpan.dataset.checkboxId;
                    const targetCheckbox = document.getElementById(checkboxId);
                    
                    if (forcedStartPattern === clickedFilename) {
                        forcedStartPattern = null;
                    } else {
                        forcedStartPattern = clickedFilename;
                        if (forcedGoalPattern === clickedFilename) {
                            forcedGoalPattern = null;
                        }
                        if (targetCheckbox && !targetCheckbox.checked) {
                            targetCheckbox.checked = true;
                            if (!globalCheckedPatterns[language]) {
                                globalCheckedPatterns[language] = {};
                            }
                            globalCheckedPatterns[language][clickedFilename] = true;
                            updateCatalogBadges();
                            updateSelectAllButtonsColor();
                            updateAllLanguageCounters();
                            updateGenerateButtonState();
                        }
                    }
                    updateStartFlags();
                    updateGoalFlags();
                });

                // EVENT LISTENER PRE TERČ
                goalSpan.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    
                    const clickedFilename = goalSpan.dataset.filename;
                    const checkboxId = goalSpan.dataset.checkboxId;
                    const targetCheckbox = document.getElementById(checkboxId);
                    
                    if (forcedGoalPattern === clickedFilename) {
                        forcedGoalPattern = null;
                    } else {
                        forcedGoalPattern = clickedFilename;
                        if (forcedStartPattern === clickedFilename) {
                            forcedStartPattern = null;
                        }
                        if (targetCheckbox && !targetCheckbox.checked) {
                            targetCheckbox.checked = true;
                            if (!globalCheckedPatterns[language]) {
                                globalCheckedPatterns[language] = {};
                            }
                            globalCheckedPatterns[language][clickedFilename] = true;
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
            }
        });

        sectionContent.appendChild(patternsContainer);

        // Vyhľadávací input (v hlavičke)
        const searchContainer = sectionHeader.querySelector('.search-container');
        const searchInput = searchContainer.querySelector('.search-input');

        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const labels = patternsContainer.querySelectorAll('label');

            labels.forEach(label => {
                const patternName = label.dataset.patternName || '';
                if (patternName.includes(searchTerm)) {
                    label.style.display = 'flex';
                } else {
                    label.style.display = 'none';
                }
            });
        });

        const selectAllBtn = sectionHeader.querySelector('.select-all-btn');
        selectAllBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectAllPatternsInLanguage(language);
        });

        sectionHeader.addEventListener('click', (e) => {
            // Nezatvárame ak klikáme na search input
            if (e.target.classList.contains('search-input')) return;

            const isHidden = sectionContent.classList.contains('hidden');
            sectionContent.classList.toggle('hidden');

            // Zobrazíme/skryjeme vyhľadávacie pole podľa stavu sekcie
            if (isHidden) {
                // Sekcia sa otvára - zobrazíme search
                searchContainer.classList.remove('search-hidden');
                // Vyčistíme search input a resetujeme zobrazenie
                searchInput.value = '';
                const labels = patternsContainer.querySelectorAll('label');
                labels.forEach(label => label.style.display = 'flex');
            } else {
                // Sekcia sa zatvára - schováme search
                searchContainer.classList.add('search-hidden');
            }

            const arrow = sectionHeader.querySelector('svg:last-child');
            arrow.style.transform = isHidden ? 'rotate(180deg)' : 'rotate(0deg)';
        });

        sectionContainer.appendChild(sectionHeader);
        sectionContainer.appendChild(sectionContent);
        checkboxContainer.appendChild(sectionContainer);
    }

    updateCatalogBadges();
    updateAllLanguageCounters();
    updateSelectAllButtonsColor();  
}

async function removeCatalog(catalogName) {
    const t = translations[currentLanguage];
    
    // Zobrazenie konfirmačného toastu s prekladmi
    const confirmed = await showConfirmToast(
        `${t.confirmDelete} "${catalogName}"?`,
        t.confirmYes,
        t.confirmNo,
        10000 // 10 sekúnd na rozhodnutie
    );
    
    if (confirmed) {
        delete userCatalogs[catalogName];
        delete globalCheckedPatterns[catalogName];

        if (currentCatalog === catalogName) {
            switchToCoplienCatalog();
        } else {
            updateCatalogButtons();
        }

        updateCatalogBadges(); 
        updateGenerateButtonState();
        
        const successMessage = t.catalogDeleted.replace('{catalogName}', `"${catalogName}"`);
        showToast(`${successMessage}`, 'success');
    } else {
        showToast(t.catalogDeletionCancelled, 'info', 2000);
    }
}

function selectAllPatternsInLanguage(languageName) {
    const checkboxes = document.querySelectorAll('#patternCheckboxes input[type="checkbox"]');
    let allChecked = true;

    // Zistíme, či sú všetky checkboxy v tejto sekcii zaškrtnuté
    checkboxes.forEach(checkbox => {
        const pattern = allPatternsData[checkbox.value];
        if (pattern && pattern.language === languageName && !checkbox.checked) {
            allChecked = false;
        }
    });

    // Prejdeme všetky checkboxy v tejto sekcii
    checkboxes.forEach(checkbox => {
        const pattern = allPatternsData[checkbox.value];
        if (pattern && pattern.language === languageName) {
            checkbox.checked = !allChecked;

            // Aktualizuj globálny stav
            if (!globalCheckedPatterns[languageName]) {
                globalCheckedPatterns[languageName] = {};
            }
            globalCheckedPatterns[languageName][checkbox.value] = checkbox.checked;
        }
    });

    // ★ NOVÉ: Ak sme všetky odškrtli (allChecked bolo true, teraz sú všetky false)
    if (allChecked) {
        // Prejdeme všetky checkboxy v tejto sekcii a zistíme, či niektorý nebol štart alebo cieľ
        checkboxes.forEach(checkbox => {
            const pattern = allPatternsData[checkbox.value];
            if (pattern && pattern.language === languageName) {
                // Ak bol tento vzor nastavený ako štart, zrušíme ho
                if (forcedStartPattern === checkbox.value) {
                    forcedStartPattern = null;
                }
                // Ak bol tento vzor nastavený ako cieľ, zrušíme ho
                if (forcedGoalPattern === checkbox.value) {
                    forcedGoalPattern = null;
                }
            }
        });
        
        // Aktualizujeme vlajky a terče
        updateStartFlags();
        updateGoalFlags();
    }

    updateAllLanguageCounters();
    updateCatalogBadges(); 
    updateGenerateButtonState();
    updateSelectAllButtonsColor();  
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
