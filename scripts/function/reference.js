//function/reference.js

// Predvolené frázy pre referencie
const DEFAULT_REFERENCE_PHRASES = [
    "see also", "cf.", "refer to", "as in", "paired with", "foundation for",
    "leads to", "supports", "enables", "works with", "is used with",
    "can be combined with", "fits with", "is essential for", "often used with",
    "calls", "invokes", "delegates to", "uses", "employs", "leverages",
    "follows", "extends", "implements", "depends on", "relies on", "builds on",
    "based on", "derived from", "inspired by", "similar to", "same as",
    "counterpart", "variant", "alternative", "specialization of",
    "generalization of", "look at", "check", "note that", "refers to",
    "is the foundation for", "is a prerequisite for", "is used as a basis for",
    "works well with", "complements", "is often combined with", "is a variation of",
    "is a special case of", "is implemented using", "is based on"
];

window.customReferencePhrases = new Set(DEFAULT_REFERENCE_PHRASES);
window.referenceEnabled = true;  // zodpovedá checkboxu v UI

function initReferenceSettings() {
    const refBtn = document.getElementById('referenceBtn');
    const refModal = document.getElementById('referenceModal');
    const closeBtn = document.getElementById('closeReferenceModal');
    const phrasesContainer = document.getElementById('referencePhrasesContainer');
    const newPhraseInput = document.getElementById('newReferencePhrase');
    const addBtn = document.getElementById('addReferencePhraseBtn');
    const resetBtn = document.getElementById('resetReferenceBtn');
    const loadFileBtn = document.getElementById('loadReferenceFromFileBtn');
    const fileInput = document.getElementById('referenceFileInput');
    const enableCheckbox = document.getElementById('referenceEnableCheckbox');
    const countSpan = document.getElementById('referencePhrasesCount');

    if (!refBtn || !refModal) return;

    function getT() { return window.translations?.[window.currentLanguage] || window.translations?.sk; }

    function isDefaultPhrases() {
        const current = Array.from(window.customReferencePhrases).sort();
        const def = [...DEFAULT_REFERENCE_PHRASES].sort();
        return JSON.stringify(current) === JSON.stringify(def);
    }

    function updateResetBtn() {
        if (resetBtn) {
            if (isDefaultPhrases()) resetBtn.classList.add('hidden');
            else resetBtn.classList.remove('hidden');
        }
    }

    function updateAddBtn() {
        if (addBtn && newPhraseInput) {
            addBtn.disabled = newPhraseInput.value.trim().length === 0;
        }
    }

    function renderPhrases() {
        if (!phrasesContainer) return;
        phrasesContainer.innerHTML = '';
        const sorted = Array.from(window.customReferencePhrases).sort();
        const t = getT();
        for (const phrase of sorted) {
            const tag = document.createElement('span');
            tag.className = 'reference-phrase-tag inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 rounded-full text-sm group';
            tag.innerHTML = `
                <span class="text-gray-700 dark:text-gray-300">${escapeHtml(phrase)}</span>
                <button class="remove-phrase ml-1 w-5 h-5 flex items-center justify-center rounded-full bg-indigo-200 text-indigo-700 hover:bg-red-500 hover:text-white transition" data-phrase="${escapeHtml(phrase)}">×</button>
            `;
            const removeBtn = tag.querySelector('.remove-phrase');
            removeBtn.addEventListener('click', () => {
                window.customReferencePhrases.delete(phrase);
                renderPhrases();
                updateCount();
                updateResetBtn();
            });
            phrasesContainer.appendChild(tag);
        }
        if (sorted.length === 0) {
            phrasesContainer.innerHTML = `<p class="text-gray-400 italic text-center py-4">${t?.referenceEmpty || 'Žiadne frázy. Pridajte nejaké!'}</p>`;
        }
        updateCount();
        updateResetBtn();
    }

    function updateCount() {
        if (countSpan) countSpan.textContent = window.customReferencePhrases.size;
    }

    function resetToDefault() {
        window.customReferencePhrases.clear();
        DEFAULT_REFERENCE_PHRASES.forEach(p => window.customReferencePhrases.add(p));
        renderPhrases();
        const t = getT();
        showToast(t?.referenceResetAfter || 'Referenčné frázy boli resetované na predvolené', 'info');
    }

    function addPhrase() {
        const t = getT();
        let phrase = newPhraseInput.value.trim();
        if (phrase === '') return;
        if (window.customReferencePhrases.has(phrase)) {
            showToast((t?.referenceExists || 'Fráza "{phrase}" už existuje').replace('{phrase}', phrase), 'warning');
            newPhraseInput.value = '';
            updateAddBtn();
            return;
        }
        if (window.customReferencePhrases.size >= 200) {
            showToast(t?.referenceMaxLimit || 'Maximálny počet fráz je 200', 'warning');
            return;
        }
        window.customReferencePhrases.add(phrase);
        renderPhrases();
        newPhraseInput.value = '';
        updateAddBtn();
        newPhraseInput.focus();
    }

    // Load from file
    if (loadFileBtn && fileInput) {
        loadFileBtn.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                const content = ev.target.result;
                const lines = content.split(/\r?\n/);
                const newSet = new Set();
                const t = getT();
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed === '') continue;
                    if (newSet.size >= 200) break;
                    newSet.add(trimmed);
                }
                if (newSet.size > 0) {
                    window.customReferencePhrases = newSet;
                    renderPhrases();
                    let msg = (t?.referenceLoadedFromFile || 'Načítaných {count} fráz zo súboru').replace('{count}', newSet.size);
                    if (newSet.size === 200 && lines.length > 200) msg += ' ' + (t?.referenceFileTruncated || '(súbor obsahoval viac fráz, ponechaných bolo prvých 200)');
                    showToast(msg, 'success');
                } else {
                    showToast(t?.referenceNoValidPhrases || 'Žiadne platné frázy v súbore', 'warning');
                }
                fileInput.value = '';
            };
            reader.readAsText(file);
        });
    }

    // Event listeners
    refBtn.addEventListener('click', () => {
        renderPhrases();
        openModal('referenceModal');
        setTimeout(() => newPhraseInput?.focus(), 100);
    });
    if (closeBtn) closeBtn.addEventListener('click', () => closeModal('referenceModal'));
    refModal.addEventListener('click', (e) => { if (e.target === refModal) closeModal('referenceModal'); });
    addBtn.addEventListener('click', addPhrase);
    newPhraseInput.addEventListener('input', updateAddBtn);
    newPhraseInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addPhrase(); });
    resetBtn.addEventListener('click', resetToDefault);

    // Prepínač zapnutia referenčného bonusu
    if (enableCheckbox) {
        enableCheckbox.checked = window.referenceEnabled;
        enableCheckbox.addEventListener('change', (e) => {
            window.referenceEnabled = e.target.checked;
            updateReferenceButtonStyle();
            // Synchronizácia s checkboxom v parametroch (ak existuje)
            const refCheckbox = document.getElementById('referenceCheckbox');
            if (refCheckbox) refCheckbox.checked = window.referenceEnabled;
        });
    }

    function updateReferenceButtonStyle() {
        const btn = document.getElementById('referenceBtn');
        if (!btn) return;
        if (window.referenceEnabled) {
            btn.classList.add('btn-enabled');
        } else {
            btn.classList.remove('btn-enabled');
        }
    }

    // Synchronizácia s existujúcim checkboxom (ak je)
    const existingCheckbox = document.getElementById('referenceCheckbox');
    if (existingCheckbox) {
        existingCheckbox.addEventListener('change', (e) => {
            window.referenceEnabled = e.target.checked;
            if (enableCheckbox) enableCheckbox.checked = window.referenceEnabled;
            updateReferenceButtonStyle();
        });
    }

    updateReferenceButtonStyle();
    renderPhrases();
}

document.addEventListener('DOMContentLoaded', initReferenceSettings);