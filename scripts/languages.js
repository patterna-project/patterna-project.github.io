//languages.js

const translations = {
    sk: {
        // Navigation
        examples: "Príklady",
        loadCatalog: "Nahrať katalóg ➕",
        clear: "Vymazať 🗑️",
        language: "SK",
        searchPlaceholder: "Hľadať...",

        // Examples dropdown
        selectExample: "Vyberte príklad:",
        exampleA: "A",
        exampleB: "B",
        exampleC: "C",
        exampleD: "D",
        exampleE: "E",

        // Main section
        selectPatterns: "Vyber vzory",
        generateSequence: "Generovať sekvenciu",
        loadingProgress: "Načítavam katalóg... {current}/{total}",

        // Suggestions section
        suggestedSequence: "Navrhnutá sekvencia",
        dragToReorder: "Pretiahni vzory pre úpravu poradia.",
        resetSequence: "Resetovať na pôvodné poradie",
        copySequence: "Kopírovať sekvenciu",
        export: "Exportovať",

        // MDP Parameters
        gamma: "γ:",
        goalReward: "R(cieľ):",
        otherReward: "R(ostatné):",
        epsilon: "ε:",

        // Similarity
        similarityMatrix: "📊 Matica podobností",
        similarityGraph: "🕸️ Graf podobností",

        // Footer
        quickLinks: "Rýchle odkazy",
        aboutProject: "O projekte",
        documentation: "Dokumentácia",
        faq: "Časté otázky",
        contact: "Kontakt",
        sourceCode: "Zdrojový kód",
        allRightsReserved: "Všetky práva vyhradené",
        termsOfUse: "Podmienky používania",

        // About Modal
        aboutPatterna: "O projekte Patterna",
        bachelorThesis: "Bakalársky projekt",
        student: "Študent",
        supervisor: "Vedúci",
        year: "Rok",
        studyProgram: "Študijný program",
        informatics: "Informatika",
        projectDescription: "Popis projektu",
        projectDescriptionText: "Cieľom projektu je vytvoriť metódu pre analýzu textových opisov organizačných vzorov a generovanie sekvencií na základe protichodných síl medzi nimi. Aplikácia využíva pokročilé techniky spracovania prirodzeného jazyka na identifikáciu vzťahov medzi vzormi.",
        keyAspects: "Kľúčové aspekty",
        keyAspect1: "Kvantifikácia implicitných vzťahov medzi organizačnými vzormi",
        keyAspect2: "Analýza protichodných síl v textových opisoch",
        keyAspect3: "Generovanie optimálnych sekvencií vzorov",
        keyAspect4: "Webové rozhranie pre interaktívnu analýzu",
        researchSources: "Výskumné zdroje",
        researchSource1: "Článok o používaní podobnosti medzi opismi vzorov",
        researchSource2: "Techniky analýzy podobnosti textových opisov",
        footerText: "FIIT STU Bratislava | Ústav informatiky a softvérového inžinierstva | Verzia 1.0.0",

        // FAQ Modal
        frequentlyAskedQuestions: "Často kladené otázky",
        faq1Question: "Ako funguje analýza organizačných vzorov?",
        faq1Answer: "Aplikácia využíva kombináciu NLP (spracovanie prirodzeného jazyka) a pravidiel na identifikáciu kľúčových organizačných vzorov v texte. Analyzuje vzťahy medzi vzormi a navrhuje optimálne sekvencie na základe protichodných síl.",
        faq2Question: "Aké typy súborov môžem nahrať na analýzu?",
        faq2Answer: "Momentálne podporujeme iba textové súbory (.txt). V budúcnosti plánujeme pridať podporu pre PDF a DOCX formáty.",
        faq3Question: "Aký je rozdiel medzi jednoduchou a pokročilou analýzou?",
        faq3Answer: "Jednoduchá analýza využíva základné porovnávanie vzorov, zatiaľ čo pokročilá analýza pracuje s explicitnou maticou podobností medzi vzormi a využíva Markovove reťazce na generovanie optimálnych sekvencií na základe pravdepodobnostných prechodov medzi vzormi.",
        faq4Question: "Môžem pridať vlastné organizačné vzory?",
        faq4Answer: "Áno, pomocou tlačidla 'Nahrať katalóg' môžete nahrať vlastný katalóg vzorov. Vyberte priečinok s txt súbormi, kde každý súbor predstavuje jeden vzor. Váš katalóg sa potom zobrazí ako nová karta vedľa štandardného C & H katalógu.",
        faq5Question: "Ako môžem exportovať výsledky analýzy?",
        faq5Answer: "Po dokončení analýzy kliknite na tlačidlo 'Exportovať (.txt)' v sekcii navrhovaných sekvencií.",
        faq6Question: "Môžem upraviť navrhnutú sekvenciu vzorov?",
        faq6Answer: "Áno, po vygenerovaní sekvencie môžete vzory jednoducho pretiahnuť myšou a zmeniť ich poradie. Systém zachová vaše úpravy a môžete exportovať finálnu sekvenciu vo vašom preferovanom poradí.",
        needHelp: "Potrebujete ďalšiu pomoc? Kontaktujte nás na",

        // Terms Modal
        termsOfUseTitle: "Podmienky používania",
        terms1Question: "1. Všeobecné podmienky",
        terms1Answer: "Táto webová aplikácia je poskytovaná ako služba bez akýchkoľvek záruk. Používateľ súhlasí s tým, že používa aplikáciu na vlastné riziko.",
        terms2Question: "2. Ochrana osobných údajov",
        terms2Answer: "Aplikácia nezhromažďuje ani neukladá žiadne osobné údaje používateľov. Všetky analýzy prebiehajú lokálne v prehliadači.",
        terms3Question: "3. Obmedzenia zodpovednosti",
        terms3Answer: "Vytvárané sekvencie organizačných vzorov sú iba návrhmi a odporúčaniami. Autor ani FIIT STU nepreberajú zodpovednosť za dôsledky ich implementácie.",
        terms4Question: "4. Duševné vlastníctvo",
        terms4Answer: "Všetky práva k aplikácii sú vyhradené. Obsah môže byť používaný len pre osobné a nekomerčné účely.",
        validFrom: "Platné od 1. januára 2026",

        // Catalog Modal
        loadPatternCatalog: "Nahrať katalóg vzorov",
        catalogName: "Názov katalógu",
        catalogNamePlaceholder: "Zadajte názov katalógu",
        folderWithTxtFiles: "Priečinok s txt súbormi",
        cancel: "Zrušiť",
        catalogNameRequired: "Názov katalógu je povinný",
        catalogNameInvalidChars: "Názov môže obsahovať len písmená, čísla, medzery, pomlčky a podčiarkovníky",
        catalogNameExists: "Katalóg s týmto názvom už existuje",

        // OnHover info
        mdpParamGammaTitle: "γ: 0-1 | Diskontný faktor.Vyššia hodnota = preferencia dlhších ciest.",
        mdpParamGoalRewardTitle: "R(cieľ): ≥0 | Odmena za dosiahnutie cieľa. Vyššia hodnota = väčšia motivácia ísť priamo do cieľa.",
        mdpParamOtherRewardTitle: "R(ostatné): ≥0 | Odmena za návštevu ostatných stavov. Vyššia hodnota = viac sa oplatí zdržiavať na ceste.",
        mdpParamEpsilonTitle: "ε: 0.0001-1 | Prah konvergencie. Menšia hodnota = presnejšie výpočty, ale viac iterácií.",

        // MDP steps
        mdpTitle: "Postup riešenia Markov Decision Process (MDP):",
        mdpStep1: "1. Určenie cieľa",
        mdpStep2: "2. Definícia úžitku",
        mdpStep3: "3. Prechodová matica",
        mdpStep4: "4. Počiatočné utility",
        mdpStep5: "5. Iterácia",
        mdpStep6: "6. Optimálna politika",
        mdpStep7: "7. Zostavenie sekvencie",
        mdpConvergence: "✓ Konvergencia",
        mdpGoalCalculation: "Výpočet celkových podobností pre každý vzor:",
        mdpGoalState: "Cieľový stav",
        mdpGoalReward: "má okamžitú odmenu (reward)",
        mdpOtherReward: "Ostatné stavy majú okamžitú odmenu (reward)",
        mdpGamma: "Diskontný faktor: γ =",
        mdpEpsilon: "Epsilon (konvergencia):",
        mdpTransitionMatrix: "Pravdepodobnosti prechodu medzi všetkými stavmi (normalizované podobnosti):",
        mdpTransitionExplanation: "Prechodová matica vznikla normalizáciou matice súvislostí. Každý riadok predstavuje rozdelenie pravdepodobností prechodu z daného stavu do ostatných stavov. Cieľový stav (diagonála) má vždy pravdepodobnosť 0.",
        mdpInitialUtilities: "Počiatočné utility",
        mdpIteration: "Iterácia",
        mdpMaxChange: "Maximálna zmena:",
        mdpUtility: "Utility",
        mdpConverged: "Value Iteration konvergovala po",
        mdpIterations: "iteráciách",
        mdpPolicyCalculation: "Výpočet najlepšej akcie pre každý stav:",
        mdpCurrentState: "Aktuálny stav",
        mdpOptimalAction: "Optimálna akcia",
        mdpSequenceBuild: "Postup podľa optimálnej politiky:",
        mdpFinalSequence: "Výsledná sekvencia:",

        // Alerts and messages
        selectAtLeastOnePattern: "Vyber aspoň jeden vzor!",
        examplesOnlyForCoplien: "Príklady sú dostupné len pre Coplien a Harrison katalóg",
        catalogNotFound: "Katalóg nebol nájdený",
        enterCatalogName: "Zadajte názov katalógu",
        selectFolder: "Vyberte priečinok s txt súbormi",
        noTxtFiles: "Priečinok neobsahuje žiadne txt súbory",
        failedToLoadFiles: "Nepodarilo sa načítať žiadne txt súbory",
        catalogLoadError: "Chyba pri načítaní katalógu: ",
        sequenceGenerationError: "Chyba pri generovaní sekvencie. Skúste to znova.",
        exportSuccess: "Exportovaný!",
        copyFailed: "Nepodarilo sa skopírovať sekvenciu",
        loadError: "Chyba pri načítavaní vzorov.",
        noSequenceToExport: "Žiadna sekvencia na export",
        confirmDelete: "Naozaj chcete odstrániť katalóg",
        confirmYes: "Áno, odstrániť",
        confirmNo: "Zrušiť",
        catalogDeleted: "Katalóg {catalogName} bol odstránený",
        catalogDeletionCancelled: "Odstránenie katalógu bolo zrušené"
    },
    en: {
        // Navigation
        examples: "Examples",
        loadCatalog: "Load Catalog ➕",
        clear: "Clear 🗑️",
        language: "EN",
        searchPlaceholder: "Search...",

        // Examples dropdown
        selectExample: "Select example:",
        exampleA: "A",
        exampleB: "B",
        exampleC: "C",
        exampleD: "D",
        exampleE: "E",

        // Main section
        selectPatterns: "Select Patterns",
        generateSequence: "Generate Sequence",
        loadingProgress: "Loading catalog... {current}/{total}",

        // Suggestions section
        suggestedSequence: "Suggested Sequence",
        dragToReorder: "Drag patterns to reorder.",
        resetSequence: "Reset to original order",
        copySequence: "Copy sequence",
        export: "Export",

        // MDP Parameters
        gamma: "γ:",
        goalReward: "R(goal):",
        otherReward: "R(other):",
        epsilon: "ε:",

        // Similarity
        similarityMatrix: "📊 Similarity Matrix",
        similarityGraph: "🕸️ Similarity Graph",

        // Footer
        quickLinks: "Quick Links",
        aboutProject: "About Project",
        documentation: "Documentation",
        faq: "Frequently Asked Questions",
        contact: "Contact",
        sourceCode: "Source Code",
        allRightsReserved: "All rights reserved",
        termsOfUse: "Terms of Use",

        // About Modal
        aboutPatterna: "About Patterna Project",
        bachelorThesis: "Bachelor Thesis",
        student: "Student",
        supervisor: "Supervisor",
        year: "Year",
        studyProgram: "Study Program",
        informatics: "Informatics",
        projectDescription: "Project Description",
        projectDescriptionText: "The goal of the project is to create a method for analyzing textual descriptions of organizational patterns and generating sequences based on conflicting forces between them. The application uses advanced natural language processing techniques to identify relationships between patterns.",
        keyAspects: "Key Aspects",
        keyAspect1: "Quantification of implicit relationships between organizational patterns",
        keyAspect2: "Analysis of conflicting forces in textual descriptions",
        keyAspect3: "Generation of optimal pattern sequences",
        keyAspect4: "Web interface for interactive analysis",
        researchSources: "Research Sources",
        researchSource1: "Article on using similarity between pattern descriptions",
        researchSource2: "Techniques for analyzing similarity of textual descriptions",
        footerText: "FIIT STU Bratislava | Institute of Informatics and Software Engineering | Version 1.0.0",

        // FAQ Modal
        frequentlyAskedQuestions: "Frequently Asked Questions",
        faq1Question: "How does organizational pattern analysis work?",
        faq1Answer: "The application uses a combination of NLP (natural language processing) and rules to identify key organizational patterns in text. It analyzes relationships between patterns and suggests optimal sequences based on conflicting forces.",
        faq2Question: "What types of files can I upload for analysis?",
        faq2Answer: "Currently we only support text files (.txt). In the future we plan to add support for PDF and DOCX formats.",
        faq3Question: "What's the difference between simple and advanced analysis?",
        faq3Answer: "Simple analysis uses basic pattern comparison, while advanced analysis works with an explicit similarity matrix between patterns and uses Markov chains to generate optimal sequences based on probabilistic transitions between patterns.",
        faq4Question: "Can I add my own organizational patterns?",
        faq4Answer: "Yes, using the 'Load Catalog' button you can upload your own pattern catalog. Select a folder with txt files where each file represents one pattern. Your catalog will then appear as a new tab next to the standard C & H catalog.",
        faq5Question: "How can I export analysis results?",
        faq5Answer: "After completing the analysis, click the 'Export (.txt)' button in the suggested sequences section.",
        faq6Question: "Can I edit the suggested pattern sequence?",
        faq6Answer: "Yes, after generating the sequence you can simply drag patterns with your mouse to change their order. The system will preserve your edits and you can export the final sequence in your preferred order.",
        needHelp: "Need more help? Contact us at",

        // Terms Modal
        termsOfUseTitle: "Terms of Use",
        terms1Question: "1. General Terms",
        terms1Answer: "This web application is provided as a service without any warranties. The user agrees to use the application at their own risk.",
        terms2Question: "2. Privacy Protection",
        terms2Answer: "The application does not collect or store any personal user data. All analyses run locally in the browser.",
        terms3Question: "3. Liability Limitations",
        terms3Answer: "Generated organizational pattern sequences are only suggestions and recommendations. The author nor FIIT STU assume responsibility for the consequences of their implementation.",
        terms4Question: "4. Intellectual Property",
        terms4Answer: "All rights to the application are reserved. Content may only be used for personal and non-commercial purposes.",
        validFrom: "Valid from January 1, 2026",

        // Catalog Modal
        loadPatternCatalog: "Load Pattern Catalog",
        catalogName: "Catalog Name",
        catalogNamePlaceholder: "Enter catalog name",
        folderWithTxtFiles: "Folder with txt files",
        cancel: "Cancel",
        catalogNameRequired: "Catalog name is required",
        catalogNameInvalidChars: "Name can only contain letters, numbers, spaces, hyphens and underscores",
        catalogNameExists: "A catalog with this name already exists",

        // OnHover info
        mdpParamGammaTitle: "γ: 0-1 | Discount factor. Higher value = preference for longer paths.",
        mdpParamGoalRewardTitle: "R(goal): ≥0 | Reward for reaching the goal. Higher value = greater motivation to go directly to the goal.",
        mdpParamOtherRewardTitle: "R(other): ≥0 | Reward for visiting other states. Higher value = more benefit from detours.",
        mdpParamEpsilonTitle: "ε: 0.0001-1 | Convergence threshold. Smaller value = more precise calculations, but more iterations.",

        // MDP steps
        mdpTitle: "Markov Decision Process (MDP) Solution Steps:",
        mdpStep1: "1. Goal Determination",
        mdpStep2: "2. Utility Definition",
        mdpStep3: "3. Transition Matrix",
        mdpStep4: "4. Initial Utilities",
        mdpStep5: "5. Iteration",
        mdpStep6: "6. Optimal Policy",
        mdpStep7: "7. Sequence Building",
        mdpConvergence: "✓ Convergence",
        mdpGoalCalculation: "Calculating total similarities for each pattern:",
        mdpGoalState: "Goal state",
        mdpGoalReward: "has immediate reward",
        mdpOtherReward: "Other states have immediate reward",
        mdpGamma: "Discount factor: γ =",
        mdpEpsilon: "Epsilon (convergence):",
        mdpTransitionMatrix: "Transition probabilities between all states (normalized similarities):",
        mdpTransitionExplanation: "The transition matrix is created by normalizing the similarity matrix. Each row represents the probability distribution of transitioning from a given state to other states. The goal state (diagonal) always has probability 0.",
        mdpInitialUtilities: "Initial Utilities",
        mdpIteration: "Iteration",
        mdpMaxChange: "Maximum change:",
        mdpUtility: "Utility",
        mdpConverged: "Value Iteration converged after",
        mdpIterations: "iterations",
        mdpPolicyCalculation: "Calculating best action for each state:",
        mdpCurrentState: "Current state",
        mdpOptimalAction: "Optimal action",
        mdpSequenceBuild: "Following the optimal policy:",
        mdpFinalSequence: "Final sequence:",

        // Alerts and messages
        selectAtLeastOnePattern: "Select at least one pattern!",
        examplesOnlyForCoplien: "Examples are only available for Coplien and Harrison catalog",
        catalogNotFound: "Catalog not found",
        enterCatalogName: "Enter catalog name",
        selectFolder: "Select folder with txt files",
        noTxtFiles: "Folder contains no txt files",
        failedToLoadFiles: "Failed to load any txt files",
        catalogLoadError: "Error loading catalog: ",
        sequenceGenerationError: "Error generating sequence. Please try again.",
        exportSuccess: "Exported!",
        copyFailed: "Failed to copy sequence",
        loadError: "Error loading patterns.",
        noSequenceToExport: "No sequence to export",
        confirmDelete: "Do you really want to delete catalog",
        confirmYes: "Yes, delete",
        confirmNo: "Cancel",
        catalogDeleted: "Catalog {catalogName} was deleted",
        catalogDeletionCancelled: "Catalog deletion cancelled"

        





    }
};


