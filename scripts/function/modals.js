//function/modals.js

// ===== ZÁKLADNÉ PREMENNÉ =====
let draggedModal = null;
let dragOffsetX = 0, dragOffsetY = 0;
let isDragging = false;

// Zoznam všetkých modalov s ich ID a príslušnými tlačidlami na otvorenie
const MODALS = [
    { id: 'aboutModal', openButtons: ['aboutLink'] },
    { id: 'faqModal', openButtons: ['faqLink'] },
    { id: 'termsModal', openButtons: ['Termslink'] },
    { id: 'catalogModal', openButtons: ['loadCatalogBtn'] },
    { id: 'stopWordsModal', openButtons: [] },          // otvára sa programovo
    { id: 'patternDetailModal', openButtons: [] },
    { id: 'aiExplanationModal', openButtons: [] },
    { id: 'whatsNewModal', openButtons: [] },
    { id: 'explanationModal', openButtons: [] },        // otvára sa programovo
    { id: 'feedbackModal', openButtons: ['openFeedbackBtn'] }  // NOVÝ FEEDBACK MODAL
];

// ===== INICIALIZÁCIA =====
document.addEventListener('DOMContentLoaded', () => {
    initAllModals();
    initDraggableModals();
    initAccordions();
    initEscapeHandler();
    initFooterLinks(); 
    initDropdowns(); 
    initFeedbackModal(); // NOVÁ INICIALIZÁCIA PRE FEEDBACK MODAL
});

function initFeedbackModal() {
    const feedbackModal = document.getElementById('feedbackModal');
    const openFeedbackBtn = document.getElementById('openFeedbackBtn');
    const openFeedbackBtnFooter = document.getElementById('openFeedbackBtnFooter'); // NOVÉ
    const closeFeedbackModal = document.getElementById('closeFeedbackModal');

    // Otvorenie cez tlačidlo v kontaktoch
    if (openFeedbackBtn) {
        openFeedbackBtn.addEventListener('click', () => {
            if (feedbackModal) {
                feedbackModal.classList.remove('hidden');
            }
        });
    }

    // Otvorenie cez tlačidlo v sekcii "Zdrojový kód & Spätná väzba"
    if (openFeedbackBtnFooter) {
        openFeedbackBtnFooter.addEventListener('click', () => {
            if (feedbackModal) {
                feedbackModal.classList.remove('hidden');
            }
        });
    }

    // Zatvorenie cez krížik
    if (closeFeedbackModal) {
        closeFeedbackModal.addEventListener('click', () => {
            if (feedbackModal) {
                feedbackModal.classList.add('hidden');
            }
        });
    }

    // Zatvorenie kliknutím na pozadie (overlay)
    if (feedbackModal) {
        feedbackModal.addEventListener('click', (e) => {
            if (e.target === feedbackModal) {
                feedbackModal.classList.add('hidden');
            }
        });
    }
}

// ===== NOVÁ FUNKCIA PRE FOOTER LINKY (DELEGOVANIE) =====
function initFooterLinks() {
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Terms link
        if (target.closest && target.closest('#Termslink')) {
            e.preventDefault();
            openModal('termsModal');
            return;
        }

        // About link
        if (target.closest && target.closest('#aboutLink')) {
            e.preventDefault();
            openModal('aboutModal');
            return;
        }

        // FAQ link
        if (target.closest && target.closest('#faqLink')) {
            e.preventDefault();
            openModal('faqModal');
            return;
        }

        // Docs link (open new tab)
        if (target.closest && target.closest('#docsLink')) {
            e.preventDefault();
            window.open('https://www.overleaf.com/read/qpbxyxxpdssq#3a8fbc', '_blank');
            return;
        }
    });
}

// ===== HLAVNÁ FUNKCIA NA INICIALIZÁCIU MODALOV =====
function initAllModals() {
    MODALS.forEach(modalConfig => {
        const modal = document.getElementById(modalConfig.id);
        if (!modal) return;

        // Tlačidlá na zatvorenie (close button v modale)
        const closeBtn = modal.querySelector('[id^="close"]');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => closeModal(modalConfig.id));
        }

        // Kliknutie na pozadie (overlay) zatvorí modal
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modalConfig.id);
            }
        });
    });

    // Špeciálne pre catalogModal – tlačidlo Zrušiť
    const cancelCatalog = document.getElementById('cancelCatalog');
    if (cancelCatalog) {
        cancelCatalog.addEventListener('click', () => closeModal('catalogModal'));
    }
}

// ===== OTVORENIE MODALU =====
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.classList.remove('hidden');
    
    if (modalId === 'patternDetailModal') {
        resetPatternDetailFilters();
    }
}

// ===== ZATVORENIE MODALU S RESETOM POZÍCIE =====
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    resetModalPosition(modalId);
    modal.classList.add('hidden');
}

// ===== ZATVORENIE VŠETKÝCH MODALOV =====
function closeAllModals() {
    MODALS.forEach(modalConfig => {
        const modal = document.getElementById(modalConfig.id);
        if (modal && !modal.classList.contains('hidden')) {
            resetModalPosition(modalConfig.id);
            modal.classList.add('hidden');
        }
    });

    const examplesMenu = document.getElementById('examplesMenu');
    if (examplesMenu) examplesMenu.classList.add('hidden');

    const exportDropdown = document.getElementById('exportDropdown');
    if (exportDropdown) exportDropdown.classList.add('hidden');
}

// ===== RESET POZÍCIE MODALU DO STREDU =====
function resetModalPosition(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    const modalContent = modal.querySelector('.bg-white, .dark\\:bg-gray-800');
    if (modalContent) {
        modalContent.style.position = '';
        modalContent.style.left = '';
        modalContent.style.top = '';
        modalContent.style.margin = '';
    }
}

