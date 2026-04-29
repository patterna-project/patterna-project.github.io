// Default forces lexicon (word -> weight)
const DEFAULT_FORCES = {
    "flexibility": 0.8,
    "adaptability": 0.7,
    "extensibility": 0.7,
    "maintainability": 0.8,
    "reusability": 0.7,
    "scalability": 0.8,
    "performance": 0.9,
    "simplicity": 0.7,
    "testability": 0.7,
    "cohesion": 0.7,
    "autonomy": 0.6,
    "coordination": 0.6,
    "evolvability": 0.7,
    "robustness": 0.7,
    "complexity": -0.8,
    "coupling": -0.7,
    "overhead": -0.6,
    "latency": -0.6,
    "brittleness": -0.6
};

window.customForces = new Map();
window.forcesEnabled = false;

// Kontrola, či sú aktuálne sily rovnaké ako predvolené
function isDefaultForces() {
    const currentEntries = Array.from(window.customForces.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const defaultEntries = Object.entries(DEFAULT_FORCES).sort((a, b) => a[0].localeCompare(b[0]));
    
    if (currentEntries.length !== defaultEntries.length) return false;
    
    for (let i = 0; i < currentEntries.length; i++) {
        if (currentEntries[i][0] !== defaultEntries[i][0]) return false;
        if (currentEntries[i][1] !== defaultEntries[i][1]) return false;
    }
    return true;
}

// Aktualizácia stavu tlačidiel (hlavne reset button)
function updateForcesButtonStates() {
    const resetBtn = document.getElementById('resetForcesBtn');
    if (!resetBtn) return;
    
    if (isDefaultForces()) {
        resetBtn.classList.add('hidden');
    } else {
        resetBtn.classList.remove('hidden');
    }
}

function initForcesSettings() {
    // ===== ZÍSKAME VŠETKY DOM ELEMENTY =====
    const forcesBtn = document.getElementById('forcesLexiconBtn');
    const forcesModal = document.getElementById('forcesModal');
    const closeBtn = document.getElementById('closeForcesModal');
    const forcesContainer = document.getElementById('forcesContainer');
    const newForceWord = document.getElementById('newForceWord');
    const newForceSign = document.getElementById('newForceSign');      // NOVÝ: select pre znamienko
    const newForceValue = document.getElementById('newForceValue');    // NOVÝ: input pre hodnotu
    const addForceBtn = document.getElementById('addForceBtn');
    const resetBtn = document.getElementById('resetForcesBtn');
    const loadFileBtn = document.getElementById('loadForcesFromFileBtn');
    const fileInput = document.getElementById('forcesFileInput');
    const forcesEnableCheckbox = document.getElementById('forcesEnableCheckbox');
    const forcesWeightInput = document.getElementById('forcesWeightInput');

    // Validácia váhy síl (α) – rozsah 0-1
    if (forcesWeightInput) {
        forcesWeightInput.addEventListener('blur', function() {
            let value = parseFloat(this.value);
            if (isNaN(value)) {
                this.value = 0.3;
            } else {
                value = Math.min(Math.max(value, 0), 1);
                this.value = value;
            }
        });
    }

    // Validácia hodnoty sily (absolútna) – rozsah 0.1 – 1
    if (newForceValue) {
        newForceValue.addEventListener('blur', function() {
            let value = parseFloat(this.value);
            if (isNaN(value)) {
                this.value = 0.5;
            } else {
                value = Math.min(1, Math.max(0.1, value));
                this.value = value;
            }
        });
    }

    if (!forcesBtn || !forcesModal) return;

    // ===== NAČÍTANIE PREDVOLENÝCH SÍL =====
    resetForcesToDefault();

    // Inicializácia checkboxu pre povolenie síl
    if (forcesEnableCheckbox) {
        forcesEnableCheckbox.checked = window.forcesEnabled;
        forcesEnableCheckbox.addEventListener('change', (e) => {
            window.forcesEnabled = e.target.checked;
        });
    }

    function updateForceButtonState() {
        if (addForceBtn && newForceWord) {
            addForceBtn.disabled = newForceWord.value.trim().length === 0;
        }
    }

    function getT() {
        return window.translations?.[window.currentLanguage] || window.translations?.sk;
    }

    function renderForces() {
        if (!forcesContainer) return;
        forcesContainer.innerHTML = '';
        const sorted = Array.from(window.customForces.entries()).sort((a, b) => a[0].localeCompare(b[0]));
        const t = getT();
        for (const [word, weight] of sorted) {
            const tag = document.createElement('span');
            tag.className = 'force-tag inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 rounded-full text-sm group';
            const weightColor = weight >= 0 ? 'text-green-600' : 'text-red-600';
            const weightDisplay = weight > 0 ? `+${weight}` : `${weight}`;
            const escapedWord = (typeof escapeHtml === 'function') ? escapeHtml(word) : word;
            tag.innerHTML = `
                <span class="text-gray-700 dark:text-gray-300">${escapedWord}</span>
                <span class="text-xs font-bold ${weightColor}">(${weightDisplay})</span>
                <button class="remove-force ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-700 hover:bg-red-500 hover:text-white transition" data-word="${word}">×</button>
            `;
            const removeBtn = tag.querySelector('.remove-force');
            removeBtn.addEventListener('click', () => {
                window.customForces.delete(word);
                renderForces();
                updateForcesCount();
                updateForcesButtonStates();
            });
            forcesContainer.appendChild(tag);
        }
        if (sorted.length === 0) {
            forcesContainer.innerHTML = `<p class="text-gray-400 italic text-center py-4">${t?.forcesEmpty || 'Žiadne sily. Pridajte nejaké!'}</p>`;
        }
        updateForcesCount();
        updateForcesButtonStates();
    }

    function updateForcesCount() {
        const countSpan = document.getElementById('forcesCount');
        if (countSpan) countSpan.textContent = window.customForces.size;
    }

    function resetForcesToDefault() {
        window.customForces.clear();
        for (const [word, weight] of Object.entries(DEFAULT_FORCES)) {
            window.customForces.set(word, weight);
        }
        renderForces();
        if (forcesWeightInput) forcesWeightInput.value = 0.3;
        updateForcesButtonStates();
    }

    function addForce() {
        const t = getT();
        let word = newForceWord.value.trim().toLowerCase();
        if (word === '') return;
        if (word.includes(' ')) {
            showToast(t?.forcesNoSpaces || 'Slovo nesmie obsahovať medzery!', 'warning');
            return;
        }
        if (word.length < 2) {
            showToast(t?.forcesMinLength || 'Slovo musí mať aspoň 2 znaky', 'warning');
            return;
        }
        if (window.customForces.size >= 200) {
            showToast(t?.forcesMaxLimit || 'Maximálny počet síl je 200', 'warning');
            return;
        }

        // Získanie znamienka a hodnoty
        const sign = parseInt(newForceSign.value, 10); // 1 alebo -1
        let rawValue = parseFloat(newForceValue.value);
        if (isNaN(rawValue)) rawValue = 0.5;
        // Obmedzenie na rozsah 0.1 – 1
        const absValue = Math.min(1, Math.max(0.1, rawValue));
        const weight = sign * absValue;

        window.customForces.set(word, weight);
        renderForces();

        // Reset vstupov
        newForceWord.value = '';
        newForceValue.value = '0.5';
        newForceSign.value = '1';
        updateForceButtonState();
        newForceWord.focus();
        updateForcesButtonStates();
    }

    // ===== EVENT LISTENERY =====
    forcesBtn.addEventListener('click', () => {
        renderForces();
        openModal('forcesModal');
        setTimeout(() => newForceWord?.focus(), 100);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal('forcesModal'));
    forcesModal.addEventListener('click', (e) => { if (e.target === forcesModal) closeModal('forcesModal'); });
    addForceBtn.addEventListener('click', addForce);
    newForceWord.addEventListener('input', updateForceButtonState);
    newForceWord.addEventListener('keypress', (e) => { if (e.key === 'Enter') addForce(); });
    
    resetBtn.addEventListener('click', () => {
        resetForcesToDefault();
        const t = getT();
        showToast(t?.forcesResetAfter || 'Sily boli resetované na predvolené', 'info');
    });

    // Načítanie zo súboru
    if (loadFileBtn && fileInput) {
        loadFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const content = ev.target.result;
                const lines = content.split(/\r?\n/);
                const newMap = new Map();
                const t = getT();
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed === '') continue;
                    let [word, weightStr] = trimmed.split(/\s+/);
                    if (!weightStr) weightStr = '0.5';
                    const weight = parseFloat(weightStr);
                    if (isNaN(weight)) continue;
                    word = word.toLowerCase();
                    if (word.length >= 2 && !word.includes(' ')) {
                        newMap.set(word, Math.min(1, Math.max(-1, weight)));
                    }
                    if (newMap.size >= 200) break;
                }
                if (newMap.size > 0) {
                    window.customForces = newMap;
                    renderForces();
                    let msg = (t?.forcesLoadedFromFile || 'Načítaných {count} síl zo súboru').replace('{count}', newMap.size);
                    if (newMap.size === 200 && lines.length > 200) msg += ' ' + (t?.forcesFileTruncated || '(súbor obsahoval viac slov, ponechaných bolo prvých 200)');
                    showToast(msg, 'success');
                    updateForcesButtonStates();
                } else {
                    showToast(t?.forcesNoValidWords || 'Žiadne platné sily v súbore', 'warning');
                }
                fileInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    updateForceButtonState();
    updateForcesButtonStates();
}

document.addEventListener('DOMContentLoaded', initForcesSettings);