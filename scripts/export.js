// ========== EXPORT ==========

let currentExportFormat = 'txt';

function updateExportButtonText() {
    const exportBtn = document.getElementById('exportBtn');
    if (!exportBtn) return;

    const t = translations[currentLanguage];
    const formatMap = { 'txt': '.txt', 'pdf': '.pdf', 'csv': '.csv', 'png': '.png' };
    const currentFormat = formatMap[currentExportFormat] || '.txt';
    exportBtn.innerHTML = `${t.export} (${currentFormat})`;
}

function exportWithFeedback() {
    const exportBtn = document.getElementById('exportBtn');
    const t = translations[currentLanguage];

    const patterns = Array.from(document.querySelectorAll('#patternsList .pattern-item'));

    if (patterns.length === 0) {
        showToast(t.noSequenceToExport || 'Žiadna sekvencia na export', 'warning');
        return;
    }

    const sequenceData = patterns.map((item, index) => {
        const patternName = item.dataset.patternName;
        const pattern = allPatternsData[patternName];
        return {
            order: index + 1,
            name: pattern.name,
            content: pattern.content,
            language: pattern.language
        };
    });

    // Export podľa zvoleného formátu
    switch (currentExportFormat) {
        case 'txt':
            exportAsTxt(sequenceData);
            break;
        case 'pdf':
            exportAsPdf(sequenceData);
            break;
        case 'csv':
            exportAsCsv(sequenceData);
            break;
        case 'png':
            exportAsPng(sequenceData);
            break;
    }

    // Vizuálna spätná väzba
    const originalText = exportBtn.innerHTML;
    exportBtn.innerHTML = `✅ ${t.exportSuccess}`;
    exportBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
    exportBtn.classList.add('bg-green-500', 'hover:bg-green-600');

    setTimeout(() => {
        exportBtn.innerHTML = originalText;
        exportBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        exportBtn.classList.add('bg-green-600', 'hover:bg-green-700');
    }, 2000);
}

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

function exportAsTxt(sequenceData) {
    const text = generateExportText(sequenceData);
    const dateTime = getFormattedDateTime();
    downloadAsFile(text, `Patterna_${dateTime}.txt`, 'text/plain');
}

function exportAsPdf(sequenceData) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Nastavenie fontu
    doc.setFont("helvetica");
    doc.setFontSize(16);
    doc.text("SEKVENCIA ORGANIZAČNÝCH VZOROV", 20, 20);

    doc.setFontSize(12);
    doc.text(`Generované: ${new Date().toLocaleDateString('sk-SK')} ${new Date().toLocaleTimeString('sk-SK')}`, 20, 30);

    let y = 40;
    sequenceData.forEach((item, index) => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.text(`${index + 1}. ${item.name}`, 20, y);

        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.text(`Jazyk: ${item.language.replace(/_/g, ' ')}`, 25, y + 5);

        // Skrátený obsah
        const contentPreview = item.content.substring(0, 150) + '...';
        const lines = doc.splitTextToSize(contentPreview, 170);
        doc.text(lines, 25, y + 10);

        y += 20 + (lines.length * 5);
    });

    const dateTime = getFormattedDateTime();
    doc.save(`Patterna_${dateTime}.pdf`);
}

function exportAsCsv(sequenceData) {
    let csv = 'Order,Name,Language,Content Preview\n';
    sequenceData.forEach(item => {
        const contentPreview = item.content.substring(0, 100).replace(/,/g, ';').replace(/\n/g, ' ');
        csv += `${item.order},"${item.name}","${item.language.replace(/_/g, ' ')}","${contentPreview}..."\n`;
    });

    const dateTime = getFormattedDateTime();
    downloadAsFile(csv, `Patterna_${dateTime}.csv`, 'text/csv');
}

