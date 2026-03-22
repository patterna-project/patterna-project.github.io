//export.js

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
    logo.style.height = '18px'; 
    logo.style.width = 'auto';
    logo.style.opacity = '0.7';
    logo.style.display = 'block';  // Ako blok pre lepšiu kontrolu
    logo.style.marginTop = '6px'; 
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
    const options = document.querySelectorAll('.export-option');

    // Nastavíme počiatočný text tlačidla
    updateExportButtonText();

    // Výber formátu - toto ponechaj
    options.forEach(option => {
        option.addEventListener('click', (e) => {
            e.stopPropagation();
            currentExportFormat = option.dataset.format;
            updateExportButtonText();
            
            // Dropdown sa zatvorí automaticky cez modals.js, ale pre istotu:
            const dropdown = document.getElementById('exportDropdown');
            if (dropdown) dropdown.classList.add('hidden');
        });
    });

    exportBtn.addEventListener('click', exportWithFeedback);   
}




// ========== EXPORT PRO FUNCTIONS ==========

/**
 * Export PRO - vytvorí ZIP archív so všetkými detailmi o sekvencii
 * - Textové súbory všetkých vzorov v sekvencii
 * - JSON so všetkými metadátami (parametre, kroky MDP, matica, atď.)
 * - README.txt s popisom
 */
async function exportPro() {
    const patterns = Array.from(document.querySelectorAll('#patternsList .pattern-item'));
    
    if (patterns.length === 0) {
        showToast(translations[currentLanguage]?.noSequenceToExport || 'Žiadna sekvencia na export', 'warning');
        return;
    }
    
    try {
        // 1. Zozbierame všetky potrebné dáta
        const sequenceData = patterns.map((item, index) => {
            const patternName = item.dataset.patternName;
            const pattern = allPatternsData[patternName];
            return {
                order: index + 1,
                name: pattern.name,
                filename: pattern.filename,
                content: pattern.content,
                language: pattern.language,
                catalog: pattern.catalogName || 'C & H'
            };
        });
        
        // 2. Parametre generovania
        const params = {
            gamma: parseFloat(document.getElementById('gammaInput').value) || 0.9,
            goalReward: parseFloat(document.getElementById('goalRewardInput').value) || 10.0,
            otherReward: parseFloat(document.getElementById('otherRewardInput').value) || 1.0,
            epsilon: parseFloat(document.getElementById('epsilonInput').value) || 0.1,
            useIDF: document.getElementById('idfCheckbox')?.checked || false,
            useSentiment: document.getElementById('sentimentCheckbox')?.checked || false,
            forcedStartPattern: forcedStartPattern || null,
            timestamp: new Date().toISOString()
        };

        // 3. Matica podobností (ak existuje)
        let similarityMatrix = {};
        if (window.originalSimilarityMatrix && Object.keys(window.originalSimilarityMatrix).length > 0) {
            similarityMatrix = window.originalSimilarityMatrix;
        }

        // 4. MDP výsledky (ak existujú)
        let mdpResults = null;
        if (window.lastMDPResult) {
            mdpResults = {
                goalState: window.lastMDPResult.goalState,
                steps: window.lastMDPResult.steps,
                utilities: window.lastMDPResult.utilities,
                policy: window.lastMDPResult.policy
            };
        }

        // 5. Sentiment skóre (ak existuje)
        let sentimentScores = null;
        if (window.sentimentScores && Object.keys(window.sentimentScores).length > 0) {
            sentimentScores = window.sentimentScores;
        }

        // 6. Vytvoríme metadata.json
        const metadata = {
            sequence: sequenceData.map(p => ({
                order: p.order,
                name: p.name,
                filename: p.filename,
                language: p.language,
                catalog: p.catalog
            })),
            parameters: params,
            statistics: calculateSequenceStatistics(sequenceData, similarityMatrix),
            similarityMatrix: similarityMatrix,
            mdpResults: mdpResults,
            sentimentScores: sentimentScores,
            exportDate: new Date().toISOString(),
            version: '1.0.3'
        };

        // 7. Vytvoríme obsah README.txt
        const readmeContent = generateProReadme(sequenceData, params, metadata.statistics);

        // 8. Vytvoríme ZIP archív pomocou JSZip (treba pridať knižnicu)
        // Skontrolujeme, či je JSZip dostupný, ak nie, dynamicky ho načítame
        if (typeof JSZip === 'undefined') {
            await loadJSZip();
        }

        const zip = new JSZip();

        // Pridáme README
        zip.file("README.txt", readmeContent);

        // Pridáme metadata.json
        zip.file("metadata.json", JSON.stringify(metadata, null, 2));

        zip.file("snapshot.html", generateSnapshotHTML(sequenceData, params, similarityMatrix, mdpResults));

        // Pridáme priečinok so vzormi
        const patternsFolder = zip.folder("patterns");
        sequenceData.forEach(pattern => {
            patternsFolder.file(pattern.filename, pattern.content);
        });

        // Pridáme priečinok s výstupmi (pre prehľadnosť)
        const outputsFolder = zip.folder("outputs");
        
        // Export sekvencie ako TXT
        outputsFolder.file("sequence.txt", generateExportText(sequenceData));
        
        // Export matice ako CSV
        if (Object.keys(similarityMatrix).length > 0) {
            outputsFolder.file("similarity_matrix.csv", generateMatrixCSV(sequenceData, similarityMatrix));
        }
        
        // Export MDP krokov ako TXT (ak existujú)
        if (mdpResults) {
            outputsFolder.file("mdp_steps.txt", generateMDPStepsText(mdpResults, sequenceData));
        }

        // 9. Vygenerujeme ZIP a stiahneme
        const zipContent = await zip.generateAsync({ 
            type: "blob",
            compression: "DEFLATE",
            compressionOptions: { level: 6 }
        });

        const dateTime = getFormattedDateTime();
        downloadAsFile(zipContent, `Patterna_PRO_${dateTime}.zip`, 'application/zip');

        showToast('PRO export bol úspešne vytvorený', 'success');

    } catch (error) {
        console.error('Chyba pri PRO exporte:', error);
        showToast('Chyba pri vytváraní PRO exportu: ' + error.message, 'error');
    }
}

