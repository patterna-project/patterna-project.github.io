// ========== WHAT'S NEW MODAL ==========

// Kľúč pre localStorage
const WHATS_NEW_SEEN_KEY = 'patterna_whats_new_seen';

async function checkAndShowWhatsNew() {
    try {
        // 1. Skúsime načítať whatsnew.txt
        const response = await fetch('whatsnew.txt');
        
        // Ak súbor neexistuje (404) - nezobrazujeme
        if (!response.ok) {
            return;
        }
        
        const content = await response.text();
        
        // 2. Skontrolujeme, či je obsah prázdny (len whitespace)
        if (!content || content.trim().length === 0) {
            return;
        }
        
        // 3. Skontrolujeme, či prvý riadok nie je "NO"
        const firstLine = content.trim().split('\n')[0].trim();
        if (firstLine.toUpperCase() === 'NO') {
            return;
        }
        
        // 4. Skontrolujeme, či už používateľ videl tento obsah
        // Pre jednoduchosť ukladáme hash obsahu, aby sa zobrazilo len pri zmene
        const contentHash = simpleHash(content);
        const seenHash = localStorage.getItem(WHATS_NEW_SEEN_KEY);
        
        if (seenHash === contentHash) {
            // Už videl túto verziu
            return;
        }
        
        // 5. Zobrazíme modal s obsahom
        const modal = document.getElementById('whatsNewModal');
        const contentDiv = document.getElementById('whatsNewContent');
        
        if (!modal || !contentDiv) return;
        
        // Formátovanie obsahu - jednoduché odstavce
        contentDiv.innerHTML = formatWhatsNewContent(content);
        
        // Zobraziť modal
        modal.classList.remove('hidden');
        
        // Uložíme hash do localStorage
        localStorage.setItem(WHATS_NEW_SEEN_KEY, contentHash);
        
    } catch (error) {
        // Ticho zlyháme - nechceme rušiť používateľa
        console.debug('Whats New modal error:', error);
    }
}

// Jednoduchá hash funkcia pre obsah
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
}

// Formátovanie obsahu - podpora odstavcov
function formatWhatsNewContent(content) {
    // Rozdelíme podľa prázdnych riadkov
    const paragraphs = content.split(/\n\s*\n/);
    
    return paragraphs.map(para => {
        const trimmed = para.trim();
        if (trimmed.length === 0) return '';
        
        // Nahradíme jednoduché konce riadkov v rámci odstavca
        const lines = trimmed.split('\n');
        if (lines.length === 1) {
            return `<p class="mb-3">${escapeHtml(trimmed)}</p>`;
        } else {
            // Viacriadkový odstavec
            const formattedLines = lines.map(line => {
                if (line.startsWith('- ')) {
                    // Zoznam
                    return `<li class="ml-4 list-disc">${escapeHtml(line.substring(2))}</li>`;
                } else if (line.startsWith('  - ') || line.startsWith('\t- ')) {
                    // Podzoznam
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

// Escape HTML pre bezpečnosť
function escapeHtml(unsafe) {
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// Inicializácia pri načítaní stránky
document.addEventListener('DOMContentLoaded', () => {
    // Počkáme na načítanie všetkých ostatných skriptov
    setTimeout(checkAndShowWhatsNew, 500);
    
    // Event listener pre zatvorenie modalu
    const modal = document.getElementById('whatsNewModal');
    const closeBtn = document.getElementById('closeWhatsNewModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }
    
    // Zatvorenie kliknutím mimo modal
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
    
    // Zatvorenie ESC klávesou
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    });
});