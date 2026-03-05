// toast.js

// Funkcia na zobrazenie toast notifikácie
function showToast(message, type = 'info', duration = 3000) {
    // Vytvoríme kontajner pre toasty, ak ešte neexistuje
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Ikony pre rôzne typy
    const icons = {
        info: 'ℹ️',
        success: '✅',
        warning: '⚠️',
        error: '❌'
    };

    // Vytvorenie toast elementu
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    
    toast.innerHTML = `
        <span class="toast-icon">${icons[type] || icons.info}</span>
        <span class="toast-content">${message}</span>
        <button class="toast-close" onclick="this.closest('.toast').classList.add('hide'); setTimeout(() => this.closest('.toast').remove(), 300);">✕</button>
    `;

    // Pridanie do kontajnera
    toastContainer.appendChild(toast);

    // Animácia zobrazenia (malý timeout, aby sa spustila CSS animácia)
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // Automatické skrytie po určenom čase
    const timeoutId = setTimeout(() => {
        if (toast && toast.parentNode) {
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast && toast.parentNode) {
                    toast.remove();
                }
            }, 300);
        }
    }, duration);

    // Umožníme zrušenie timeoutu, ak používateľ zatvorí toast manuálne
    toast.querySelector('.toast-close').addEventListener('click', () => {
        clearTimeout(timeoutId);
    });
}

// Funkcia na zobrazenie konfirmačného toastu (vracia Promise)
function showConfirmToast(message, confirmText = 'Áno', cancelText = 'Nie', duration = 8000) {
    return new Promise((resolve) => {
        // Vytvoríme kontajner pre toasty, ak ešte neexistuje
        let toastContainer = document.querySelector('.toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.className = 'toast-container';
            document.body.appendChild(toastContainer);
        }

        // Vytvorenie toast elementu
        const toast = document.createElement('div');
        toast.className = 'toast toast-confirm';
        toast.setAttribute('role', 'alertdialog');
        toast.setAttribute('aria-modal', 'true');
        
        toast.innerHTML = `
            <span class="toast-icon">⚠️</span>
            <div class="toast-content" style="flex: 1;">
                <div style="margin-bottom: 8px;">${message}</div>
                <div class="toast-actions">
                    <button class="toast-btn toast-btn-confirm">${confirmText}</button>
                    <button class="toast-btn toast-btn-cancel">${cancelText}</button>
                </div>
            </div>
            <button class="toast-close" style="align-self: flex-start;">✕</button>
        `;

        toastContainer.appendChild(toast);

        // Animácia zobrazenia
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Funkcia na zatvorenie toastu
        const closeToast = (result) => {
            toast.classList.add('hide');
            setTimeout(() => {
                if (toast && toast.parentNode) {
                    toast.remove();
                }
                resolve(result);
            }, 300);
        };

        // Event listeners pre tlačidlá
        toast.querySelector('.toast-btn-confirm').addEventListener('click', () => {
            closeToast(true);
        });

        toast.querySelector('.toast-btn-cancel').addEventListener('click', () => {
            closeToast(false);
        });

        toast.querySelector('.toast-close').addEventListener('click', () => {
            closeToast(false);
        });

        // Automatické zatvorenie po čase
        const timeoutId = setTimeout(() => {
            closeToast(false);
        }, duration);

        // Umožníme zrušenie timeoutu
        toast.querySelector('.toast-close').addEventListener('click', () => {
            clearTimeout(timeoutId);
        });
    });
}