/**
 * Načíta JSZip knižnicu dynamicky, ak nie je dostupná
 */
function loadJSZip() {
    return new Promise((resolve, reject) => {
        if (typeof JSZip !== 'undefined') {
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
        script.onload = () => {
            console.log('JSZip loaded successfully');
            resolve();
        };
        script.onerror = () => {
            console.error('Failed to load JSZip');
            reject(new Error('Nepodarilo sa načítať JSZip knižnicu'));
        };
        document.head.appendChild(script);
    });
}

/**
 * Vygeneruje README.txt pre PRO export
 */
function generateProReadme(sequenceData, params, statistics) {
    const lines = [];
    lines.push('='.repeat(60));
    lines.push('PATTERNA - PRO EXPORT'.padCenter(60));
    lines.push('='.repeat(60));
    lines.push('');
    lines.push(`Dátum exportu: ${new Date().toLocaleString('sk-SK')}`);
    lines.push(`Verzia aplikácie: 1.0.3`);
    lines.push('');
    lines.push('PARAMETRE GENEROVANIA');
    lines.push('-'.repeat(40));
    lines.push(`γ (gamma): ${params.gamma}`);
    lines.push(`R(g) - odmena za cieľ: ${params.goalReward}`);
    lines.push(`R(o) - odmena za ostatné: ${params.otherReward}`);
    lines.push(`ε (epsilon): ${params.epsilon}`);
    lines.push(`IDF: ${params.useIDF ? 'ÁNO' : 'NIE'}`);
    lines.push(`Sentiment analýza: ${params.useSentiment ? 'ÁNO' : 'NIE'}`);
    lines.push(`Vynútený štartovací vzor: ${params.forcedStartPattern || 'Žiadny'}`);
    lines.push('');
    lines.push('SEKVENCIA');
    lines.push('-'.repeat(40));
    sequenceData.forEach(p => {
        lines.push(`${p.order}. ${p.name}`);
        lines.push(`   Súbor: ${p.filename}`);
        lines.push(`   Katalóg: ${p.catalog}`);
        lines.push(`   Jazyk/Sekcia: ${p.language}`);
        lines.push('');
    });
    
    lines.push('ŠTATISTIKY');
    lines.push('-'.repeat(40));
    lines.push(`Počet vzorov: ${sequenceData.length}`);
    if (statistics) {
        lines.push(`Priemerná podobnosť v sekvencii: ${statistics.avgConfidence?.toFixed(1) || 'N/A'}%`);
    }
    lines.push('');
    
    lines.push('OBSAH ARCHÍVU');
    lines.push('-'.repeat(40));
    lines.push('README.txt            - tento súbor s popisom');
    lines.push('metadata.json         - všetky dáta v JSON formáte (parametre, matica, MDP, atď.)');
    lines.push('patterns/             - priečinok s kompletnými textami všetkých vzorov');
    lines.push('outputs/              - priečinok s výstupmi v čitateľných formátoch');
    lines.push('  sequence.txt        - sekvencia ako text');
    lines.push('  similarity_matrix.csv - matica podobností v CSV');
    lines.push('  mdp_steps.txt       - detailný postup MDP riešenia');
    lines.push('');
    lines.push('='.repeat(60));
    lines.push('Vygenerované pomocou Patterna - nástroj pre analýzu a generovanie');
    lines.push('sekvencií organizačných vzorov na základe protichodných síl.');
    lines.push('='.repeat(60));
    
    return lines.join('\n');
}

/**
 * Vygeneruje maticu podobností vo formáte CSV
 */
function generateMatrixCSV(sequenceData, similarityMatrix) {
    const filenames = sequenceData.map(p => p.filename);
    const names = sequenceData.map(p => p.name);
    
    let csv = 'Pattern,' + names.map(n => `"${n}"`).join(',') + '\n';
    
    filenames.forEach((filename, i) => {
        const row = [`"${names[i]}"`];
        filenames.forEach((otherFile, j) => {
            if (i === j) {
                row.push('0');
            } else {
                const sim = similarityMatrix[filename]?.[otherFile] || 0;
                row.push(sim.toFixed(4));
            }
        });
        csv += row.join(',') + '\n';
    });
    
    return csv;
}

/**
 * Vygeneruje textový súbor s MDP krokmi
 */
function generateMDPStepsText(mdpResults, sequenceData) {
    const lines = [];
    const patterns = sequenceData.map(p => ({
        filename: p.filename,
        name: p.name
    }));
    
    lines.push('MARKOV DECISION PROCESS - POSTUP RIEŠENIA');
    lines.push('='.repeat(60));
    lines.push('');
    
    if (mdpResults.steps && Array.isArray(mdpResults.steps)) {
        mdpResults.steps.forEach((step, index) => {
            lines.push(`KROK ${index + 1}: ${step.type}`);
            lines.push('-'.repeat(40));
            
            switch (step.type) {
                case 'goal_calculation':
                    lines.push('Výpočet celkových podobností:');
                    if (step.totalSimilarities) {
                        const sorted = Object.entries(step.totalSimilarities)
                            .sort((a, b) => b[1] - a[1]);
                        sorted.forEach(([filename, sim]) => {
                            const pattern = patterns.find(p => p.filename === filename);
                            lines.push(`  ${pattern?.name || filename}: ${sim.toFixed(4)}`);
                        });
                    }
                    if (step.goalState) {
                        const goalPattern = patterns.find(p => p.filename === step.goalState);
                        lines.push(`CIEĽ: ${goalPattern?.name || step.goalState}`);
                    }
                    break;
                    
                case 'iteration':
                    lines.push(`Iterácia ${step.iteration}, max. zmena: ${step.maxChange?.toFixed(6)}`);
                    if (step.utilities) {
                        lines.push('Utility:');
                        Object.entries(step.utilities).forEach(([filename, util]) => {
                            const pattern = patterns.find(p => p.filename === filename);
                            lines.push(`  ${pattern?.name || filename}: ${util.toFixed(4)}`);
                        });
                    }
                    break;
                    
                case 'convergence':
                    lines.push(`Konvergencia dosiahnutá po ${step.iterations} iteráciách`);
                    break;
                    
                case 'policy_calculation':
                    lines.push('Optimálna politika:');
                    if (step.calculations) {
                        Object.entries(step.calculations).forEach(([state, calc]) => {
                            const statePattern = patterns.find(p => p.filename === state);
                            const actionPattern = patterns.find(p => p.filename === calc.bestAction);
                            lines.push(`  ${statePattern?.name || state} → ${actionPattern?.name || calc.bestAction}`);
                        });
                    }
                    break;
                    
                case 'sequence_build':
                    lines.push('Postup podľa politiky:');
                    if (step.steps) {
                        step.steps.forEach((s, i) => {
                            lines.push(`  ${i+1}. ${s.pattern?.name || s.state}`);
                        });
                    }
                    if (step.finalSequence) {
                        lines.push(`Výsledná sekvencia: ${step.finalSequence.join(' → ')}`);
                    }
                    break;
                    
                default:
                    lines.push(JSON.stringify(step, null, 2));
            }
            lines.push('');
        });
    }
    
    return lines.join('\n');
}

/**
 * Vypočíta základné štatistiky sekvencie
 */
function calculateSequenceStatistics(sequenceData, similarityMatrix) {
    if (sequenceData.length < 2 || Object.keys(similarityMatrix).length === 0) {
        return null;
    }
    
    let totalSim = 0;
    let count = 0;
    
    for (let i = 1; i < sequenceData.length; i++) {
        const prev = sequenceData[i-1].filename;
        const curr = sequenceData[i].filename;
        const sim = similarityMatrix[prev]?.[curr] || 0;
        totalSim += sim;
        count++;
    }
    
    return {
        avgConfidence: count > 0 ? (totalSim / count) * 100 : 0
    };
}

// Pomocná funkcia pre centrovanie textu
String.prototype.padCenter = function(width) {
    const len = width - this.length;
    if (len <= 0) return this.toString();
    const left = Math.floor(len / 2);
    const right = len - left;
    return ' '.repeat(left) + this + ' '.repeat(right);
};

// Inicializácia event listenera pre Export PRO
document.addEventListener('DOMContentLoaded', () => {
    const exportProBtn = document.getElementById('exportProBtn');
    if (exportProBtn) {
        exportProBtn.addEventListener('click', exportPro);
    }
});


/**
 * Vygeneruje kompletný HTML snapshot aktuálneho stavu aplikácie
 * @param {Array} sequenceData - dáta sekvencie
 * @param {Object} params - parametre generovania
 * @param {Object} similarityMatrix - matica podobností
 * @param {Object} mdpResults - výsledky MDP (voliteľné)
 * @returns {string} HTML reťazec
 */
function generateSnapshotHTML(sequenceData, params, similarityMatrix, mdpResults) {
    const t = translations?.[currentLanguage] || translations.sk;
    const dateStr = new Date().toLocaleString('sk-SK');
    
    // --- Zostavenie zoznamu vybraných vzorov ---
    let patternsListHtml = '';
    if (globalCheckedPatterns) {
        Object.keys(globalCheckedPatterns).forEach(catalog => {
            Object.keys(globalCheckedPatterns[catalog] || {}).forEach(filename => {
                if (globalCheckedPatterns[catalog][filename] && allPatternsData[filename]) {
                    const p = allPatternsData[filename];
                    patternsListHtml += `<li class="flex items-center gap-2 p-1"><span class="w-4 h-4 bg-indigo-600 rounded inline-block"></span> ${escapeHtml(p.name)} <span class="text-xs text-gray-500">(${catalog}${p.language ? ' · ' + p.language : ''})</span></li>`;
                }
            });
        });
    }

    // --- Sekvencia ---
    let sequenceHtml = '';
    sequenceData.forEach((item, idx) => {
        const prevSim = idx > 0 ? similarityMatrix[sequenceData[idx-1].filename]?.[item.filename] || 0 : null;
        const simPercent = prevSim !== null ? (prevSim * 100).toFixed(1) : null;
        sequenceHtml += `
            <div class="pattern-item flex items-stretch border rounded-lg mb-3 overflow-hidden bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <div class="pattern-content flex-1 p-3">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="font-semibold text-indigo-600 dark:text-indigo-400">${escapeHtml(item.name)}</span>
                            <span class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">#${item.order}</span>
                        </div>
                        ${simPercent !== null ? `<span class="text-xs similarity-badge px-2 py-1 rounded" style="background: hsl(${120 * simPercent/100},80%,85%); color: #1f2937;">${simPercent}%</span>` : '<span class="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">-</span>'}
                    </div>
                    <div class="flex flex-wrap items-center gap-2 mt-2">
                        <span class="px-2 py-1 rounded-full text-xs font-medium ${item.catalog === 'C & H' ? 'bg-blue-900 text-blue-200' : 'bg-green-900 text-green-200'}">${escapeHtml(item.catalog)}</span>
                        ${item.language ? `<span class="px-2 py-1 rounded-full text-xs font-medium bg-purple-900 text-purple-200">${escapeHtml(item.language.replace(/_/g, ' '))}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    });

    // --- Matica podobností ---
    let matrixHtml = '';
    if (similarityMatrix && Object.keys(similarityMatrix).length > 0) {
        const files = sequenceData.map(p => p.filename);
        const names = sequenceData.map(p => p.name);
        matrixHtml = '<div class="overflow-x-auto"><table class="w-full text-xs border-collapse">';
        matrixHtml += '<tr><th class="p-2 bg-gray-100 dark:bg-gray-700 w-24"></th>';
        names.forEach(name => {
            const short = name.length > 15 ? name.substring(0,12)+'…' : name;
            matrixHtml += `<th class="text-left p-2 bg-gray-100 dark:bg-gray-700 font-medium" title="${escapeHtml(name)}">${escapeHtml(short)}</th>`;
        });
        matrixHtml += '</tr>';

        files.forEach((f1, i) => {
            matrixHtml += '<tr>';
            matrixHtml += `<td class="font-medium p-2 bg-gray-50 dark:bg-gray-700" title="${escapeHtml(names[i])}">${escapeHtml(names[i].length>15 ? names[i].substring(0,12)+'…' : names[i])}</td>`;
            files.forEach((f2, j) => {
                const sim = similarityMatrix[f1]?.[f2] || 0;
                const intensity = sim * 0.7;
                matrixHtml += `<td class="p-2 text-center" style="background-color: rgba(99, 102, 241, ${intensity}); color: ${sim > 0.5 ? 'white' : 'black'};">${sim.toFixed(2)}</td>`;
            });
            matrixHtml += '</tr>';
        });
        matrixHtml += '</table></div>';
    }

    // --- Parametre ---
    const paramsHtml = `
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
            <div><span class="font-medium">γ:</span> ${params.gamma}</div>
            <div><span class="font-medium">R(g):</span> ${params.goalReward}</div>
            <div><span class="font-medium">R(o):</span> ${params.otherReward}</div>
            <div><span class="font-medium">ε:</span> ${params.epsilon}</div>
            <div><span class="font-medium">IDF:</span> ${params.useIDF ? 'Áno' : 'Nie'}</div>
            <div><span class="font-medium">Sentiment:</span> ${params.useSentiment ? 'Áno' : 'Nie'}</div>
            <div><span class="font-medium">USE:</span> ${params.useUSE ? 'Áno' : 'Nie'}</div>
            <div><span class="font-medium">Štart:</span> ${params.forcedStartPattern ? escapeHtml(params.forcedStartPattern) : '–'}</div>
        </div>
    `;

    // --- MDP kroky (iba ak existujú) ---
    let mdpHtml = '';
    if (mdpResults && mdpResults.steps && mdpResults.steps.length > 0) {
        mdpHtml = '<div class="mt-6 space-y-2">';
        mdpResults.steps.forEach((step, idx) => {
            let summary = '';
            if (step.type === 'goal_calculation' && step.goalState) {
                const goalPattern = sequenceData.find(p => p.filename === step.goalState);
                summary = `Cieľ: ${goalPattern ? goalPattern.name : step.goalState}`;
            } else if (step.type === 'iteration') {
                summary = `Iterácia ${step.iteration}, max. zmena: ${step.maxChange?.toFixed(4)}`;
            } else if (step.type === 'convergence') {
                summary = `Konvergencia po ${step.iterations} iteráciách`;
            } else if (step.type === 'policy_calculation') {
                summary = 'Optimálna politika';
            } else if (step.type === 'sequence_build') {
                summary = 'Zostavenie sekvencie';
            } else {
                summary = step.type;
            }
            mdpHtml += `
                <details class="bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                    <summary class="font-medium text-indigo-600 dark:text-indigo-400 cursor-pointer">${idx+1}. ${summary}</summary>
                    <div class="mt-2 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">${escapeHtml(JSON.stringify(step, null, 2))}</div>
                </details>
            `;
        });
        mdpHtml += '</div>';
    }

    // --- Získanie celého CSS (inline, aby snapshot fungoval offline) ---
    // Predpokladáme, že styles.css je dostupný – v snapshot ho vložíme ako string.
    // Pre jednoduchosť použijeme Tailwind CDN a doináč definované triedy.
    // Kvôli offline je lepšie vložiť celý obsah styles.css, ale to by bolo príliš dlhé.
    // Namiesto toho vložíme Tailwind CDN a naše vlastné CSS (ktoré je už v projekte).
    // Tu použijeme inline verziu základných štýlov (stačí pár tried).
    // Pre úplnosť by bolo ideálne načítať obsah styles.css cez fetch, ale to by bolo komplikované.
    // Pre snapshot použijeme Tailwind + základné opravy.
    const inlineStyles = `
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
            body { background-color: #f3f4f6; color: #1f2937; }
            .dark body { background-color: #111827; color: #e5e7eb; }
            .dark .bg-white { background-color: #1f2937; }
            .dark .bg-gray-50 { background-color: #1f2937; }
            .dark .border-gray-200 { border-color: #374151; }
            .pattern-item { box-shadow: 0 2px 5px 0 rgba(0,0,0,0.02); }
            .similarity-badge { border: 1px solid #e5e7eb; }
        </style>
    `;

    return `<!DOCTYPE html>
<html lang="sk" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Patterna – Snapshot</title>
    ${inlineStyles}
</head>
<body class="font-sans antialiased">

    <!-- Hlavička -->
    <nav class="bg-indigo-600 text-white py-4 px-6 shadow-md">
        <div class="container mx-auto flex items-center">
            <img src="assets/images/logo.png" alt="Patterna" class="h-10 w-auto mr-3">
            <span class="text-xl font-semibold">Patterna – Snapshot</span>
            <span class="ml-auto text-sm opacity-80">${dateStr}</span>
        </div>
    </nav>

    <main class="container mx-auto p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <!-- Ľavý stĺpec: vybrané vzory a parametre -->
            <section class="lg:col-span-2 bg-white rounded-2xl shadow p-6 dark:bg-gray-800">
                <h2 class="text-lg font-semibold mb-4">Vybrané vzory</h2>
                <ul class="list-disc pl-5 mb-6 text-sm space-y-1 max-h-60 overflow-y-auto border p-3 rounded">
                    ${patternsListHtml || '<li class="text-gray-500">Žiadne vybrané vzory</li>'}
                </ul>

                <h2 class="text-lg font-semibold mb-2">Parametre generovania</h2>
                ${paramsHtml}

                <h2 class="text-lg font-semibold mt-6 mb-2">Matica podobností</h2>
                ${matrixHtml || '<p class="text-gray-500">Matica nie je k dispozícii.</p>'}

                ${mdpHtml ? `<h2 class="text-lg font-semibold mt-6 mb-2">Postup MDP</h2>${mdpHtml}` : ''}
            </section>

            <!-- Pravý stĺpec: sekvencia -->
            <section class="bg-white rounded-2xl shadow p-6 dark:bg-gray-800">
                <div class="flex justify-between items-center mb-3">
                    <h2 class="text-lg font-semibold">Navrhnutá sekvencia</h2>
                    <span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">${sequenceData.length}</span>
                </div>
                <div class="space-y-3">
                    ${sequenceHtml}
                </div>
                <div class="mt-4 flex justify-between items-center px-4 py-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-full border border-indigo-200 dark:border-indigo-800">
                    <span class="text-sm font-medium">Celková spoľahlivosť</span>
                    <span class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">${(sequenceData.reduce((acc,_,i)=>i>0?acc+(similarityMatrix[sequenceData[i-1].filename]?.[sequenceData[i].filename]||0):acc,0)/(sequenceData.length-1)*100||0).toFixed(1)}%</span>
                </div>
            </section>
        </div>
    </main>

    <!-- Pätička -->
    <footer class="bg-gray-50 border-t border-gray-200 dark:bg-gray-800 dark:border-gray-700 mt-12 py-6 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>Vygenerované pomocou Patterna – FIIT STU</p>
    </footer>
</body>
</html>`;
}