//header.js

// ========== HEADER SCROLL EFFECT ==========

const nav = document.getElementById('mainNav');
const SCROLL_THRESHOLD = 100;

function updateHeaderOnScroll() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > SCROLL_THRESHOLD) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

}

document.addEventListener('DOMContentLoaded', () => {
    updateHeaderOnScroll();

    window.addEventListener('scroll', throttle(updateHeaderOnScroll, 10));
});

window.addEventListener('resize', updateHeaderOnScroll);


// ========== BACK TO TOP BUTTON ==========

document.addEventListener('DOMContentLoaded', function () {
    const backToTopBtn = document.getElementById('backToTopBtn');

    if (!backToTopBtn) return;

    // Show/hide button based on scroll position
    function toggleBackToTopButton() {
        const scrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;

        // Show button when scrolled down more than 300px
        if (scrollY > 300) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    }

    // Scroll to top smoothly
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Add scroll event listener
    window.addEventListener('scroll', throttle(toggleBackToTopButton, 100));

    // Add click event listener
    backToTopBtn.addEventListener('click', scrollToTop);

    // Check initial scroll position
    toggleBackToTopButton();

    // Also check on page load (in case page loads scrolled down)
    setTimeout(toggleBackToTopButton, 100);
});

