//examples.js

const examples = [
    ["build_prototypes.txt", "day_care.txt", "developer_controls_process.txt"], // A
    ["completion_headroom.txt", "informal_labor_plan.txt", "team_per_task.txt"], // B
    ["interrupts_unjam_blocking.txt", "get_on_with_it.txt", "size_the_schedule.txt"], // C
    ["mercenary_analyst.txt", "recommitment_meeting.txt", "private_world.txt"], // D
    ["someone_always_makes_progress.txt", "work_split.txt", "take_no_small_slips.txt"] // E
];

document.querySelectorAll("#examplesMenu button[data-index]").forEach(btn => {
    btn.addEventListener("click", (e) => {
        e.stopPropagation();

        const idx = parseInt(btn.dataset.index, 10);
        if (examples[idx]) {
            // 1. NAJPRV PREPNEME DO COPLIEN KATALÓGU
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
                // Zistíme, do ktorého jazyka patrí súbor
                for (const [language, files] of Object.entries(patternLanguages)) {
                    if (files.includes(filename)) {
                        if (!globalCheckedPatterns[language]) {
                            globalCheckedPatterns[language] = {};
                        }
                        globalCheckedPatterns[language][filename] = true;
                        break;
                    }
                }
            });

            // 4. Aktualizujeme UI podľa aktuálneho katalógu (teraz už Coplien)
            const allCheckboxes = document.querySelectorAll('#patternCheckboxes input[type="checkbox"]');
            allCheckboxes.forEach(cb => {
                // Checkbox je zaškrtnutý len ak je v globalCheckedPatterns
                let isChecked = false;
                Object.keys(globalCheckedPatterns).forEach(catalogName => {
                    if (globalCheckedPatterns[catalogName]?.[cb.value]) {
                        isChecked = true;
                    }
                });
                cb.checked = isChecked;
            });

            // 5. Aktualizujeme všetky počítadlá a badge
            updateAllLanguageCounters();
            updateCatalogBadges();
            updateSelectAllButtonsColor();
            updateGenerateButtonState(); 
            forcedStartPattern = null;
            forcedGoalPattern = null; 
        }
        document.getElementById("examplesMenu").classList.add("hidden");
    });
});