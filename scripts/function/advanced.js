// Inicializácia reset tlačidiel pre advanced modal
let advancedResetInitialized = false;

function updateResetButtonsVisibility() {
    const t = translations[currentLanguage];
    const params = [
        { id: 'gammaInput', defaultVal: 0.9, label: 'γ' },
        { id: 'goalRewardInput', defaultVal: 10, label: 'R(g)' },
        { id: 'otherRewardInput', defaultVal: 1, label: 'R(o)' },
        { id: 'epsilonInput', defaultVal: 0.1, label: 'ε' }
    ];
    params.forEach(param => {
        const input = document.getElementById(param.id);
        const btn = document.getElementById(`reset${param.id.charAt(0).toUpperCase() + param.id.slice(1)}Btn`);
        if (input && btn) {
            const current = parseFloat(input.value);
            const def = parseFloat(input.getAttribute('data-default-val') || param.defaultVal);
            // Nastavenie tooltipu
            const tooltipTemplate = t.resetToDefaultTooltip || 'Reset to default value ({value})';
            btn.title = tooltipTemplate.replace('{value}', param.defaultVal);
            
            if (Math.abs(current - def) < 0.000001) {
                btn.classList.add('invisible', 'opacity-0');
                btn.classList.remove('visible', 'opacity-100');
            } else {
                btn.classList.remove('invisible', 'opacity-0');
                btn.classList.add('visible', 'opacity-100');
            }
        }
    });
}

function initAdvancedModalResets() {
    if (advancedResetInitialized) {
        updateResetButtonsVisibility();
        return;
    }
    const params = [
        { id: 'gammaInput', defaultVal: 0.9 },
        { id: 'goalRewardInput', defaultVal: 10 },
        { id: 'otherRewardInput', defaultVal: 1 },
        { id: 'epsilonInput', defaultVal: 0.1 }
    ];
    params.forEach(param => {
        const input = document.getElementById(param.id);
        const btn = document.getElementById(`reset${param.id.charAt(0).toUpperCase() + param.id.slice(1)}Btn`);
        if (!input || !btn) return;
        // Uložíme default hodnotu do data atribútu
        input.setAttribute('data-default-val', param.defaultVal);
        // Sledovanie zmien
        input.addEventListener('input', () => updateResetButtonsVisibility());
        input.addEventListener('change', () => updateResetButtonsVisibility());
        // Reset tlačidlo
        btn.addEventListener('click', () => {
            input.value = param.defaultVal;
            input.dispatchEvent(new Event('input'));
            updateResetButtonsVisibility();
        });
    });
    advancedResetInitialized = true;
    updateResetButtonsVisibility();
}

// Pri otvorení advanced modalu aktualizujeme viditeľnosť tlačidiel
const advancedModal = document.getElementById('advancedModal');
if (advancedModal) {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (!advancedModal.classList.contains('hidden')) {
                    updateResetButtonsVisibility();
                }
            }
        });
    });
    observer.observe(advancedModal, { attributes: true });
}

// Inicializácia po načítaní DOM
document.addEventListener('DOMContentLoaded', () => {
    initAdvancedModalResets();
});