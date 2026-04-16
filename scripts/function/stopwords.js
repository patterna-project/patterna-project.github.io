//function/stopwords.js

// Predvolené stop slová
const DEFAULT_STOP_WORDS = [
    'a', 'an', 'the', 'and', 'it', 'is', 'to', 'at', 'in', 'we', 'of', 'be'
];

// Inicializácia globálneho objektu pre stop slová
window.customStopWords = new Set(DEFAULT_STOP_WORDS);

function initStopWordsSettings() {
    const stopWordsBtn = document.getElementById('stopWordsBtn');
    const stopWordsModal = document.getElementById('stopWordsModal');
    const closeBtn = document.getElementById('closeStopWordsModal');
    const stopWordsContainer = document.getElementById('stopWordsContainer');
    const newStopWordInput = document.getElementById('newStopWordInput');
    const addStopWordBtn = document.getElementById('addStopWordBtn');
    const resetBtn = document.getElementById('resetStopWordsBtn');

    const loadFromFileBtn = document.getElementById('loadStopWordsFromFileBtn');
    const fileInput = document.getElementById('stopWordsFileInput');


    if (!stopWordsBtn || !stopWordsModal) return;

    // Funkcia na získanie prekladov
    function getT() {
        return window.translations?.[window.currentLanguage] || window.translations?.sk;
    }

    // Funkcia na kontrolu, či sú aktuálne slová rovnaké ako predvolené
    function isDefaultWords() {
        const currentWords = Array.from(window.customStopWords).sort();
        const defaultWords = [...DEFAULT_STOP_WORDS].sort();
        return JSON.stringify(currentWords) === JSON.stringify(defaultWords);
    }

    // Funkcia na aktualizáciu stavu tlačidiel
    function updateButtonStates() {
        // Reset button - zobrazí sa len keď slová nie sú predvolené
        if (resetBtn) {
            if (isDefaultWords()) {
                resetBtn.classList.add('hidden');
            } else {
                resetBtn.classList.remove('hidden');
            }
        }

        // Add button - disabled keď je input prázdny
        if (addStopWordBtn && newStopWordInput) {
            addStopWordBtn.disabled = newStopWordInput.value.trim().length === 0;
        }
    }

    // Funkcia a spracovanie nahrania súboru
    if (loadFromFileBtn && fileInput) {
        loadFromFileBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                const content = e.target.result;
                // Rozdelíme podľa bielych znakov
                const words = content.split(/\s+/).filter(w => w.trim().length > 0);
                
                const t = getT();
                const newSet = new Set();
                
                // Prechádzame slová a ukladáme ich do Setu, kým nedosiahneme limit 200
                for (const rawWord of words) {
                    if (newSet.size >= 200) break; // Limit 200
                    
                    const word = rawWord.trim().toLowerCase();
                    if (word.length >= 2 && !word.includes(' ')) {
                        newSet.add(word);
                    }
                }
                
                if (newSet.size === 0) {
                    showToast(t?.stopWordsNoValidWords || 'V súbore neboli nájdené žiadne platné stop slová', 'warning');
                } else {
                    window.customStopWords = newSet;
                    renderStopWords();
                    updateButtonStates();
                    
                    let message = (t?.stopWordsLoadedFromFile || 'Načítaných {count} stop slov zo súboru').replace('{count}', newSet.size);
                    if (words.length > 200) {
                        message += ' ' + (t?.stopWordsFileTruncated || '(súbor obsahoval viac slov, ponechaných bolo prvých 200)');
                    }
                    showToast(message, 'success');
                }
                
                fileInput.value = '';
            };
            
            reader.readAsText(file);
        });
    }



    // Sledovanie inputu pre povolenie/zakázanie tlačidla
    newStopWordInput.addEventListener('input', updateButtonStates);

    // Otvorenie modalu
    stopWordsBtn.addEventListener('click', () => {
        openModal('stopWordsModal');
        renderStopWords();
        updateButtonStates();
        // Focus na input po otvorení
        setTimeout(() => newStopWordInput?.focus(), 100);
    });

    // Pridanie stop slova (iba jedno slovo, bez medzier)
    function addStopWord() {
        const t = getT();
        const rawWord = newStopWordInput.value.trim();
        
        // Kontrola: iba jedno slovo (žiadne medzery)
        if (!rawWord) return;
        
        if (rawWord.includes(' ')) {
            showToast(t?.stopWordsNoSpaces || 'Stop slovo môže obsahovať iba jedno slovo!', 'warning');
            return;
        }
        
        const word = rawWord.toLowerCase();
        
        // Kontrola dĺžky
        if (word.length < 2) {
            showToast(t?.stopWordsMinLength || 'Stop slovo musí mať aspoň 2 znaky', 'warning');
            return;
        }
        
        // Kontrola duplicity
        if (window.customStopWords.has(word)) {
            showToast((t?.stopWordsExists || 'Stop slovo "{word}" už existuje').replace('{word}', word), 'info');
            newStopWordInput.value = '';
            updateButtonStates();
            return;
        }
        
        // Kontrola maximálneho počtu (200)
        if (window.customStopWords.size >= 200) {
            showToast(t?.stopWordsMaxLimit || 'Maximálny počet stop slov je 200', 'warning');
            return;
        }
        
        window.customStopWords.add(word);
        renderStopWords();
        newStopWordInput.value = '';
        updateButtonStates();
        newStopWordInput.focus();
    }

    addStopWordBtn.addEventListener('click', addStopWord);

    newStopWordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (!addStopWordBtn.disabled) {
                addStopWord();
            }
        }
    });

    // Reset na predvolené
    resetBtn.addEventListener('click', () => {
        const t = getT();
        window.customStopWords = new Set(DEFAULT_STOP_WORDS);
        renderStopWords();
        updateButtonStates();
        showToast(t?.stopWordsResetAfter || 'Stop slová boli resetované na predvolené', 'info');
    });

    function renderStopWords() {
        if (!stopWordsContainer) return;
        
        stopWordsContainer.innerHTML = '';
        const sortedWords = Array.from(window.customStopWords).sort();
        
        const t = getT();
        
        sortedWords.forEach(word => {
            const tag = document.createElement('span');
            tag.className = 'stop-word-tag inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-700 rounded-full text-sm group';
            
            // Text slova
            const wordSpan = document.createElement('span');
            wordSpan.className = 'text-gray-700 dark:text-gray-300';
            wordSpan.textContent = word;
            
            // Krížik s onhover efektom
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-stopword ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-indigo-200 dark:bg-indigo-700 text-indigo-700 dark:text-indigo-300 hover:bg-red-500 hover:text-white dark:hover:bg-red-600 transition-all duration-200';
            removeBtn.innerHTML = '×';
            removeBtn.setAttribute('data-word', word);
            removeBtn.setAttribute('title', (t?.stopWordsRemoveTitle || 'Odstrániť "{word}"').replace('{word}', word));
            
            removeBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                window.customStopWords.delete(word);
                renderStopWords();
                updateButtonStates();
            });
            
            tag.appendChild(wordSpan);
            tag.appendChild(removeBtn);
            
            stopWordsContainer.appendChild(tag);
        });
        
        if (sortedWords.length === 0) {
            stopWordsContainer.innerHTML = `<p class="text-gray-400 dark:text-gray-500 text-sm italic text-center py-4">${t?.stopWordsEmpty || 'Žiadne stop slová. Pridajte nejaké!'}</p>`;
        }

        // Aktualizácia počítadla
        const countSpan = document.getElementById('stopWordsCount');
        if (countSpan) {
            countSpan.textContent = window.customStopWords.size;
        }
        
        updateButtonStates();
    }
}

// Inicializácia po načítaní DOM
document.addEventListener('DOMContentLoaded', initStopWordsSettings);