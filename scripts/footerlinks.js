// footerlinks.js 

document.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('click', (e) => {
        const target = e.target;

        // Terms link
        if (target.closest && target.closest('#Termslink')) {
            e.preventDefault();
            document.getElementById('termsModal')?.classList.remove('hidden');
            return;
        }

        // About link
        if (target.closest && target.closest('#aboutLink')) {
            e.preventDefault();
            document.getElementById('aboutModal')?.classList.remove('hidden');
            return;
        }

        // FAQ link
        if (target.closest && target.closest('#faqLink')) {
            e.preventDefault();
            document.getElementById('faqModal')?.classList.remove('hidden');
            return;
        }

        // Docs link (open new tab)
        if (target.closest && target.closest('#docsLink')) {
            e.preventDefault();
            window.open('https://www.overleaf.com/read/jtkqhqtqjpty#72eff1', '_blank');
            return;
        }
    });

    const safeAttach = (id, fn) => {
        const el = document.getElementById(id);
        if (!el) {
            // neprekričujeme, len log pre debug
            return;
        }
        el.addEventListener('click', fn);
    };

    // Close modal buttons
    safeAttach('closeAboutModal', () => document.getElementById('aboutModal')?.classList.add('hidden'));
    safeAttach('closeFaqModal', () => document.getElementById('faqModal')?.classList.add('hidden'));
    safeAttach('closeTermsModal', () => document.getElementById('termsModal')?.classList.add('hidden'));
    safeAttach('closeCatalogModal', () => document.getElementById('catalogModal')?.classList.add('hidden'));

    ['aboutModal', 'faqModal', 'termsModal', 'catalogModal'].forEach(modalId => {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        modal.addEventListener('click', (e) => {
            if (e.target && e.target.id === modalId) {
                modal.classList.add('hidden');
            }
        });
    });

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
            } else {
                answer.classList.add('hidden');
                const svg = question.querySelector('svg');
                if (svg) svg.style.transform = 'rotate(0deg)';
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
            } else {
                answer.classList.add('hidden');
                const svg = question.querySelector('svg');
                if (svg) svg.style.transform = 'rotate(0deg)';
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    function closeAllModals() {
        const modals = ['aboutModal', 'faqModal', 'termsModal', 'catalogModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (modal && !modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        });

        const examplesMenu = document.getElementById('examplesMenu');
        if (examplesMenu && !examplesMenu.classList.contains('hidden')) {
            examplesMenu.classList.add('hidden');
        }
    }
});
