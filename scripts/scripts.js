//scripts.js

let sortableInstance = null;
let allPatternsData = {};
let currentCatalog = 'coplien';
let userCatalogs = {};
let originalSequence = []; 
let originalSimilarityMatrix = {}; 
let isSequenceReordered = false; 
// Na začiatok súboru, k existujúcim premenným
let globalCheckedPatterns = {}; // { "catalogName": { "filename1": true, "filename2": true } }


const patternLanguages = {
    "Project_Management_Pattern_Language": [
        "build_prototypes.txt", "community_of_trust.txt", "completion_headroom.txt",
        "day_care.txt", "developer_controls_process.txt", "development_episode.txt",
        "dont_interrupt_an_interrupt.txt", "get_on_with_it.txt", "implied_requirements.txt",
        "incremental_integration.txt", "informal_labor_plan.txt", "interrupts_unjam_blocking.txt",
        "mercenary_analyst.txt", "named_stable_bases.txt", "private_world.txt",
        "programming_episode.txt", "recommitment_meeting.txt", "sacrifice_one_person.txt",
        "size_the_schedule.txt", "someone_always_makes_progress.txt", "take_no_small_slips.txt",
        "team_per_task.txt", "work_flows_inward.txt", "work_queue.txt", "work_split.txt"
    ],
    "Piecemeal_Growth_Pattern_Language": [
        "application_design_is_bounded_by_test_design.txt", "apprenticeship.txt", "compensate_success.txt",
        "failed_project_wake.txt", "engage_quality_assurance.txt", "engage_customers.txt",
        "domain_expertise_in_roles.txt", "diverse_groups.txt", "developing_in_pairs.txt",
        "fire_walls.txt", "gate_keeper.txt", "group_validation.txt",
        "holistic_diversity.txt", "legend_role.txt", "matron_role.txt",
        "moderate_truck_number.txt", "patron_role.txt", "phasing_it_in.txt",
        "public_character.txt", "scenarios_define_problem.txt", "self_selecting_team.txt",
        "size_the_organization.txt", "skunk_works.txt", "solo_virtuoso.txt",
        "subsystem_by_skill.txt", "surrogate_customer.txt", "team_pride.txt",
        "unity_of_purpose.txt", "wise_fool.txt"
    ],
    "People_and_Code_Pattern_Language": [
        "architect_also_implements.txt", "architect_controls_product.txt", "architecture_team.txt",
        "code_ownership.txt", "deploy_along_the_grain.txt", "feature_assignment.txt",
        "generics_and_specifics.txt", "hierarchy_of_factories.txt", "lock_’em_up_together.txt",
        "loose_interfaces.txt", "parser_builder.txt", "private_versioning.txt",
        "smoke_filled_room.txt", "stand_up_meeting.txt", "standards_linking_locations.txt",
        "subclass_per_team.txt", "variation_behind_interface.txt"
    ],
    "Organizational_Style_Pattern_Language": [
        "the_water_cooler.txt", "three_to_seven_helpers_per_role.txt", "upside_down_matrix_management.txt",
        "conway's_law.txt", "coupling_decreases_latency.txt", "decouple_stages.txt",
        "distribute_work_evenly.txt", "divide_and_conquer.txt", "face_to_face_before_working_remotely.txt",
        "few_roles.txt", "form_follows_function.txt", "hallway_chatter.txt",
        "hub_spoke_and_rim.txt", "move_responsibilites.txt", "organization_follows_location.txt",
        "organization_follows_market.txt", "producer_roles.txt", "producers_in_the_middle.txt",
        "responsibilities_engage.txt", "shaping_circulation_realms.txt", "stable_roles.txt"
    ]
};

// ========== CATALOG ==========

function switchToCoplienCatalog() {
    currentCatalog = 'coplien';
    updateCatalogButtons();
    loadAllPatterns();
}