// Current language
let currentLanguage = 'sk';

document.getElementById("languageToggle").addEventListener("click", () => {
    // toggle
    const newLang = currentLanguage === 'sk' ? 'en' : 'sk';
    switchLanguage(newLang);
});

function switchLanguage(lang) {
    currentLanguage = lang;
    window.currentLanguage = lang;   
    updateTextContent();

    // Ak existuje funkcia na prekreslenie MDP krokov, zavolaj ju
    if (typeof refreshMDPSteps === 'function') {
        refreshMDPSteps();
    }

    // Aktualizujeme validáciu názvu katalógu (ak je pole viditeľné)
    if (typeof updateCatalogNameValidation === 'function') {
        updateCatalogNameValidation();
    }

    const languageToggle = document.getElementById("languageToggle");
    const iconSrc = lang === 'sk' ? 'assets/images/english.png' : 'assets/images/slovak.png';
    const iconAlt = lang === 'sk' ? 'English' : 'Slovak';

    languageToggle.innerHTML = `<img src="${iconSrc}" alt="${iconAlt}" class="w-5 h-5">`;
}

function updateTextContent() {
    const t = translations[currentLanguage];

    const languageToggle = document.getElementById("languageToggle");
    const iconSrc = currentLanguage === 'sk' ? 'assets/images/english.png' : 'assets/images/slovak.png';
    const iconAlt = currentLanguage === 'sk' ? 'English' : 'Slovak';

    languageToggle.innerHTML = `<img src="${iconSrc}" alt="${iconAlt}" class="w-5 h-5">`;

    document.getElementById("loadCatalogBtn").textContent = t.loadCatalog;
    document.getElementById("clearBtn").textContent = t.clear;

    const examplesToggle = document.getElementById("examplesToggle");
    if (examplesToggle) {
        examplesToggle.innerHTML = t.examples +
            '<svg class="inline-block ml-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">' +
            '<path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z" clip-rule="evenodd" />' +
            '</svg>';
    }

    const examplesHeader = document.querySelector("#examplesMenu li:first-child");
    if (examplesHeader) {
        examplesHeader.textContent = t.selectExample;
    }

    const exampleButtons = document.querySelectorAll("#examplesMenu button[data-index]");
    if (exampleButtons.length >= 5) {
        exampleButtons[0].textContent = t.exampleA;
        exampleButtons[1].textContent = t.exampleB;
        exampleButtons[2].textContent = t.exampleC;
        exampleButtons[3].textContent = t.exampleD;
        exampleButtons[4].textContent = t.exampleE;
    }

    document.querySelector('h2.text-lg.font-semibold.mr-4').textContent = t.selectPatterns;
    document.getElementById("generateBtn").textContent = t.generateSequence;
    document.querySelector('#loadingIndicator p').textContent = t.analysisInProgress;

    document.querySelector('#suggestionsSection h2').textContent = t.suggestedSequence;
    document.querySelector('#suggestionsSection p').textContent = t.dragToReorder;

    // Export button - vždy aktualizujeme text podľa jazyka
    updateExportButtonText();

    
    if (typeof window.updateCatalogSearchPlaceholders === 'function') {
        window.updateCatalogSearchPlaceholders();
    }

    // MDP Parameters translations
    const gammaLabel = document.querySelector('label[for="gammaInput"]');
    if (gammaLabel) gammaLabel.textContent = t.gamma;

    const goalRewardLabel = document.querySelector('label[for="goalRewardInput"]');
    if (goalRewardLabel) goalRewardLabel.textContent = t.goalReward;

    const otherRewardLabel = document.querySelector('label[for="otherRewardInput"]');
    if (otherRewardLabel) otherRewardLabel.textContent = t.otherReward;

    const epsilonLabel = document.querySelector('label[for="epsilonInput"]');
    if (epsilonLabel) epsilonLabel.textContent = t.epsilon;
    
    const gammaInput = document.getElementById('gammaInput');
    if (gammaInput) gammaInput.title = t.mdpParamGammaTitle;

    const goalRewardInput = document.getElementById('goalRewardInput');
    if (goalRewardInput) goalRewardInput.title = t.mdpParamGoalRewardTitle;

    const otherRewardInput = document.getElementById('otherRewardInput');
    if (otherRewardInput) otherRewardInput.title = t.mdpParamOtherRewardTitle;

    const epsilonInput = document.getElementById('epsilonInput');
    if (epsilonInput) epsilonInput.title = t.mdpParamEpsilonTitle;
    
    const matrixViewBtn = document.getElementById('matrixViewBtn');
    const graphViewBtn = document.getElementById('graphViewBtn');
    
    if (matrixViewBtn) {
        matrixViewBtn.innerHTML = t.similarityMatrix;
    }
    
    if (graphViewBtn) {
        graphViewBtn.innerHTML = t.similarityGraph;
    }

    if (typeof window.updateGraphSearchPlaceholder === 'function') {
        window.updateGraphSearchPlaceholder();
    }

    document.getElementById("resetSequenceBtn").title = t.resetSequence;
    document.getElementById("copySequenceBtn").title = t.copySequence;

    document.querySelector('footer .space-y-4:first-child h3').textContent = t.quickLinks;
    document.getElementById("aboutLink").textContent = t.aboutProject;
    document.getElementById("docsLink").textContent = t.documentation;
    document.getElementById("faqLink").textContent = t.faq;
    document.querySelector('footer .space-y-4:nth-child(2) h3').textContent = t.contact;
    document.querySelector('footer .space-y-4:last-child h3').textContent = t.sourceCode;
    document.querySelector('footer .border-t p').innerHTML = `© 2026 FIIT STU • ${t.allRightsReserved} • <a href="#" id="Termslink" class="text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">${t.termsOfUse}</a>`;

    updateModalContent();
}

