//function/nightmode.js

document.addEventListener('DOMContentLoaded', function () {

    const darkModeToggle = document.getElementById('darkModeToggle');
    const moonIcon = document.getElementById('moonIcon');
    const darkIcon = document.getElementById('darkIcon');
    const lightIcon = document.getElementById('lightIcon');

    if (!darkModeToggle || !moonIcon || !darkIcon || !lightIcon) {
        return;
    }

    function updateToggleIcons() {
        const isDark = document.documentElement.classList.contains('dark');

        if (isDark) {
            darkIcon.classList.add('hidden');
            lightIcon.classList.remove('hidden');
        } else {
            // mesiac
            darkIcon.classList.remove('hidden');
            lightIcon.classList.add('hidden');
        }
    }

    function updateMoonVisibility() {
        const isDark = document.documentElement.classList.contains('dark');
        moonIcon.style.opacity = isDark ? '1' : '0';
    }
    

    function handleDarkModeToggle(event) {
        event.preventDefault();

        const html = document.documentElement;
        html.classList.toggle('dark');

        localStorage.setItem('darkMode', html.classList.contains('dark') ? 'enabled' : 'disabled');

        updateToggleIcons();
        updateMoonVisibility();
    }

    function initializeDarkMode() {
        const isDarkMode = localStorage.getItem('darkMode') === 'enabled';

        if (isDarkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }

        updateToggleIcons();
        updateMoonVisibility();
    }

    initializeDarkMode();
    darkModeToggle.addEventListener('click', handleDarkModeToggle);

});