// ===== ŤAHANIE MODALOV =====
function initDraggableModals() {
    MODALS.forEach(modalConfig => {
        const modal = document.getElementById(modalConfig.id);
        if (!modal) return;

        const modalContent = modal.querySelector('.bg-white, .dark\\:bg-gray-800');
        if (!modalContent) return;

        const header = modal.querySelector('.p-6')?.firstElementChild;
        if (!header) return;

        header.classList.add('draggable-handle', 'cursor-grab', 'select-none');
        
        if (!header.querySelector('button') && !header.querySelector('.cursor-help')) {
            const dragIndicator = document.createElement('span');
            dragIndicator.className = 'drag-indicator text-gray-400 dark:text-gray-500 mr-2 text-sm select-none';
            dragIndicator.innerHTML = '⋮⋮';
            dragIndicator.title = 'Ťahaním presuniete modal';
            header.insertBefore(dragIndicator, header.firstChild);
        }

        header.addEventListener('mousedown', (e) => startDrag(e, modalContent));
    });

    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', stopDrag);
}

function startDrag(e, modalContent) {
    if (e.button !== 0) return;

    e.preventDefault();

    modalContent.style.position = 'fixed';
    modalContent.style.margin = '0';
    modalContent.style.transition = 'none';
    modalContent.setAttribute('dragging', 'true');

    const rect = modalContent.getBoundingClientRect();
    
    draggedModal = modalContent;
    dragOffsetX = e.clientX - rect.left;
    dragOffsetY = e.clientY - rect.top;
    isDragging = true;

    modalContent.style.cursor = 'grabbing';
}

function drag(e) {
    if (!isDragging || !draggedModal) return;

    e.preventDefault();

    let newLeft = e.clientX - dragOffsetX;
    let newTop = e.clientY - dragOffsetY;

    const modalWidth = draggedModal.offsetWidth;
    const modalHeight = draggedModal.offsetHeight;
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    newLeft = Math.max(10, Math.min(windowWidth - modalWidth - 10, newLeft));
    newTop = Math.max(10, Math.min(windowHeight - modalHeight - 10, newTop));

    draggedModal.style.left = newLeft + 'px';
    draggedModal.style.top = newTop + 'px';
}

function stopDrag() {
    if (!isDragging || !draggedModal) return;

    isDragging = false;
    draggedModal.style.cursor = '';
    draggedModal.style.transition = '';
    draggedModal.removeAttribute('dragging');
    draggedModal = null;
}

// ===== ACCORDION PRE FAQ A TERMS =====
function initAccordions() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            if (!answer) return;

            const isHidden = answer.classList.contains('hidden');

            document.querySelectorAll('.faq-answer').forEach(ans => {
                ans.classList.add('hidden');
            });
            document.querySelectorAll('.faq-question svg').forEach(svg => {
                svg.style.transform = 'rotate(0deg)';
            });

            if (isHidden) {
                answer.classList.remove('hidden');
                const svg = question.querySelector('svg');
                if (svg) svg.style.transform = 'rotate(180deg)';
            }
        });
    });

    document.querySelectorAll('.terms-question').forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            if (!answer) return;

            const isHidden = answer.classList.contains('hidden');

            document.querySelectorAll('.terms-answer').forEach(ans => {
                ans.classList.add('hidden');
            });
            document.querySelectorAll('.terms-question svg').forEach(svg => {
                svg.style.transform = 'rotate(0deg)';
            });

            if (isHidden) {
                answer.classList.remove('hidden');
                const svg = question.querySelector('svg');
                if (svg) svg.style.transform = 'rotate(180deg)';
            }
        });
    });
}

// ===== ESCAPE KLÁVESA =====
function initEscapeHandler() {
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });
}

// ===== ŠPECIFICKÉ PRE patternDetailModal =====
function resetPatternDetailFilters() {
    const filterAllBtn = document.getElementById('filterAllPatternsBtn');
    const filterSeqBtn = document.getElementById('filterSequenceBtn');
    
    if (filterAllBtn && filterSeqBtn) {
        filterAllBtn.className = 'px-3 py-1 text-xs rounded-full bg-indigo-600 text-white font-medium transition-all duration-200';
        filterSeqBtn.className = 'px-3 py-1 text-xs rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 font-medium transition-all duration-200';
    }
}

// ===== EXPORT FUNKCIÍ PRE INÉ SKRIPTY =====
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;

// ===== DROPDOWN MANAGER =====
const DROPDOWNS = [
    { id: 'examplesMenu', toggleId: 'examplesToggle' },
    { id: 'exportDropdown', toggleId: 'exportDropdownBtn' },
    { id: 'languageMenu', toggleId: 'languageToggle' }
];

function initDropdowns() {
    // Inicializácia toggle tlačidiel
    DROPDOWNS.forEach(dropdown => {
        const toggle = document.getElementById(dropdown.toggleId);
        const menu = document.getElementById(dropdown.id);
        
        if (toggle && menu) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('hidden');
            });
        }
    });

    // Globálny klik pre zatvorenie všetkých dropdownov
    document.addEventListener('click', (e) => {
        DROPDOWNS.forEach(dropdown => {
            const menu = document.getElementById(dropdown.id);
            const toggle = document.getElementById(dropdown.toggleId);
            
            if (menu && !menu.classList.contains('hidden')) {
                // Ak klik nebol na toggle a nebol v menu, zatvoríme
                if (!toggle?.contains(e.target) && !menu.contains(e.target)) {
                    menu.classList.add('hidden');
                }
            }
        });
    });
}