function switchToUserCatalog(catalogName) {
    if (!userCatalogs[catalogName]) {
        alert('Katalóg nebol nájdený');
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
    try {
        const catalog = userCatalogs[catalogName];

        // NEMAŽEME allPatternsData, len pridávame
        for (const [filename, content] of Object.entries(catalog.patterns)) {
            allPatternsData[filename] = {  // Pridávame do existujúceho objektu
                name: filename.replace('.txt', '').replace(/_/g, ' '),
                content: content,
                filename: filename,
                language: catalogName
            };
        }

        initializeUserCatalogSections(catalogName, catalog.patterns);
    } catch (err) {
        alert('Chyba pri načítaní katalógu: ' + err.message);
    } finally {
        document.getElementById('loadingIndicator').classList.add('hidden');
    }
}

function initializeUserCatalogSections(catalogName, patterns) {
    const checkboxContainer = document.getElementById("patternCheckboxes");

    if (!checkboxContainer) {
        return;
    }

    checkboxContainer.innerHTML = '';

    checkboxContainer.classList.remove('grid', 'grid-cols-1', 'md:grid-cols-2', 'gap-2');
    checkboxContainer.classList.add('flex', 'flex-col', 'gap-4');

    const sectionContainer = document.createElement("div");
    sectionContainer.className = "pattern-language-section w-full";

    const sectionHeader = document.createElement("div");
    sectionHeader.className = "pattern-language-header bg-gray-200 dark:bg-gray-700 p-3 rounded-lg cursor-pointer flex justify-between items-center w-full";
    sectionHeader.innerHTML = `
        <div class="flex items-center flex-wrap gap-2">
            <h3 class="font-semibold text-gray-800 dark:text-gray-200">${catalogName}</h3>
            <span class="language-counter text-sm font-normal text-gray-600 dark:text-gray-400">(0/${Object.keys(patterns).length})</span>
            <!-- Vyhľadávacie pole v hlavičke - spočiatku skryté -->
            <div class="search-container relative ml-auto search-hidden" onclick="event.stopPropagation()">
                <input type="text" 
                    class="search-input text-xs pl-7 pr-2 py-1 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 w-32 focus:w-48 transition-all duration-300 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Hľadať...">
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
    patternsContainer.dataset.language = catalogName;

    Object.keys(patterns).forEach(filename => {
        

        const pattern = allPatternsData[filename];
        const label = document.createElement("label");
        label.classList.add("flex", "items-center", "space-x-2", "p-2", "hover:bg-gray-50", "dark:hover:bg-gray-700", "rounded");
        label.dataset.patternName = pattern.name.toLowerCase();

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = filename;
        checkbox.classList.add("form-checkbox", "h-5", "w-5", "text-indigo-600", "flex-shrink-0");

        // ⬇️ TU VLOŽ TENTO KÓD ⬇️
        // Nastav checked podľa globálneho stavu
        checkbox.checked = globalCheckedPatterns[catalogName]?.[filename] || false;

        // Pridaj event listener pre zmenu
        checkbox.addEventListener('change', (e) => {
            if (!globalCheckedPatterns[catalogName]) {
                globalCheckedPatterns[catalogName] = {};
            }
            globalCheckedPatterns[catalogName][filename] = e.target.checked;
            updateCatalogBadges();
        });
        // ⬆️ KONIEC VLOŽENÉHO KÓDU ⬆️

        const span = document.createElement("span");
        span.textContent = pattern.name;
        span.classList.add("text-sm", "dark:text-gray-300", "flex-grow");

        label.appendChild(checkbox);
        label.appendChild(span);
        patternsContainer.appendChild(label);
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
        selectAllPatternsInLanguage(catalogName);
    });

    sectionHeader.addEventListener('click', (e) => {
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

    updateCatalogBadges();
    updateAllLanguageCounters();
}

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

    // Aktivujeme tlačidlo (pre prípad, že bolo deaktivované)
    const confirmBtn = document.getElementById('confirmCatalog');
    confirmBtn.disabled = false;
    confirmBtn.classList.remove('opacity-50', 'cursor-not-allowed');

    document.getElementById('catalogModal').classList.remove('hidden');
});

document.getElementById('closeCatalogModal').addEventListener('click', () => {
    document.getElementById('catalogModal').classList.add('hidden');
});

document.getElementById('cancelCatalog').addEventListener('click', () => {
    document.getElementById('catalogModal').classList.add('hidden');
});

document.getElementById('confirmCatalog').addEventListener('click', async () => {
    const catalogNameInput = document.getElementById('catalogName');
    const folderInput = document.getElementById('catalogFolderInput');
    const errorElement = document.getElementById('catalogNameError');

    const catalogName = catalogNameInput.value.trim();
    const errors = validateCatalogName(catalogName);

    if (errors.length > 0) {
        errorElement.textContent = errors[0];
        errorElement.classList.remove('hidden');
        catalogNameInput.classList.add('border-red-500', 'focus:ring-red-500');
        return;
    }

    if (!folderInput.files || folderInput.files.length === 0) {
        alert('Vyberte priečinok s txt súbormi');
        return;
    }

    document.getElementById('loadingIndicator').classList.remove('hidden');

    try {
        const patterns = {};
        const txtFiles = Array.from(folderInput.files).filter(file =>
            file.name.toLowerCase().endsWith('.txt')
        );

        if (txtFiles.length === 0) {
            alert('Priečinok neobsahuje žiadne txt súbory');
            return;
        }

        for (const file of txtFiles) {
            try {
                const content = await readFileAsText(file);
                patterns[file.name] = content;
            } catch (fileError) {
                continue;
            }
        }

        if (Object.keys(patterns).length === 0) {
            alert('Nepodarilo sa načítať žiadne txt súbory');
            return;
        }

        userCatalogs[catalogName] = {
            name: catalogName,
            patterns: patterns
        };

        document.getElementById('catalogModal').classList.add('hidden');
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
        alert('Chyba pri načítaní katalógu: ' + err.message);
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

// ========== PATTERN LOADING ==========

async function loadAllPatterns() {
    if (currentCatalog !== 'coplien') {
        await loadUserCatalog(currentCatalog);
        return;
    }

    document.getElementById('loadingIndicator').classList.remove('hidden');
    try {
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
                    }
                }
            }
        }
        initializePatternSections();
    } catch (err) {
        alert('Chyba v načítavaní.');
    } finally {
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
                        placeholder="Hľadať...">
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
                label.classList.add("flex", "items-center", "space-x-2", "p-2", "hover:bg-gray-50", "dark:hover:bg-gray-700", "rounded");
                label.dataset.patternName = allPatternsData[file].name.toLowerCase();

                const checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.value = file;
                checkbox.classList.add("form-checkbox", "h-5", "w-5", "text-indigo-600", "flex-shrink-0");

                // ⬇️ TU VLOŽ TENTO KÓD ⬇️
                // Nastav checked podľa globálneho stavu
                checkbox.checked = globalCheckedPatterns[language]?.[file] || false;

                // Pridaj event listener pre zmenu
                checkbox.addEventListener('change', (e) => {
                    if (!globalCheckedPatterns[language]) {
                        globalCheckedPatterns[language] = {};
                    }
                    globalCheckedPatterns[language][file] = e.target.checked;
                    updateCatalogBadges();
                });
                // ⬆️ KONIEC VLOŽENÉHO KÓDU ⬆️

                const span = document.createElement("span");
                span.textContent = allPatternsData[file].name;
                span.classList.add("text-sm", "dark:text-gray-300", "flex-grow");

                label.appendChild(checkbox);
                label.appendChild(span);
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
}

// ========== UI CONTROLS ==========

document.getElementById('clearBtn').addEventListener('click', () => {

    globalCheckedPatterns = {};

    // 1. Zruší všetky zvolené checkboxy
    const checkboxes = document.querySelectorAll('#patternCheckboxes input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);

    // 2. Vymaže navrhnutú sekvenciu
    const patternsList = document.getElementById('patternsList');
    patternsList.innerHTML = '';

    // 3. Skryje sekciu navrhnutej sekvencie
    document.getElementById('suggestionsSection').classList.add('hidden');

    // 4. Vymaže maticu podobností
    document.getElementById('similarityMatrix').innerHTML = '';
    document.getElementById('similarityInfo').classList.add('hidden');

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
});

document.getElementById('coplienBtn').addEventListener('click', switchToCoplienCatalog);

document.getElementById("generateBtn").addEventListener("click", async () => {
    // Už nepotrebujeme zbierať selectedPatterns tu
    try {
        await generateSequence();  // Voláme bez parametra
    } catch (error) {
        alert('Chyba pri generovaní sekvencie. Skúste to znova.');
    }
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
    // Nájdi všetky tlačidlá katalógov
    const catalogButtons = document.querySelectorAll('#catalogButtonsContainer button');

    catalogButtons.forEach(btn => {
        // Pre Coplien - špeciálne spracovanie
        if (catalogName === 'coplien') {
            if (btn.id === 'coplienBtn') {
                // Odstráň existujúci badge
                const existingBadge = btn.querySelector('.catalog-badge');
                if (existingBadge) existingBadge.remove();

                // Pridaj nový badge len ak je count > 0
                if (count > 0) {
                    const badge = document.createElement('span');
                    badge.className = 'catalog-badge absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold';
                    badge.textContent = count;
                    btn.style.position = 'relative';
                    btn.appendChild(badge);
                }
            }
        }
        // Pre user katalógy
        else if (btn.textContent.includes(catalogName) && !btn.id) {
            // Odstráň existujúci badge
            const existingBadge = btn.querySelector('.catalog-badge');
            if (existingBadge) existingBadge.remove();

            // Pridaj nový badge len ak je count > 0
            if (count > 0) {
                const badge = document.createElement('span');
                badge.className = 'catalog-badge absolute -top-2 -right-2 bg-indigo-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold';
                badge.textContent = count;
                btn.style.position = 'relative';
                btn.appendChild(badge);
            }
        }
    });
}

// ========== DISPLAY & DRAG/DROP ==========

function initializeSortable() {
    if (sortableInstance) {
        sortableInstance.destroy();
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

function escapeHtml(unsafe) {
    return unsafe.replace(/[&<"'>]/g, function (m) {
        switch (m) {
            case '&': return '&amp;';
            case '<': return '&lt;';
            case '>': return '&gt;';
            case '"': return '&quot;';
            case "'": return '&#039;';
            default: return m;
        }
    });
}

// ========== EXPORT FUNCTIONALITY ==========

document.getElementById('exportBtn').addEventListener('click', () => {
    const patterns = Array.from(document.querySelectorAll('#patternsList .pattern-item'));
    const sequenceData = patterns.map((item, index) => {
        const patternName = item.dataset.patternName;
        const pattern = allPatternsData[patternName];
        return {
            order: index + 1,
            name: pattern.name,
            content: pattern.content,
            language: pattern.language
        };
    });

    const exportText = generateExportText(sequenceData);
    downloadAsText(exportText, 'pattern_sequence.txt');
});

function generateExportText(sequenceData) {
    let text = 'SEKVENCIA ORGANIZAČNÝCH VZOROV\n';
    text += 'Generované pomocou Patterna\n';
    text += `Dátum: ${new Date().toLocaleDateString('sk-SK')}\n\n`;

    sequenceData.forEach(item => {
        text += `${item.order}. ${item.name}\n`;
        text += `   Jazyk: ${item.language.replace(/_/g, ' ')}\n`;
        text += `   Obsah: ${item.content.substring(0, 200)}...\n\n`;
    });

    return text;
}

function downloadAsText(text, filename) {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// ========== INITIALIZE APP ==========

document.addEventListener('DOMContentLoaded', () => {
    loadAllPatterns();
    updateCatalogButtons();
    setupCheckboxChangeListeners();
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

// Funkcia na počítanie zakliknutých vzorov v jazyku
function countCheckedPatternsInLanguage(languageName) {
    const checkboxes = document.querySelectorAll('#patternCheckboxes input[type="checkbox"]');
    let count = 0;

    checkboxes.forEach(checkbox => {
        const pattern = allPatternsData[checkbox.value];
        if (pattern && pattern.language === languageName && checkbox.checked) {
            count++;
        }
    });

    return count;
}

// Funkcia na aktualizáciu všetkých počítadiel
function updateAllLanguageCounters() {
    // Pre všetky jazyky v patternLanguages (Coplien)
    Object.keys(patternLanguages).forEach(language => {
        const totalPatterns = patternLanguages[language].length;
        // Spočítaj zaškrtnuté z globálneho stavu
        const checkedCount = Object.keys(globalCheckedPatterns[language] || {})
            .filter(f => globalCheckedPatterns[language][f]).length;
        updateLanguageCounter(language, checkedCount, totalPatterns);
    });

    // Pre user katalógy
    Object.keys(userCatalogs).forEach(catalogName => {
        const totalPatterns = Object.keys(userCatalogs[catalogName].patterns).length;
        const checkedCount = Object.keys(globalCheckedPatterns[catalogName] || {})
            .filter(f => globalCheckedPatterns[catalogName][f]).length;
        updateLanguageCounter(catalogName, checkedCount, totalPatterns);
    });
}

// Event listener pre zmenu checkboxov
function setupCheckboxChangeListeners() {
    document.addEventListener('change', (e) => {
        if (e.target.type === 'checkbox' && e.target.closest('#patternCheckboxes')) {
            updateAllLanguageCounters();
        }
    });
}

function removeCatalog(catalogName) {
    if (confirm(`Naozaj chcete odstrániť katalóg "${catalogName}"?`)) {
        delete userCatalogs[catalogName];
        delete globalCheckedPatterns[catalogName]; // VYMAŽ Z GLOBÁLNEHO STAVU

        if (currentCatalog === catalogName) {
            switchToCoplienCatalog();
        } else {
            updateCatalogButtons();
        }

        updateCatalogBadges(); // Aktualizuj badge
    }
}

function selectAllPatternsInLanguage(languageName) {
    const checkboxes = document.querySelectorAll('#patternCheckboxes input[type="checkbox"]');
    let allChecked = true;

    checkboxes.forEach(checkbox => {
        const pattern = allPatternsData[checkbox.value];
        if (pattern && pattern.language === languageName && !checkbox.checked) {
            allChecked = false;
        }
    });

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

    updateAllLanguageCounters();
    updateCatalogBadges(); // Aktualizuj badge
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
        alert('Nepodarilo sa skopírovať sekvenciu');
    });
}

document.getElementById('resetSequenceBtn').addEventListener('click', resetSequenceToOriginal);
document.getElementById('copySequenceBtn').addEventListener('click', copySequenceToClipboard);

    function makePatternsDraggable() {
        document.querySelectorAll('#patternCheckboxes label').forEach(label => {
            label.draggable = true;
            label.addEventListener('dragstart', (e) => {
                const checkbox = label.querySelector('input');
                e.dataTransfer.setData('text/plain', checkbox.value);
                e.dataTransfer.effectAllowed = 'copy';
            });
        });

        const sequenceArea = document.getElementById('patternsList');
        sequenceArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            sequenceArea.classList.add('bg-blue-50', 'border-2', 'border-dashed', 'border-blue-300');
        });

        sequenceArea.addEventListener('dragleave', () => {
            sequenceArea.classList.remove('bg-blue-50', 'border-2', 'border-dashed', 'border-blue-300');
        });

        sequenceArea.addEventListener('drop', (e) => {
            e.preventDefault();
            sequenceArea.classList.remove('bg-blue-50', 'border-2', 'border-dashed', 'border-blue-300');

            const patternName = e.dataTransfer.getData('text/plain');
            const checkbox = document.querySelector(`#patternCheckboxes input[value="${patternName}"]`);
            if (checkbox && !checkbox.checked) {
                checkbox.checked = true;
                updateSelectionInfo();
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