function exportAsPng(sequenceData) {
    // Vytvoríme dočasný kontajner pre kreslenie
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.backgroundColor = '#ffffff';
    container.style.padding = '30px';
    container.style.borderRadius = '12px';
    container.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    document.body.appendChild(container);

    // Pridáme nadpis
    const title = document.createElement('h2');
    title.textContent = 'Sekvencia organizačných vzorov';
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.marginBottom = '20px';
    title.style.color = '#1f2937';
    container.appendChild(title);

    // Pridáme dátum
    const date = document.createElement('p');
    date.textContent = `Generované: ${new Date().toLocaleDateString('sk-SK')} ${new Date().toLocaleTimeString('sk-SK')}`;
    date.style.fontSize = '12px';
    date.style.color = '#6b7280';
    date.style.marginBottom = '20px';
    container.appendChild(date);

    // Vytvoríme kontajner pre vzory
    const sequenceContainer = document.createElement('div');
    sequenceContainer.style.display = 'flex';
    sequenceContainer.style.alignItems = 'center';
    sequenceContainer.style.justifyContent = 'center';
    sequenceContainer.style.flexWrap = 'wrap';
    sequenceContainer.style.gap = '15px';
    container.appendChild(sequenceContainer);

    // Prejdeme všetky vzory
    sequenceData.forEach((item, index) => {
        // Box pre vzor
        const patternBox = document.createElement('div');
        patternBox.style.backgroundColor = '#f8fafc';
        patternBox.style.border = '2px solid #e5e7eb';
        patternBox.style.borderRadius = '8px';
        patternBox.style.padding = '15px';
        patternBox.style.minWidth = '200px';
        patternBox.style.maxWidth = '250px';
        patternBox.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';

        // Poradie
        const order = document.createElement('div');
        order.textContent = `#${item.order}`;
        order.style.fontSize = '14px';
        order.style.fontWeight = 'bold';
        order.style.color = '#4f46e5';
        order.style.marginBottom = '8px';
        patternBox.appendChild(order);

        // Názov
        const name = document.createElement('div');
        name.textContent = item.name;
        name.style.fontSize = '16px';
        name.style.fontWeight = '600';
        name.style.color = '#1f2937';
        name.style.marginBottom = '8px';
        patternBox.appendChild(name);

        // Jazyk
        const lang = document.createElement('div');
        lang.textContent = `Jazyk: ${item.language.replace(/_/g, ' ')}`;
        lang.style.fontSize = '12px';
        lang.style.color = '#6b7280';
        patternBox.appendChild(lang);

        sequenceContainer.appendChild(patternBox);

        // Pridáme šípku (ak nie je posledný)
        if (index < sequenceData.length - 1) {
            const arrow = document.createElement('div');
            arrow.innerHTML = '→';
            arrow.style.fontSize = '32px';
            arrow.style.fontWeight = 'bold';
            arrow.style.color = '#4f46e5';
            arrow.style.margin = '0 10px';
            sequenceContainer.appendChild(arrow);
        }
    });

    // Pridáme footer s logom
    const footer = document.createElement('div');
    footer.style.marginTop = '20px';
    footer.style.display = 'flex';
    footer.style.alignItems = 'center';
    footer.style.justifyContent = 'center';
    footer.style.gap = '6px';

    // Pridáme text "vygenerované pomocou"
    const footerText = document.createElement('span');
    footerText.textContent = 'vygenerované pomocou';
    footerText.style.fontSize = '11px';
    footerText.style.color = '#9ca3af';
    footerText.style.lineHeight = '1';  // Pridáme pre lepšiu kontrolu

    // Pridáme logo - MANUÁLNE POSUNUTÉ NADOL
    const logo = document.createElement('img');
    logo.src = 'assets/images/logo.png';
    logo.alt = 'Patterna Logo';
    logo.style.height = '18px';  // Trochu väčšie
    logo.style.width = 'auto';
    logo.style.opacity = '0.7';
    logo.style.display = 'block';  // Ako blok pre lepšiu kontrolu
    logo.style.marginTop = '6px';  // POSUN NADOL
    logo.style.transform = 'translateY(2px)';  // Ďalšie posunutie (voliteľné)

    footer.appendChild(footerText);
    footer.appendChild(logo);
    container.appendChild(footer);

    // Počkáme na renderovanie
    setTimeout(() => {
        html2canvas(container, {
            scale: 2, // Vyššia kvalita
            backgroundColor: '#ffffff',
            logging: false,
            allowTaint: false,
            useCORS: true
        }).then(canvas => {
            // Konvertujeme na blob a stiahneme
            canvas.toBlob(blob => {
                const dateTime = getFormattedDateTime();
                downloadAsFile(blob, `Patterna_${dateTime}.png`, 'image/png');
                
                // Odstránime dočasný kontajner
                document.body.removeChild(container);
            }, 'image/png', 1.0);
        }).catch(error => {
            console.error('Chyba pri generovaní PNG:', error);
            showToast('Nepodarilo sa vygenerovať PNG obrázok', 'error');
            document.body.removeChild(container);
        });
    }, 100);
}

function downloadAsFile(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

function generateExportText(sequenceData) {
    const t = translations[currentLanguage];
    let text = 'SEKVENCIA ORGANIZAČNÝCH VZOROV\n';
    text += 'Generované pomocou Patterna\n';
    text += `Dátum: ${new Date().toLocaleDateString('sk-SK')}\n\n`;

    sequenceData.forEach(item => {
        text += `${item.order}. ${item.name}\n`;
        text += `   Jazyk: ${item.language.replace(/_/g, ' ')}\n`;
        text += `   Obsah: ${item.content.substring(0, 200)}...\n\n`;
    });

    return text;
}

function initExportDropdown() {
    window.exportDropdownInitialized = true;
    const exportBtn = document.getElementById('exportBtn');
    const dropdownBtn = document.getElementById('exportDropdownBtn');
    const dropdown = document.getElementById('exportDropdown');
    const options = document.querySelectorAll('.export-option');

    // Nastavíme počiatočný text tlačidla
    updateExportButtonText();

    // Toggle dropdown
    dropdownBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdown.classList.toggle('hidden');
    });

    // Výber formátu
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            currentExportFormat = option.dataset.format;
            updateExportButtonText(); // Aktualizujeme text pri zmene formátu
            dropdown.classList.add('hidden');
        });
    });

    // Zatvorenie dropdownu pri kliknutí mimo
    document.addEventListener('click', (e) => {
        if (!exportBtn.contains(e.target) && !dropdownBtn.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.classList.add('hidden');
        }
    });

    exportBtn.addEventListener('click', exportWithFeedback);   
}