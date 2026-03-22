//utils.js

/**
 * Escapuje HTML špeciálne znaky pre bezpečné zobrazenie používateľského vstupu
 * @param {string} unsafe - Neescapovaný text
 * @returns {string} Escapovaný text bezpečný pre innerHTML
 */
function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

/**
 * Vytvorí oneskorenie (delay) pre async funkcie
 * @param {number} ms - Počet milisekúnd
 * @returns {Promise} Promise, ktorý sa vyrieši po uplynutí času
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Throttle funkcia - obmedzuje volanie funkcie na určitý interval
 * @param {Function} func - Funkcia na throttlovanie
 * @param {number} limit - Limit v milisekundách
 * @returns {Function} Throttlovaná funkcia
 */
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Získa aktuálny dátum a čas vo formáte YYYY-MM-DD_HH-MM-SS
 * @returns {string} Formátovaný dátum a čas
 */
function getFormattedDateTime() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
}

/**
 * Jednoduchá hash funkcia pre reťazce
 * @param {string} str - Vstupný reťazec
 * @returns {string} Hash v base36
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString(36);
}

/**
 * Stiahne obsah ako súbor
 * @param {string|Blob} content - Obsah na stiahnutie
 * @param {string} filename - Názov súboru
 * @param {string} mimeType - MIME typ
 */
function downloadAsFile(content, filename, mimeType) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

/**
 * Vráti farby (background, text, border) pre danú percentuálnu hodnotu spoľahlivosti
 * @param {number} percent - Hodnota v rozsahu 0-100
 * @returns {Object} Objekt s vlastnosťami bg, text, border
 */
function getConfidenceColor(percent) {
    // percent je 0-100
    // HSL pre plynulý prechod: červená (0°), oranžová (30°), žltá (60°), zelená (120°)
    
    const p = Math.min(100, Math.max(0, percent)) / 100; // 0-1
    
    // Pre light mode
    if (!document.documentElement.classList.contains('dark')) {
        // Prechod cez HSL pre plynulé farby
        if (p < 0.25) {
            // Červená -> oranžová (0-25%)
            const t = p / 0.25; // 0-1
            const hue = 0 + (30 * t); // 0° -> 30°
            return {
                bg: `hsl(${hue}, 100%, 95%)`,
                text: `hsl(${hue}, 80%, 30%)`,
                border: `hsl(${hue}, 80%, 70%)`
            };
        } else if (p < 0.5) {
            // Oranžová -> žltá (25-50%)
            const t = (p - 0.25) / 0.25; // 0-1
            const hue = 30 + (30 * t); // 30° -> 60°
            return {
                bg: `hsl(${hue}, 100%, 92%)`,
                text: `hsl(${hue}, 80%, 30%)`,
                border: `hsl(${hue}, 80%, 65%)`
            };
        } else if (p < 0.75) {
            // Žltá -> svetlozelená (50-75%)
            const t = (p - 0.5) / 0.25; // 0-1
            const hue = 60 + (30 * t); // 60° -> 90°
            return {
                bg: `hsl(${hue}, 90%, 90%)`,
                text: `hsl(${hue}, 80%, 25%)`,
                border: `hsl(${hue}, 70%, 60%)`
            };
        } else {
            // Svetlozelená -> zelená (75-100%)
            const t = (p - 0.75) / 0.25; // 0-1
            const hue = 90 + (30 * t); // 90° -> 120°
            return {
                bg: `hsl(${hue}, 85%, 88%)`,
                text: `hsl(${hue}, 80%, 25%)`,
                border: `hsl(${hue}, 70%, 55%)`
            };
        }
    } 
    // Pre dark mode
    else {
        if (p < 0.25) {
            // Tmavo červená -> tmavo oranžová
            const t = p / 0.25;
            const hue = 0 + (30 * t);
            return {
                bg: `hsl(${hue}, 70%, 20%)`,
                text: `hsl(${hue}, 90%, 85%)`,
                border: `hsl(${hue}, 70%, 35%)`
            };
        } else if (p < 0.5) {
            // Tmavo oranžová -> tmavo žltá
            const t = (p - 0.25) / 0.25;
            const hue = 30 + (30 * t);
            return {
                bg: `hsl(${hue}, 70%, 22%)`,
                text: `hsl(${hue}, 90%, 85%)`,
                border: `hsl(${hue}, 70%, 38%)`
            };
        } else if (p < 0.75) {
            // Tmavo žltá -> tmavo zelenkavá
            const t = (p - 0.5) / 0.25;
            const hue = 60 + (30 * t);
            return {
                bg: `hsl(${hue}, 65%, 20%)`,
                text: `hsl(${hue}, 85%, 85%)`,
                border: `hsl(${hue}, 65%, 35%)`
            };
        } else {
            // Tmavo zelenkavá -> tmavo zelená
            const t = (p - 0.75) / 0.25;
            const hue = 90 + (30 * t);
            return {
                bg: `hsl(${hue}, 65%, 18%)`,
                text: `hsl(${hue}, 85%, 85%)`,
                border: `hsl(${hue}, 65%, 32%)`
            };
        }
    }
}

// Export funkcií do globálneho priestoru
window.escapeHtml = escapeHtml;
window.delay = delay;
window.throttle = throttle;
window.getFormattedDateTime = getFormattedDateTime;
window.simpleHash = simpleHash;
window.downloadAsFile = downloadAsFile;
window.getConfidenceColor = getConfidenceColor; 