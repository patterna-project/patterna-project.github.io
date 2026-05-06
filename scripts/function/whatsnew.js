// function/whatsnew.js

// Kľúč pre localStorage
const WHATS_NEW_SEEN_KEY = 'patterna_whats_new_seen';

// Globálne premenné
let currentAppVersion = '';
let cachedWhatsNewContent = null;      // Uložený obsah pre rýchle zobrazenie
let cachedWhatsNewVersion = null;

// ========== FUNKCIE PRE PRÁCU S OBSAHOM ==========

async function fetchWhatsNew() {
    try {
        const response = await fetch('whatsnew.txt');
        if (!response.ok) return null;
        const fullContent = await response.text();
        if (!fullContent || fullContent.trim().length === 0) return null;

        const lines = fullContent.split('\n');
        const versionLine = lines[0].trim();
        if (versionLine.length === 0) return null;

        const modalContent = lines.slice(1).join('\n').trim();
        return { version: versionLine, content: modalContent };
    } catch (error) {
        console.debug('Whats New fetch error:', error);
        return null;
    }
}

function formatWhatsNewContent(content) {
    const paragraphs = content.split(/\n\s*\n/);
    return paragraphs.map(para => {
        const trimmed = para.trim();
        if (trimmed.length === 0) return '';

        const lines = trimmed.split('\n');
        if (lines.length === 1) {
            return `<p class="mb-3">${escapeHtml(trimmed)}</p>`;
        } else {
            const formattedLines = lines.map(line => {
                if (line.startsWith('- ')) {
                    return `<li class="ml-4 list-disc">${escapeHtml(line.substring(2))}</li>`;
                } else if (line.startsWith('  - ') || line.startsWith('\t- ')) {
                    return `<li class="ml-8 list-circle">${escapeHtml(line.replace(/^[\s\t]+- /, ''))}</li>`;
                } else if (line.trim().length > 0) {
                    return `<span>${escapeHtml(line)}</span><br>`;
                }
                return '';
            }).join('');
            return `<div class="mb-3">${formattedLines}</div>`;
        }
    }).join('');
}

// Zobrazenie modalu s načítaným obsahom (neukladá do localStorage)
async function showWhatsNewModal() {
    let data;
    if (cachedWhatsNewContent && cachedWhatsNewVersion) {
        data = { version: cachedWhatsNewVersion, content: cachedWhatsNewContent };
    } else {
        data = await fetchWhatsNew();
        if (data) {
            cachedWhatsNewVersion = data.version;
            cachedWhatsNewContent = data.content;
        }
    }

    if (!data || !data.content || data.content.length === 0) {
        // Nemáme čo zobraziť – možno tichá chyba alebo toast
        const t = window.translations?.[window.currentLanguage];
        showToast(t?.whatsNewEmpty || 'Žiadne novinky nie sú k dispozícii.', 'info');
        return;
    }

    const modal = document.getElementById('whatsNewModal');
    const contentDiv = document.getElementById('whatsNewContent');
    if (!modal || !contentDiv) return;

    const title = modal.querySelector('h3');
    if (title) {
        const t = window.translations?.[window.currentLanguage];
        title.textContent = t?.whatsNewTitle || 'What\'s New';
    }

    contentDiv.innerHTML = formatWhatsNewContent(data.content);
    openModal('whatsNewModal');
}

// Automatické zobrazenie pri novej verzii (ukladá do localStorage)
async function checkAndShowWhatsNew() {
    const data = await fetchWhatsNew();
    if (!data) return;

    // Uloženie aktuálnej verzie do globálnej premennej pre About modal
    currentAppVersion = data.version;
    updateAboutVersion();

    const seenVersion = localStorage.getItem(WHATS_NEW_SEEN_KEY);
    if (seenVersion === currentAppVersion) return;   // už videné

    // Inak zobrazíme modal a uložíme verziu
    if (!data.content || data.content.length === 0) return;

    const modal = document.getElementById('whatsNewModal');
    const contentDiv = document.getElementById('whatsNewContent');
    if (!modal || !contentDiv) return;

    const title = modal.querySelector('h3');
    if (title) {
        const t = window.translations?.[window.currentLanguage];
        title.textContent = t?.whatsNewTitle || 'What\'s New';
    }

    contentDiv.innerHTML = formatWhatsNewContent(data.content);
    openModal('whatsNewModal');
    localStorage.setItem(WHATS_NEW_SEEN_KEY, currentAppVersion);
}

// Aktualizácia verzie v About modale
function updateAboutVersion() {
    const aboutVersionSpan = document.getElementById('aboutVersion');
    if (aboutVersionSpan && currentAppVersion) {
        aboutVersionSpan.textContent = currentAppVersion;
        // Pridáme vizuálnu indikáciu, že je klikateľné
        aboutVersionSpan.style.cursor = 'pointer';
        aboutVersionSpan.style.textDecoration = 'underline dotted';
        aboutVersionSpan.title = window.translations?.[window.currentLanguage]?.clickToSeeWhatsNew || 'Kliknite pre zobrazenie noviniek';
    }
}

// Pridanie event listenera na verziu v About modale
function bindVersionClickListener() {
    const aboutVersionSpan = document.getElementById('aboutVersion');
    if (aboutVersionSpan) {
        // Odstraníme starý listener, aby sa nenabaľoval
        aboutVersionSpan.removeEventListener('click', showWhatsNewModal);
        aboutVersionSpan.addEventListener('click', showWhatsNewModal);
    } else {
        // Ak element ešte neexistuje, skúsime neskôr (napr. keď sa načíta About modal)
        setTimeout(bindVersionClickListener, 500);
    }
}

// ========== INICIALIZÁCIA ==========
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkAndShowWhatsNew, 500);
    bindVersionClickListener();
});

// Export funkcií pre prípadné volanie z iných modulov
window.updateAboutVersion = updateAboutVersion;
window.getCurrentAppVersion = () => currentAppVersion;
window.showWhatsNewModal = showWhatsNewModal;  // ak by niekto chcel zavolať manuálne