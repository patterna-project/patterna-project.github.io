// ========== WHAT'S NEW MODAL ==========

// Kľúč pre localStorage
const WHATS_NEW_SEEN_KEY = 'patterna_whats_new_seen';

// Globálna premenná pre aktuálnu verziu aplikácie
let currentAppVersion = '';

async function checkAndShowWhatsNew() {
    try {
        // 1. Načítanie obsahu
        const response = await fetch('whatsnew.txt');
        if (!response.ok) return;
        const fullContent = await response.text();
        if (!fullContent || fullContent.trim().length === 0) return;

        // 2. Rozdelenie obsahu: prvý riadok je verzia, zvyšok je obsah pre modal
        const lines = fullContent.split('\n');
        const versionLine = lines[0].trim();
        
        // Ak je prvý riadok prázdny, nepokračujeme
        if (versionLine.length === 0) return;
        
        // Uložíme verziu do globálnej premennej
        currentAppVersion = versionLine;
        
        // Obsah pre modal je od druhého riadku ďalej (zachováme formátovanie)
        const modalContent = lines.slice(1).join('\n').trim();
        
        // Ak je modalContent prázdny, zobrazíme len verziu alebo nič
        if (modalContent.length === 0) {
            console.debug('Whats New modal: Obsah je prázdny (iba verzia)');
            // Aktualizujeme len about modal s verziou
            updateAboutVersion();
            return;
        }

        // 3. Kontrola, či používateľ už videl túto verziu
        const seenVersion = localStorage.getItem(WHATS_NEW_SEEN_KEY);
        if (seenVersion === currentAppVersion) {
            // Už videl, len aktualizujeme about modal
            updateAboutVersion();
            return;
        }

        // 4. Zobrazenie modalu
        const modal = document.getElementById('whatsNewModal');
        const contentDiv = document.getElementById('whatsNewContent');
        if (!modal || !contentDiv) return;

        // Nastavenie nadpisu modalu podľa jazyka
        const title = modal.querySelector('h3');
        if (title) {
            const t = window.translations?.[window.currentLanguage];
            title.textContent = t?.whatsNewTitle || 'What\'s New';
        }

        // Formátovanie obsahu
        contentDiv.innerHTML = formatWhatsNewContent(modalContent);
        openModal('whatsNewModal');
        localStorage.setItem(WHATS_NEW_SEEN_KEY, currentAppVersion);
        
        // Aktualizujeme about modal s novou verziou
        updateAboutVersion();

    } catch (error) {
        console.debug('Whats New modal error:', error);
    }
}

// Funkcia na aktualizáciu verzie len v about modal
function updateAboutVersion() {
    const aboutVersionSpan = document.getElementById('aboutVersion');
    if (aboutVersionSpan && currentAppVersion) {
        aboutVersionSpan.textContent = currentAppVersion;
    }
}

// Formátovanie obsahu (nezmenené)
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

// Inicializácia po načítaní DOM
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(checkAndShowWhatsNew, 500);
});

// Export funkcií pre iné moduly
window.updateAboutVersion = updateAboutVersion;
window.getCurrentAppVersion = () => currentAppVersion;