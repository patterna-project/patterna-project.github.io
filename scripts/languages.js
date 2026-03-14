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
        overallConfidence: "Celková spoľahlivosť:",
        overallConfidenceTooltip: 'Funguje ako priemer všetkých podobností v sekvencii na predchádzajúci vzor v sekvencii. Toto skóre je veľmi všeobecné a slúži len ako orientačný ukazovateľ. Negarantujeme jeho presnosť ani relevantnosť pre konkrétnu situáciu.',
        aiConfidence: "AI hodnotenie:",
        aiConfidenceTooltip: "Hodnotenie generované umelou inteligenciou na základe analýzy textových opisov. Toto hodnotenie je subjektívne a nemusí byť vždy presné. Berte ho ako orientačný názor, nie ako fakt.",
        aiModalTitle: "AI hodnotenie sekvencie",

        // MDP Parameters
        gamma: "γ:",
        goalReward: "R(g):",
        otherReward: "R(o):",
        epsilon: "ε:",

        // Similarity
        similarityMatrix: "🔢 Matica podobností",
        similarityGraph: "🕸️ Graf podobností",
        graphThreshold: "Prah:",
        statistics: "📊 Štatistiky",
        statisticsBasic: "Základné štatistiky",
        statisticsTotalPatterns: "Počet vzorov",
        statisticsAvgSimilarity: "Priemerná podobnosť",
        statisticsMedianSimilarity: "Medián podobnosti",
        statisticsStdDeviation: "Smerodajná odchýlka",
        statisticsTopConnections: "Top 5 najsilnejších spojení",
        statisticsCentrality: "Centralita vzorov",
        statisticsMostConnected: "Najprepojenejšie",
        statisticsLeastConnected: "Najizolovanejšie",
        statisticsDistribution: "Distribúcia podobností",

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
        projectDescriptionText: "Cieľom projektu je vytvoriť metódu pre analýzu textových opisov vzorov a generovanie sekvencií na základe protichodných síl medzi nimi. Aplikácia využíva pokročilé techniky spracovania prirodzeného jazyka na identifikáciu vzťahov medzi vzormi.",
        keyAspects: "Kľúčové aspekty",
        keyAspect1: "Kvantifikácia implicitných vzťahov medzi vzormi",
        keyAspect2: "Analýza protichodných síl v textových opisoch",
        keyAspect3: "Generovanie optimálnych sekvencií vzorov",
        keyAspect4: "Webové rozhranie pre interaktívnu analýzu",
        researchSources: "Výskumné zdroje",
        researchSource1: "Článok o používaní podobnosti medzi opismi vzorov",
        researchSource2: "Techniky analýzy podobnosti textových opisov",
        footerText: "FIIT STU Bratislava | Ústav informatiky a softvérového inžinierstva | Verzia 1.0.0",

        // FAQ Modal
        frequentlyAskedQuestions: "Často kladené otázky",
        faq1Question: "Ako funguje výpočet podobnosti medzi vzormi?",
        faq1Answer: "Aplikácia analyzuje textové popisy vzorov pomocou metód TF (term frequency) a IDF (inverse document frequency). Môžete si vybrať medzi týmito metódami pomocou checkboxu IDF. Podobnosť sa počíta ako kosínusová podobnosť medzi vektormi slov jednotlivých vzorov.",
        faq2Question: "Aký je rozdiel medzi TF a IDF?",
        faq2Answer: "TF (term frequency) dáva váhu všetkým slovám v texte, takže vzory sú prepojené na základe bežných slov. IDF (inverse document frequency) zvýrazňuje vzácne, špecifické slová a potláča bežné – výsledkom sú čistejšie, významovejšie vzťahy medzi vzormi.",
        faq3Question: "Čo sú stop slová a ako ich môžem upraviť?",
        faq3Answer: "Stop slová sú bežné slová (napr. 'a', 'the', 'and'), ktoré sa ignorujú pri analýze. Kliknutím na tlačidlo 🚫 vedľa parametrov môžete pridať vlastné stop slová, odstrániť existujúce alebo resetovať na predvolené. Každé slovo musí byť zadané samostatne.",
        faq4Question: "Ako funguje generovanie sekvencie?",
        faq4Answer: "Sekvencia sa generuje pomocou Markov Decision Process (MDP). Najprv sa vyberie vzor s najvyššou celkovou podobnosťou (cieľ). Potom algoritmus iteratívne vyberá ďalšie vzory na základe pravdepodobností prechodu, ktoré sú odvodené z matice podobností. Parametre γ, R(g), R(o) a ε ovplyvňujú správanie algoritmu.",
        faq5Question: "Môžem upraviť vygenerovanú sekvenciu?",
        faq5Answer: "Áno, po vygenerovaní sekvencie môžete vzory jednoducho pretiahnuť myšou a zmeniť ich poradie. Tlačidlo 🔄 vás vráti k pôvodnému poradiu, ak si to rozmyslíte.",
        faq6Question: "Ako môžem exportovať výsledky?",
        faq6Answer: "V sekcii 'Navrhnutá sekvencia' kliknite na tlačidlo 'Exportovať (.txt)'. Vedľajšia šípka ponúka aj export do formátov PDF, CSV a PNG (obrázok sekvencie).",
        faq7Question: "Čo znamenajú parametre γ, R(g), R(o) a ε?",
        faq7Answer: "γ (gamma) je diskontný faktor – vyššia hodnota preferuje dlhšie cesty. R(g) je odmena za dosiahnutie cieľa, R(o) odmena za návštevu ostatných stavov. ε (epsilon) je prah konvergencie – menšia hodnota znamená presnejšie výpočty, ale viac iterácií.",
        faq8Question: "Môžem si prezerať vzťahy medzi vzormi ako graf?",
        faq8Answer: "Áno, po vygenerovaní matice podobností môžete prepnúť medzi tabuľkovým zobrazením (matica) a grafovým zobrazením (sieť) pomocou tlačidiel '📊 Matica podobností' a '🕸️ Graf podobností'. V grafe môžete kliknutím na uzol zobraziť jeho najsilnejšie spojenia.",
        needHelp: "Potrebujete ďalšiu pomoc? Kontaktujte nás na",

        // Terms Modal
        termsOfUseTitle: "Podmienky používania",
        terms1Question: "1. Všeobecné podmienky",
        terms1Answer: "Táto webová aplikácia je poskytovaná ako služba bez akýchkoľvek záruk. Používateľ súhlasí s tým, že používa aplikáciu na vlastné riziko.",
        terms2Question: "2. Ochrana osobných údajov",
        terms2Answer: "Aplikácia nezhromažďuje ani neukladá žiadne osobné údaje používateľov. Všetky analýzy prebiehajú lokálne v prehliadači.",
        terms3Question: "3. Obmedzenia zodpovednosti",
        terms3Answer: "Vytvárané sekvencie vzorov sú iba návrhmi a odporúčaniami. Autor ani FIIT STU nepreberajú zodpovednosť za dôsledky ich implementácie.",
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
        folderWithTxtFilesTooltip: 'Vyberte hlavný priečinok, ktorý obsahuje podpriečinky (napr. "GoF"). Každý podpriečinok sa stane samostatnou sekciou (jazykom) v zozname vzorov. Súbory .txt v koreni priečinka budú umiestnené do sekcie "Ostatné".',

        // Stop Words Modal
        stopWordsTitle2: "Úprava Stop Slov",
        stopWordsInfo: "Stop slová sú bežné slová, ktoré sa ignorujú pri analýze. Pridávajte ich ako jednotlivé slová (bez medzier).",
        stopWordsCurrent: "Aktuálne stop slová",
        stopWordsAdd: "Pridať nové stop slovo:",
        stopWordsPlaceholder: "napr. 'example' (iba jedno slovo)",
        stopWordsHint: "Enterom potvrdíš, slovo musí byť bez medzier a dlhé aspoň 2 znaky.",
        stopWordsCount: "/30",
        stopWordsReset: "Resetovať na predvolené",
        stopWordsEmpty: "Žiadne stop slová. Pridajte nejaké!",
        stopWordsAddButton: "Pridať",
        stopWordsRemoveTitle: "Odstrániť",
        stopWordsNoSpaces: 'Stop slovo môže obsahovať iba jedno slovo!',
        stopWordsMinLength: 'Stop slovo musí mať aspoň 2 znaky',
        stopWordsExists: 'Stop slovo "{word}" už existuje',
        stopWordsMaxLimit: 'Maximálny počet stop slov je 30',
        stopWordsReset: 'Stop slová boli resetované na predvolené',

        // Pattern Detail Modal
        patternDetailTitle: "Detail vzoru",
        patternDetailBasicInfo: "Základné informácie",
        patternDetailName: "Názov:",
        patternDetailFile: "Súbor:",
        patternDetailPosition: "Pozícia v sekvencii:",
        patternDetailPrevSimilarity: "Podobnosť s predchádzajúcim:",
        patternDetailFirstPattern: "Prvý vzor v sekvencii",
        patternDetailFullText: "Celý text vzoru",
        patternDetailSimilarities: "Podobnosti s ostatnými vzormi",
        patternDetailNextLabel: "(nasledujúci)",
        patternDetailPrevLabel: "(predchádzajúci)",
        patternDetailNoSimilarities: "Žiadne podobnosti s ostatnými vzormi",
        patternDetailClose: "Zatvoriť",
        patternDetailViewButton: "Zobraziť podrobnosti", 
        patternDetailFilterAll: "Všetky",
        patternDetailFilterSequence: "Len sekvencia",
        patternDetailNotInSequence: "(mimo sekvencie)",


        // OnHover info
        mdpParamGammaTitle: "γ: 0-1 | Diskontný faktor.Vyššia hodnota = preferencia dlhších ciest.",
        mdpParamGoalRewardTitle: "R(cieľ): ≥0 | Odmena za dosiahnutie cieľa. Vyššia hodnota = väčšia motivácia ísť priamo do cieľa.",
        mdpParamOtherRewardTitle: "R(ostatné): ≥0 | Odmena za návštevu ostatných stavov. Vyššia hodnota = viac sa oplatí zdržiavať na ceste.",
        mdpParamEpsilonTitle: "ε: 0.0001-1 | Prah konvergencie. Menšia hodnota = presnejšie výpočty, ale viac iterácií.",
        idfTitle: "IDF (Inverzná Frekvencia Dokumentu) - zvýrazňuje vzácne slová.",
        stopWordsTitle: "Stop slová - slová, ktoré sa ignorujú pri analýze",

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
        selectAtLeastTwoPatterns: "Vyber aspoň 2 vzory!",
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
        catalogDeletionCancelled: "Odstránenie katalógu bolo zrušené",
        catalogUploadSuccess: 'Katalóg "{catalogName}" bol úspešne nahraný',
        allPatternsCleared: 'Všetky vzory boli vymazané'
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
        overallConfidence: "Overall confidence:",
        overallConfidenceTooltip: 'Calculated as the average of all similarities between each pattern and its predecessor in the sequence. This score is very general and serves only as an approximate indicator. We do not guarantee its accuracy or relevance for any specific situation.',
        aiConfidence: "AI evaluation:",
        aiConfidenceTooltip: "Evaluation generated by artificial intelligence based on analysis of textual descriptions. This evaluation is subjective and may not always be accurate. Consider it as an approximate opinion, not a fact.",
        aiModalTitle: "AI evaluation of sequence",


        // MDP Parameters
        gamma: "γ:",
        goalReward: "R(g):",
        otherReward: "R(o):",
        epsilon: "ε:",

        // Similarity
        similarityMatrix: "🔢 Similarity Matrix",
        similarityGraph: "🕸️ Similarity Graph",
        graphThreshold: "Threshold:",
        statistics: "📊 Statistics",
        statisticsBasic: "Basic Statistics",
        statisticsTotalPatterns: "Number of patterns",
        statisticsAvgSimilarity: "Average similarity",
        statisticsMedianSimilarity: "Median similarity",
        statisticsStdDeviation: "Standard deviation",
        statisticsTopConnections: "Top 5 strongest connections",
        statisticsCentrality: "Pattern centrality",
        statisticsMostConnected: "Most connected",
        statisticsLeastConnected: "Least connected",
        statisticsDistribution: "Similarity distribution",


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
        projectDescriptionText: "The goal of the project is to create a method for analyzing textual descriptions of patterns and generating sequences based on conflicting forces between them. The application uses advanced natural language processing techniques to identify relationships between patterns.",
        keyAspects: "Key Aspects",
        keyAspect1: "Quantification of implicit relationships between patterns",
        keyAspect2: "Analysis of conflicting forces in textual descriptions",
        keyAspect3: "Generation of optimal pattern sequences",
        keyAspect4: "Web interface for interactive analysis",
        researchSources: "Research Sources",
        researchSource1: "Article on using similarity between pattern descriptions",
        researchSource2: "Techniques for analyzing similarity of textual descriptions",
        footerText: "FIIT STU Bratislava | Institute of Informatics and Software Engineering | Version 1.0.0",

        // FAQ Modal
        frequentlyAskedQuestions: "Frequently Asked Questions",
        faq1Question: "How does the similarity calculation between patterns work?",
        faq1Answer: "The application analyzes pattern descriptions using TF (term frequency) and IDF (inverse document frequency) methods. You can choose between these methods using the IDF checkbox. Similarity is calculated as cosine similarity between word vectors of individual patterns.",
        faq2Question: "What's the difference between TF and IDF?",
        faq2Answer: "TF (term frequency) gives weight to all words in the text, so patterns are connected based on common words. IDF (inverse document frequency) highlights rare, specific words and suppresses common ones – resulting in cleaner, more meaningful relationships between patterns.",
        faq3Question: "What are stop words and how can I edit them?",
        faq3Answer: "Stop words are common words (e.g., 'a', 'the', 'and') that are ignored during analysis. Click the 🚫 button next to parameters to add your own stop words, remove existing ones, or reset to defaults. Each word must be entered separately.",
        faq4Question: "How does sequence generation work?",
        faq4Answer: "The sequence is generated using Markov Decision Process (MDP). First, the pattern with the highest total similarity is selected (goal). Then the algorithm iteratively selects next patterns based on transition probabilities derived from the similarity matrix. Parameters γ, R(g), R(o), and ε affect the algorithm's behavior.",
        faq5Question: "Can I edit the generated sequence?",
        faq5Answer: "Yes, after generating the sequence you can simply drag patterns with your mouse to change their order. The 🔄 button returns you to the original order if you change your mind.",
        faq6Question: "How can I export results?",
        faq6Answer: "In the 'Suggested Sequence' section, click the 'Export (.txt)' button. The adjacent arrow also offers export to PDF, CSV, and PNG formats (sequence image).",
        faq7Question: "What do the parameters γ, R(g), R(o), and ε mean?",
        faq7Answer: "γ (gamma) is the discount factor – higher values prefer longer paths. R(g) is the reward for reaching the goal, R(o) the reward for visiting other states. ε (epsilon) is the convergence threshold – smaller values mean more precise calculations but more iterations.",
        faq8Question: "Can I view relationships between patterns as a graph?",
        faq8Answer: "Yes, after generating the similarity matrix you can switch between table view (matrix) and graph view (network) using the '🔢 Similarity Matrix' and '🕸️ Similarity Graph' buttons. In the graph, you can click on a node to see its strongest connections.",
        needHelp: "Need more help? Contact us at",

        // Terms Modal
        termsOfUseTitle: "Terms of Use",
        terms1Question: "1. General Terms",
        terms1Answer: "This web application is provided as a service without any warranties. The user agrees to use the application at their own risk.",
        terms2Question: "2. Privacy Protection",
        terms2Answer: "The application does not collect or store any personal user data. All analyses run locally in the browser.",
        terms3Question: "3. Liability Limitations",
        terms3Answer: "Generated pattern sequences are only suggestions and recommendations. The author nor FIIT STU assume responsibility for the consequences of their implementation.",
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
        folderWithTxtFilesTooltip: 'Select the main folder that contains subfolders (e.g., "GoF"). Each subfolder becomes a separate section (language) in the pattern list. .txt files in the root folder will be placed in the "Other" section.',


        // Stop Words Modal
        stopWordsTitle2: "Stop Words Editor",
        stopWordsInfo: "Stop words are common words that are ignored during analysis. Add them as single words (no spaces).",
        stopWordsCurrent: "Current stop words",
        stopWordsAdd: "Add new stop word:",
        stopWordsPlaceholder: "e.g. 'example' (single word only)",
        stopWordsHint: "Press Enter to confirm, word must be without spaces and at least 2 characters long.",
        stopWordsCount: "/30",
        stopWordsReset: "Reset to default",
        stopWordsEmpty: "No stop words. Add some!",
        stopWordsAddButton: "Add",
        stopWordsRemoveTitle: "Remove",
        stopWordsNoSpaces: 'Stop word must be a single word only!',
        stopWordsMinLength: 'Stop word must be at least 2 characters long',
        stopWordsExists: 'Stop word "{word}" already exists',
        stopWordsMaxLimit: 'Maximum number of stop words is 30',
        stopWordsReset: 'Stop words have been reset to default',

        // Pattern Detail Modal
        patternDetailTitle: "Pattern Detail",
        patternDetailBasicInfo: "Basic Information",
        patternDetailName: "Name:",
        patternDetailFile: "File:",
        patternDetailPosition: "Position in sequence:",
        patternDetailPrevSimilarity: "Similarity with previous:",
        patternDetailFirstPattern: "First pattern in sequence",
        patternDetailFullText: "Full pattern text",
        patternDetailSimilarities: "Similarities with other patterns",
        patternDetailNextLabel: "(next)",
        patternDetailPrevLabel: "(previous)",
        patternDetailNoSimilarities: "No similarities with other patterns",
        patternDetailClose: "Close",
        patternDetailViewButton: "View details",     
        patternDetailFilterAll: "All",
        patternDetailFilterSequence: "Only sequence",
        patternDetailNotInSequence: "(outside sequence)",

        // OnHover info
        mdpParamGammaTitle: "γ: 0-1 | Discount factor. Higher value = preference for longer paths.",
        mdpParamGoalRewardTitle: "R(goal): ≥0 | Reward for reaching the goal. Higher value = greater motivation to go directly to the goal.",
        mdpParamOtherRewardTitle: "R(other): ≥0 | Reward for visiting other states. Higher value = more benefit from detours.",
        mdpParamEpsilonTitle: "ε: 0.0001-1 | Convergence threshold. Smaller value = more precise calculations, but more iterations.",
        idfTitle: "IDF (Inverse Document Frequency) - highlights rare words.",
        stopWordsTitle: "Stop words - words that are ignored during analysis",


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
        selectAtLeastTwoPatterns: 'Select at least 2 patterns!',
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
        catalogDeletionCancelled: "Catalog deletion cancelled",
        catalogUploadSuccess: 'Catalog "{catalogName}" was successfully uploaded',
        selectFolder: 'Select folder with txt files',
        noTxtFiles: 'Folder contains no txt files',
        failedToLoadFiles: 'Failed to load any txt files',
        catalogLoadError: 'Error loading catalog: ',
        allPatternsCleared: 'All patterns were cleared',
                





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

    if (typeof refreshStatistics === 'function') {
        refreshStatistics();
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

    const thresholdLabelText = document.getElementById('thresholdLabelText');
    if (thresholdLabelText) {
        thresholdLabelText.textContent = t.graphThreshold;
    }

    const confidenceLabel = document.getElementById('confidenceLabel');
    if (confidenceLabel) confidenceLabel.textContent = t.overallConfidence;

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

    const idfCheckbox = document.getElementById('idfCheckbox');
    if (idfCheckbox) idfCheckbox.title = t.idfTitle;
    
    const stopWordsBtn = document.getElementById('stopWordsBtn');
    if (stopWordsBtn) stopWordsBtn.title = t.stopWordsTitle;

    const matrixViewBtn = document.getElementById('matrixViewBtn');
    const graphViewBtn = document.getElementById('graphViewBtn');
    const statsViewBtn = document.getElementById('statisticsViewBtn');

    document.querySelectorAll('.view-pattern-btn').forEach(btn => {
        btn.setAttribute('title', t.patternDetailViewButton || 'Zobraziť podrobnosti');
    });
    
    const confidenceTooltip = document.getElementById('confidenceTooltip');
    if (confidenceTooltip) {
        confidenceTooltip.title = t.overallConfidenceTooltip;
    }

    const aiConfidenceSpan = document.querySelector('[data-i18n="aiConfidence"]');
    if (aiConfidenceSpan) {
        aiConfidenceSpan.textContent = t.aiConfidence;
    }

    const folderTooltip = document.getElementById('folderTooltip');
    if (folderTooltip) {
        folderTooltip.title = t.folderWithTxtFilesTooltip;
    }
    
    
    if (matrixViewBtn) {
        matrixViewBtn.innerHTML = t.similarityMatrix;
    }
    
    if (graphViewBtn) {
        graphViewBtn.innerHTML = t.similarityGraph;
    }
    
    if (statsViewBtn) {
        statsViewBtn.innerHTML = t.statistics;
    }
    
    // Ak je aktuálne zobrazenie štatistík, prekreslíme ich
    if (window.currentView === 'statistics' && currentStatisticsData) {
        displayStatistics(currentStatisticsData.patterns, currentStatisticsData.matrix);
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

    const aiTooltip = document.getElementById('aiConfidenceTooltip');
    if (aiTooltip) {
        aiTooltip.title = t.aiConfidenceTooltip;
    } 
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

        if (faqQuestions.length >= 8) {  // Zmena z 6 na 8
            if (faqQuestions[0]) faqQuestions[0].textContent = t.faq1Question;
            if (faqQuestions[1]) faqQuestions[1].textContent = t.faq2Question;
            if (faqQuestions[2]) faqQuestions[2].textContent = t.faq3Question;
            if (faqQuestions[3]) faqQuestions[3].textContent = t.faq4Question;
            if (faqQuestions[4]) faqQuestions[4].textContent = t.faq5Question;
            if (faqQuestions[5]) faqQuestions[5].textContent = t.faq6Question;
            if (faqQuestions[6]) faqQuestions[6].textContent = t.faq7Question;
            if (faqQuestions[7]) faqQuestions[7].textContent = t.faq8Question;
        }

        if (faqAnswers.length >= 8) {  // Zmena z 6 na 8
            if (faqAnswers[0]) faqAnswers[0].textContent = t.faq1Answer;
            if (faqAnswers[1]) faqAnswers[1].textContent = t.faq2Answer;
            if (faqAnswers[2]) faqAnswers[2].textContent = t.faq3Answer;
            if (faqAnswers[3]) faqAnswers[3].textContent = t.faq4Answer;
            if (faqAnswers[4]) faqAnswers[4].textContent = t.faq5Answer;
            if (faqAnswers[5]) faqAnswers[5].textContent = t.faq6Answer;
            if (faqAnswers[6]) faqAnswers[6].textContent = t.faq7Answer;
            if (faqAnswers[7]) faqAnswers[7].textContent = t.faq8Answer;
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

    // Stop Words Modal
    const stopWordsModal = document.getElementById('stopWordsModal');
    if (stopWordsModal) {
        const title = stopWordsModal.querySelector('h3');
        if (title) title.textContent = t.stopWordsTitle2;
        
        const info = stopWordsModal.querySelector('.stop-words-info');
        if (info) info.textContent = t.stopWordsInfo;
        
        const currentLabel = stopWordsModal.querySelector('.stop-words-current-label');
        if (currentLabel) currentLabel.textContent = t.stopWordsCurrent;
        
        const totalSpan = stopWordsModal.querySelector('.stop-words-total');
        if (totalSpan) totalSpan.textContent = t.stopWordsCount;
        
        const resetBtn = stopWordsModal.querySelector('.stop-words-reset');
        if (resetBtn) resetBtn.title = t.stopWordsReset;
        
        const addLabel = stopWordsModal.querySelector('.stop-words-add-label');
        if (addLabel) addLabel.textContent = t.stopWordsAdd;
        
        const input = stopWordsModal.querySelector('.stop-words-input');
        if (input) input.placeholder = t.stopWordsPlaceholder;
        
        const addBtn = stopWordsModal.querySelector('.stop-words-add-btn');
        if (addBtn) addBtn.textContent = t.stopWordsAddButton;
        
        const hint = stopWordsModal.querySelector('.stop-words-hint');
        if (hint) hint.textContent = t.stopWordsHint;
        
        // Uložíme pre neskoršie použitie v renderStopWords
        window.stopWordsEmptyText = t.stopWordsEmpty;
        window.stopWordsRemoveTitle = t.stopWordsRemoveTitle;
        
        // Ak je modal otvorený, prekreslíme stop slová (aby sa aktualizovali tooltipy)
        if (!stopWordsModal.classList.contains('hidden')) {
            if (typeof window.renderStopWords === 'function') {
                window.renderStopWords();
            }
        }
    }

    // Pattern Detail Modal
    const patternDetailModal = document.getElementById('patternDetailModal');
    if (patternDetailModal) {
        const title = patternDetailModal.querySelector('h3');
        if (title) title.textContent = t.patternDetailTitle;
        
        const headers = patternDetailModal.querySelectorAll('h4');
        if (headers.length >= 3) {
            if (headers[0]) headers[0].textContent = t.patternDetailBasicInfo;
            if (headers[1]) headers[1].textContent = t.patternDetailFullText;
            if (headers[2]) headers[2].textContent = t.patternDetailSimilarities;
        }
        
        // Aktualizácia popisov v grid-e pomocou data-i18n atribútov
        const i18nElements = patternDetailModal.querySelectorAll('[data-i18n]');
        i18nElements.forEach(el => {
            const key = el.getAttribute('data-i18n');
            if (t[key]) {
                el.textContent = t[key];
            }
        });
    }

    // AI Explanation Modal
    const aiModal = document.getElementById('aiExplanationModal');
    if (aiModal) {
        const title = aiModal.querySelector('h3');
        if (title) {
            title.textContent = t.aiModalTitle;
        }
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