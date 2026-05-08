// function/examples.js

// Nové príklady pre aktuálny Default katalóg:
// Štruktúra: každé pole = jeden príklad (max 3 vzory na príklad)
// Názvy súborov MUSIA presne zodpovedať tým v DefaultPatterns priečinkoch

const examples = [
    // Príklad A: Factory Method + Singleton + Observer (creational + behavioral)
    ["factory_method_demo.txt", "singleton_demo.txt", "observer_demo.txt"],
    
    // Príklad B: Unit Test + Integration Test + TDD (testing)
    ["unit_testing.txt", "integration_testing.txt", "test_driven_development.txt"],
    
    // Príklad C: Layered Architecture + Microservices + Event Driven (architectural)
    ["layered_architecture.txt", "microservices_basics.txt", "event_driven.txt"],
    
    // Príklad D: Daily Standup + Sprint Planning + Retrospective (agile practices)
    ["daily_standup.txt", "sprint_planning.txt", "retrospective.txt"],
    
    // Príklad E: Factory Method + Layered Architecture + TDD (mix)
    ["factory_method_demo.txt", "layered_architecture.txt", "test_driven_development.txt"]
];

document.querySelectorAll("#examplesMenu button[data-index]").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const idx = parseInt(btn.dataset.index, 10);
        if (examples[idx]) {
            // 1. NAJPRV PREPNEME DO DEFAULT (COPLIEN) KATALÓGU
            if (currentCatalog !== 'coplien') {
                switchToCoplienCatalog();
            }

            // 2. VYČISTÍME VŠETKY zaškrtnuté vzory (všetky katalógy)
            // Vyčistíme Coplien jazyky
            Object.keys(patternLanguages).forEach(language => {
                if (globalCheckedPatterns[language]) {
                    globalCheckedPatterns[language] = {};
                }
            });

            // Vyčistíme user katalógy
            Object.keys(userCatalogs).forEach(catalogName => {
                if (globalCheckedPatterns[catalogName]) {
                    globalCheckedPatterns[catalogName] = {};
                }
            });

            // 3. NASTAVÍME len vybrané vzory z príkladu
            examples[idx].forEach(filename => {
                // Zistíme, do ktorého jazyka (sekcie) patrí súbor
                let foundLanguage = null;
                for (const [language, files] of Object.entries(patternLanguages)) {
                    if (files.includes(filename)) {
                        foundLanguage = language;
                        break;
                    }
                }
                
                if (foundLanguage) {
                    if (!globalCheckedPatterns[foundLanguage]) {
                        globalCheckedPatterns[foundLanguage] = {};
                    }
                    globalCheckedPatterns[foundLanguage][filename] = true;
                } else {
                    console.warn(`Súbor ${filename} nebol nájdený v žiadnej sekcii Default katalógu`);
                }
            });

            // 4. Aktualizujeme UI – všetky checkboxy
            const allCheckboxes = document.querySelectorAll('#patternCheckboxes input[type="checkbox"]');
            allCheckboxes.forEach(cb => {
                let isChecked = false;
                Object.keys(globalCheckedPatterns).forEach(catalogName => {
                    if (globalCheckedPatterns[catalogName]?.[cb.value]) {
                        isChecked = true;
                    }
                });
                cb.checked = isChecked;
            });

            // 5. Aktualizujeme všetky počítadlá, badge, tlačidlá
            updateAllLanguageCounters();
            updateCatalogBadges();
            updateSelectAllButtonsColor();
            updateGenerateButtonState();
            
            // 6. Resetneme forced start/goal (aby neostali z predchádzajúceho)
            forcedStartPattern = null;
            forcedGoalPattern = null;
            updateStartFlags();
            updateGoalFlags();

            // 7. *** DÔLEŽITÉ: AKTUALIZUJEME PLAVUJÚCI PANEL S VYBRANÝMI VZORMI ***
            if (typeof updateSelectedPanelVisibility === 'function') {
                updateSelectedPanelVisibility();
            }
        }
        document.getElementById("examplesMenu").classList.add("hidden");
    });
});