function updateModalContent() {
    const t = translations[currentLanguage];

    // About Modal
    const aboutModal = document.getElementById('aboutModal');
    if (aboutModal) {
        const title = aboutModal.querySelector('h3');
        if (title) title.textContent = t.aboutPatterna;

        const bachelorHeader = aboutModal.querySelector('.bg-blue-50 h4');
        if (bachelorHeader) bachelorHeader.textContent = t.bachelorThesis;

        // Pre každý prvok v grid-e skontrolujeme existenciu
        const gridDivs = aboutModal.querySelectorAll('.grid div');
        if (gridDivs.length >= 4) {
            const studentLabel = gridDivs[0]?.querySelector('p:first-child');
            const studentValue = gridDivs[0]?.querySelector('p:last-child');
            if (studentLabel) studentLabel.textContent = t.student;
            // studentValue (Ondrej Drengubiak) necháme ako je

            const supervisorLabel = gridDivs[1]?.querySelector('p:first-child');
            const supervisorValue = gridDivs[1]?.querySelector('p:last-child');
            if (supervisorLabel) supervisorLabel.textContent = t.supervisor;
            // supervisorValue (Ing. Viktor Matovič, PhD.) necháme ako je

            const yearLabel = gridDivs[2]?.querySelector('p:first-child');
            const yearValue = gridDivs[2]?.querySelector('p:last-child');
            if (yearLabel) yearLabel.textContent = t.year;
            // yearValue (2025/2026) necháme ako je

            const programLabel = gridDivs[3]?.querySelector('p:first-child');
            const programValue = gridDivs[3]?.querySelector('p:last-child');
            if (programLabel) programLabel.textContent = t.studyProgram;
            if (programValue) programValue.textContent = t.informatics;  // ← TOTO JE DÔLEŽITÉ
        }


        // Popis projektu
        const projectDescHeader = aboutModal.querySelectorAll('.mt-6 > div:nth-child(2) h4');
        if (projectDescHeader.length > 0) projectDescHeader[0].textContent = t.projectDescription;

        const projectDescText = aboutModal.querySelectorAll('.mt-6 > div:nth-child(2) p');
        if (projectDescText.length > 0) projectDescText[0].textContent = t.projectDescriptionText;

        // Kľúčové aspekty
        const keyAspectsHeader = aboutModal.querySelectorAll('.mt-6 > div:nth-child(3) h4');
        if (keyAspectsHeader.length > 0) keyAspectsHeader[0].textContent = t.keyAspects;

        const keyAspects = aboutModal.querySelectorAll('.list-disc li');
        if (keyAspects.length >= 4) {
            if (keyAspects[0]) keyAspects[0].textContent = t.keyAspect1;
            if (keyAspects[1]) keyAspects[1].textContent = t.keyAspect2;
            if (keyAspects[2]) keyAspects[2].textContent = t.keyAspect3;
            if (keyAspects[3]) keyAspects[3].textContent = t.keyAspect4;
        }

        // Výskumné zdroje
        const researchHeader = aboutModal.querySelectorAll('.mt-6 > div:nth-child(4) h4');
        if (researchHeader.length > 0) researchHeader[0].textContent = t.researchSources;

        const researchLinks = aboutModal.querySelectorAll('.mt-2 a span');
        if (researchLinks.length >= 2) {
            if (researchLinks[0]) researchLinks[0].textContent = t.researchSource1;
            if (researchLinks[1]) researchLinks[1].textContent = t.researchSource2;
        }

        // Footer text
        const footerText = aboutModal.querySelector('.pt-4 p');
        if (footerText) footerText.textContent = t.footerText;
    }

    // FAQ Modal
    const faqModal = document.getElementById('faqModal');
    if (faqModal) {
        const title = faqModal.querySelector('h3');
        if (title) title.textContent = t.frequentlyAskedQuestions;

        const faqQuestions = faqModal.querySelectorAll('.faq-question span');
        const faqAnswers = faqModal.querySelectorAll('.faq-answer p');

        if (faqQuestions.length >= 6) {
            if (faqQuestions[0]) faqQuestions[0].textContent = t.faq1Question;
            if (faqQuestions[1]) faqQuestions[1].textContent = t.faq2Question;
            if (faqQuestions[2]) faqQuestions[2].textContent = t.faq3Question;
            if (faqQuestions[3]) faqQuestions[3].textContent = t.faq4Question;
            if (faqQuestions[4]) faqQuestions[4].textContent = t.faq5Question;
            if (faqQuestions[5]) faqQuestions[5].textContent = t.faq6Question;
        }

        if (faqAnswers.length >= 6) {
            if (faqAnswers[0]) faqAnswers[0].textContent = t.faq1Answer;
            if (faqAnswers[1]) faqAnswers[1].textContent = t.faq2Answer;
            if (faqAnswers[2]) faqAnswers[2].textContent = t.faq3Answer;
            if (faqAnswers[3]) faqAnswers[3].textContent = t.faq4Answer;
            if (faqAnswers[4]) faqAnswers[4].textContent = t.faq5Answer;
            if (faqAnswers[5]) faqAnswers[5].textContent = t.faq6Answer;
        }

        const helpText = document.getElementById('faqHelpText');
        if (helpText) {
            helpText.innerHTML = `${t.needHelp} <a href="mailto:xdrengubiak@stuba.sk" class="text-indigo-600 dark:text-indigo-400">xdrengubiak@stuba.sk</a>`;
        }
    }

    // Terms Modal
    const termsModal = document.getElementById('termsModal');
    if (termsModal) {
        const title = termsModal.querySelector('h3');
        if (title) title.textContent = t.termsOfUseTitle;

        const termsQuestions = termsModal.querySelectorAll('.terms-question span');
        const termsAnswers = termsModal.querySelectorAll('.terms-answer p');

        if (termsQuestions.length >= 4) {
            if (termsQuestions[0]) termsQuestions[0].textContent = t.terms1Question;
            if (termsQuestions[1]) termsQuestions[1].textContent = t.terms2Question;
            if (termsQuestions[2]) termsQuestions[2].textContent = t.terms3Question;
            if (termsQuestions[3]) termsQuestions[3].textContent = t.terms4Question;
        }

        if (termsAnswers.length >= 4) {
            if (termsAnswers[0]) termsAnswers[0].textContent = t.terms1Answer;
            if (termsAnswers[1]) termsAnswers[1].textContent = t.terms2Answer;
            if (termsAnswers[2]) termsAnswers[2].textContent = t.terms3Answer;
            if (termsAnswers[3]) termsAnswers[3].textContent = t.terms4Answer;
        }
        const validFrom = document.getElementById('termsValidFrom');
        if (validFrom) validFrom.textContent = t.validFrom;
        
    }

    // Catalog Modal
    const catalogModal = document.getElementById('catalogModal');
    if (catalogModal) {
        const title = catalogModal.querySelector('h3');
        if (title) title.textContent = t.loadPatternCatalog;

        const labels = catalogModal.querySelectorAll('label');
        if (labels.length >= 2) {
            if (labels[0]) labels[0].textContent = t.catalogName;
            if (labels[1]) labels[1].textContent = t.folderWithTxtFiles;
        }

        const nameInput = catalogModal.querySelector('input[type="text"]');
        if (nameInput) nameInput.placeholder = t.catalogNamePlaceholder;

        const cancelBtn = document.getElementById('cancelCatalog');
        if (cancelBtn) cancelBtn.textContent = t.cancel;

        const confirmBtn = document.getElementById('confirmCatalog');
        if (confirmBtn) confirmBtn.textContent = t.loadCatalog;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    updateTextContent();
});

window.currentLanguage = currentLanguage;
window.translations = translations;
window.switchLanguage = switchLanguage;

document.addEventListener('click', (e) => {
    const languageMenu = document.getElementById('languageMenu');
    const languageToggle = document.getElementById('languageToggle');

    if (languageMenu && !languageMenu.classList.contains('hidden') &&
        !languageToggle.contains(e.target) &&
        !languageMenu.contains(e.target)) {
        languageMenu.classList.add('hidden');
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const languageMenu = document.getElementById('languageMenu');
        if (languageMenu && !languageMenu.classList.contains('hidden')) {
            languageMenu.classList.add('hidden');
        }
    }
});