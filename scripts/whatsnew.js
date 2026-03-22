// ========== WHAT'S NEW MODAL ==========

// Kľúč pre localStorage
const WHATS_NEW_SEEN_KEY = 'patterna_whats_new_seen';

async function checkAndShowWhatsNew() {
    try {
        // 1. Načítanie obsahu
        const response = await fetch('whatsnew.txt');
        if (!response.ok) return;
        const content = await response.text();
        if (!content || content.trim().length === 0) return;

        // 2. Kontrola prvého riadku
        const firstLine = content.trim().split('\n')[0].trim();
        if (firstLine.toUpperCase() === 'NO') return;

        // 3. Overenie, či používateľ už videl túto verziu
        const contentHash = simpleHash(content);
        const seenHash = localStorage.getItem(WHATS_NEW_SEEN_KEY);
        if (seenHash === contentHash) return;

        // 4. Zobrazenie modalu
        const modal = document.getElementById('whatsNewModal');
        const contentDiv = document.getElementById('whatsNewContent');
        if (!modal || !contentDiv) return;

        contentDiv.innerHTML = formatWhatsNewContent(content);
        openModal('whatsNewModal');           // Otvorí modal cez centralizovanú funkciu
        localStorage.setItem(WHATS_NEW_SEEN_KEY, contentHash);

    } catch (error) {
        console.debug('Whats New modal error:', error);
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