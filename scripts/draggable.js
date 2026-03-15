// draggable.js - Pridáva možnosť ťahania pre všetky modaly

// Inicializácia ťahania pre všetky modaly
function initDraggableModals() {
    const modals = [
        'aboutModal',
        'faqModal', 
        'termsModal',
        'catalogModal',
        'stopWordsModal',
        'patternDetailModal',
        'aiExplanationModal',
        'whatsNewModal'
    ];
    
    modals.forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        makeModalDraggable(modal);
    });
}

// Funkcia pre jeden modal
function makeModalDraggable(modal) {
    // Nájdeme header - prvý div s paddingom
    const header = modal.querySelector('.p-6')?.firstElementChild;
    if (!header) return;
    
    // Nájdeme vnútorný kontajner (ten biely)
    const modalContent = modal.querySelector('.bg-white, .dark\\:bg-gray-800');
    if (!modalContent) return;
    
    // PRIDANÉ: Pridáme vizuálnu indikáciu, že header je ťahací
    header.classList.add('draggable-handle');
    
    // PRIDANÉ: Pridáme indikátor (malú ikonku) ak nie je v headeri tlačidlo close
    if (!header.querySelector('button') && !header.querySelector('.cursor-help')) {
        const dragIndicator = document.createElement('span');
        dragIndicator.className = 'text-gray-400 dark:text-gray-500 mr-2 text-sm select-none';
        dragIndicator.innerHTML = '⋮⋮';
        dragIndicator.title = 'Ťahaním presuniete modal';
        
        // Vložíme na začiatok headeru
        header.insertBefore(dragIndicator, header.firstChild);
    }
    
    // Resetujeme pôvodné štýly pri každom otvorení
    modalContent.style.position = '';
    modalContent.style.left = '';
    modalContent.style.top = '';
    modalContent.style.margin = '';
    modalContent.style.transition = '';
    
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    // Udalosti myši
    header.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
    
    function startDrag(e) {
        // Iba ľavé tlačidlo myši
        if (e.button !== 0) return;
        
        e.preventDefault();
        
        // Prepneme na absolute pozicionovanie
        modalContent.style.position = 'fixed';
        modalContent.style.margin = '0';
        modalContent.style.transition = 'none';
        
        // PRIDANÉ: Označíme že sa ťahá (pre CSS)
        modalContent.setAttribute('dragging', 'true');
        
        // Získame aktuálnu pozíciu
        const rect = modalContent.getBoundingClientRect();
        startLeft = rect.left;
        startTop = rect.top;
        
        startX = e.clientX;
        startY = e.clientY;
        
        isDragging = true;
        
        // Zmeníme kurzor
        header.style.cursor = 'grabbing';
        modalContent.style.cursor = 'grabbing';
    }
    
    function drag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        
        // Výpočet nových súradníc
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        let newLeft = startLeft + dx;
        let newTop = startTop + dy;
        
        // Obmedzenia aby modal nevyšiel z obrazovky
        const modalWidth = modalContent.offsetWidth;
        const modalHeight = modalContent.offsetHeight;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;
        
        newLeft = Math.max(10, Math.min(windowWidth - modalWidth - 10, newLeft));
        newTop = Math.max(10, Math.min(windowHeight - modalHeight - 10, newTop));
        
        // Aplikujeme novú pozíciu
        modalContent.style.left = newLeft + 'px';
        modalContent.style.top = newTop + 'px';
    }
    
    function stopDrag() {
        if (!isDragging) return;
        
        isDragging = false;
        header.style.cursor = '';
        modalContent.style.cursor = '';
        modalContent.style.transition = '';
        
        // PRIDANÉ: Odstránime označenie ťahania
        modalContent.removeAttribute('dragging');
    }
}

// Inicializácia po načítaní DOM
document.addEventListener('DOMContentLoaded', initDraggableModals);

// ZMENENÉ: Resetujeme pozíciu PRI ZATVÁRANÍ, nie pri otváraní
function resetModalPositionOnClose(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    const modalContent = modal.querySelector('.bg-white, .dark\\:bg-gray-800');
    if (!modalContent) return;
    
    // Resetujeme štýly - toto sa stane ešte predtým, než modal zmizne
    modalContent.style.position = '';
    modalContent.style.left = '';
    modalContent.style.top = '';
    modalContent.style.margin = '';
    
    // PRIDANÉ: Znovu pridáme drag indikátor
    const header = modal.querySelector('.p-6')?.firstElementChild;
    if (header && !header.querySelector('.drag-indicator') && !header.querySelector('button') && !header.querySelector('.cursor-help')) {
        const dragIndicator = document.createElement('span');
        dragIndicator.className = 'drag-indicator text-gray-400 dark:text-gray-500 mr-2 text-sm select-none';
        dragIndicator.innerHTML = '⋮⋮';
        dragIndicator.title = 'Ťahaním presuniete modal';
        header.insertBefore(dragIndicator, header.firstChild);
    }
}

// Hook na zatváranie modalov - pridáme do existujúcich event listenerov
function setupCloseHandlers() {
    // Tlačidlá close
    document.getElementById('closeAboutModal')?.addEventListener('click', () => {
        resetModalPositionOnClose('aboutModal');
    });
    
    document.getElementById('closeFaqModal')?.addEventListener('click', () => {
        resetModalPositionOnClose('faqModal');
    });
    
    document.getElementById('closeTermsModal')?.addEventListener('click', () => {
        resetModalPositionOnClose('termsModal');
    });
    
    document.getElementById('closeCatalogModal')?.addEventListener('click', () => {
        resetModalPositionOnClose('catalogModal');
    });
    
    document.getElementById('closeStopWordsModal')?.addEventListener('click', () => {
        resetModalPositionOnClose('stopWordsModal');
    });
    
    document.getElementById('closePatternDetailModal')?.addEventListener('click', () => {
        resetModalPositionOnClose('patternDetailModal');
    });
    
    document.getElementById('closeAiExplanationModal')?.addEventListener('click', () => {
        resetModalPositionOnClose('aiExplanationModal');
    });
    
    document.getElementById('closeWhatsNewModal')?.addEventListener('click', () => {
        resetModalPositionOnClose('whatsNewModal');
    });
    
    // Kliknutie mimo modal
    ['aboutModal', 'faqModal', 'termsModal', 'catalogModal', 'stopWordsModal', 'patternDetailModal', 'aiExplanationModal', 'whatsNewModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                resetModalPositionOnClose(modalId);
            }
        });
    });
    
    // ESC klávesa (už je vo footerlinks.js, ale pridáme aj sem pre istotu)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modals = ['aboutModal', 'faqModal', 'termsModal', 'catalogModal', 'stopWordsModal', 'patternDetailModal', 'aiExplanationModal', 'whatsNewModal'];
            modals.forEach(modalId => {
                const modal = document.getElementById(modalId);
                if (modal && !modal.classList.contains('hidden')) {
                    resetModalPositionOnClose(modalId);
                }
            });
        }
    });
}

// Spustíme po načítaní DOM
document.addEventListener('DOMContentLoaded', () => {
    initDraggableModals();
    setupCloseHandlers();
});

// Znovu inicializujeme pri zmene jazyka
document.addEventListener('languageChanged', () => {
    setTimeout(initDraggableModals, 100);
    setTimeout(setupCloseHandlers, 100);
});