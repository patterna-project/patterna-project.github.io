// statistics.js

// Funkcia na zobrazenie štatistík
function displayStatistics(patterns, similarityMatrix) {
    
    const similarityInfo = document.getElementById('similarityInfo');
    const matrixDiv = document.getElementById('similarityMatrix');
    
    // Schováme maticu a graf, zobrazíme štatistiky
    matrixDiv.innerHTML = ''; // Vyčistíme
    
    // Vytvoríme kontajner pre štatistiky
    const statsContainer = document.createElement('div');
    statsContainer.className = 'statistics-container';
    statsContainer.id = 'statisticsContainer';
    
    // 1. Základné štatistiky
    statsContainer.appendChild(createBasicStats(patterns, similarityMatrix));
    
    // 2. Top 5 najsilnejších spojení
    statsContainer.appendChild(createTopConnections(patterns, similarityMatrix));
    
    // 3. Najizolovanejšie a najprepojenejšie vzory
    statsContainer.appendChild(createCentralityStats(patterns, similarityMatrix));
    
    // 4. Distribúcia podobností
    statsContainer.appendChild(createDistributionStats(patterns, similarityMatrix));
    
    // Vyčistíme a pridáme do DOM
    const existingStats = document.getElementById('statisticsContainer');
    if (existingStats) existingStats.remove();
    
    matrixDiv.appendChild(statsContainer);
}

// Základné štatistiky
function createBasicStats(patterns, similarityMatrix) {
    const container = document.createElement('div');
    container.className = 'statistics-section mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg';
    
    const title = document.createElement('h4');
    title.className = 'font-semibold mb-3 text-gray-800 dark:text-white';
    title.textContent = translations[currentLanguage]?.statisticsBasic || 'Základné štatistiky';
    container.appendChild(title);
    
    const stats = calculateBasicStats(patterns, similarityMatrix);
    
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-2 md:grid-cols-4 gap-4';
    
    // Počet vzorov
    grid.appendChild(createStatCard(
        '📊',
        stats.totalPatterns,
        translations[currentLanguage]?.statisticsTotalPatterns || 'Počet vzorov'
    ));
    
    // Priemerná podobnosť
    grid.appendChild(createStatCard(
        '📈',
        stats.avgSimilarity.toFixed(1) + '%',
        translations[currentLanguage]?.statisticsAvgSimilarity || 'Priemerná podobnosť'
    ));
    
    // Medián podobnosti
    grid.appendChild(createStatCard(
        '📉',
        stats.medianSimilarity.toFixed(1) + '%',
        translations[currentLanguage]?.statisticsMedianSimilarity || 'Medián podobnosti'
    ));
    
    // Smerodajná odchýlka
    grid.appendChild(createStatCard(
        '📊',
        stats.stdDeviation.toFixed(1) + '%',
        translations[currentLanguage]?.statisticsStdDeviation || 'Smerodajná odchýlka'
    ));
    
    container.appendChild(grid);
    
    return container;
}

// Top 5 najsilnejších spojení - OPRAVENÉ
function createTopConnections(patterns, similarityMatrix) {
    const container = document.createElement('div');
    container.className = 'statistics-section mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg';
    
    const title = document.createElement('h4');
    title.className = 'font-semibold mb-3 text-gray-800 dark:text-white';
    title.textContent = translations[currentLanguage]?.statisticsTopConnections || 'Top 5 najsilnejších spojení';
    container.appendChild(title);
    
    const connections = [];
    
    patterns.forEach((p1, i) => {
        patterns.forEach((p2, j) => {
            if (i < j) {
                const sim = similarityMatrix[p1.filename]?.[p2.filename] || 0;
                connections.push({
                    from: p1.name,
                    to: p2.name,
                    similarity: sim * 100
                });
            }
        });
    });
    
    connections.sort((a, b) => b.similarity - a.similarity);
    const top5 = connections.slice(0, 5);
    
    const list = document.createElement('div');
    list.className = 'space-y-2';
    
    top5.forEach((conn, index) => {
        const item = document.createElement('div');
        item.className = 'flex items-center justify-between p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600';
        
        const colors = getConfidenceColor(conn.similarity);

        item.innerHTML = `
            <div class="flex items-center gap-2">
                <span class="text-xs font-medium text-gray-500 dark:text-gray-400 w-6">#${index + 1}</span>
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">${conn.from}</span>
                <span class="text-xs text-gray-400 dark:text-gray-500">→</span>
                <span class="text-sm font-medium text-gray-800 dark:text-gray-200">${conn.to}</span>
            </div>
            <span class="text-xs font-semibold px-2 py-1 rounded-full" 
                style="background: ${colors.bg}; color: ${colors.text}; border: 1px solid ${colors.border}">
                ${conn.similarity.toFixed(1)}%
            </span>
        `;
        
        list.appendChild(item);
    });
    
    container.appendChild(list);
    return container;
}

// Najizolovanejšie a najprepojenejšie vzory - OPRAVENÉ
function createCentralityStats(patterns, similarityMatrix) {
    const container = document.createElement('div');
    container.className = 'statistics-section mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg';
    
    const title = document.createElement('h4');
    title.className = 'font-semibold mb-3 text-gray-800 dark:text-white';
    title.textContent = translations[currentLanguage]?.statisticsCentrality || 'Centralita vzorov';
    container.appendChild(title);
    
    const scores = patterns.map(pattern => {
        let totalSim = 0;
        patterns.forEach(other => {
            if (other.filename !== pattern.filename) {
                totalSim += similarityMatrix[pattern.filename]?.[other.filename] || 0;
            }
        });
        return {
            name: pattern.name,
            score: totalSim * 100 / (patterns.length - 1) // priemerná podobnosť
        };
    });
    
    scores.sort((a, b) => b.score - a.score);
    
    const mostConnected = scores.slice(0, 3);
    const leastConnected = scores.slice(-3).reverse();
    
    const grid = document.createElement('div');
    grid.className = 'grid grid-cols-1 md:grid-cols-2 gap-4';
    
    // Najprepojenejšie
    const mostDiv = document.createElement('div');
    mostDiv.className = 'p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600';
    mostDiv.innerHTML = `<h5 class="text-sm font-medium mb-2 text-green-600 dark:text-green-400">${translations[currentLanguage]?.statisticsMostConnected || 'Najprepojenejšie'}</h5>`;
    
    mostConnected.forEach((item, index) => {
        const colors = getConfidenceColor(item.score);
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex justify-between items-center py-1';
        itemDiv.innerHTML = `
            <span class="text-sm text-gray-700 dark:text-gray-300">${index + 1}. ${item.name}</span>
            <span class="text-xs px-2 py-1 rounded" style="background: ${colors.bg}; color: ${colors.text}">
                ${item.score.toFixed(1)}%
            </span>
        `;
        mostDiv.appendChild(itemDiv);
    });
    
    // Najizolovanejšie
    const leastDiv = document.createElement('div');
    leastDiv.className = 'p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600';
    leastDiv.innerHTML = `<h5 class="text-sm font-medium mb-2 text-red-600 dark:text-red-400">${translations[currentLanguage]?.statisticsLeastConnected || 'Najizolovanejšie'}</h5>`;
    
    leastConnected.forEach((item, index) => {
        const colors = getConfidenceColor(item.score);
        const itemDiv = document.createElement('div');
        itemDiv.className = 'flex justify-between items-center py-1';
        itemDiv.innerHTML = `
            <span class="text-sm text-gray-700 dark:text-gray-300">${index + 1}. ${item.name}</span>
            <span class="text-xs px-2 py-1 rounded" style="background: ${colors.bg}; color: ${colors.text}">
                ${item.score.toFixed(1)}%
            </span>
        `;
        leastDiv.appendChild(itemDiv);
    });
    
    grid.appendChild(mostDiv);
    grid.appendChild(leastDiv);
    container.appendChild(grid);
    
    return container;
}

// Distribúcia podobností
function createDistributionStats(patterns, similarityMatrix) {
    const container = document.createElement('div');
    container.className = 'statistics-section mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg';
    
    const title = document.createElement('h4');
    title.className = 'font-semibold mb-3 text-gray-800 dark:text-white';
    title.textContent = translations[currentLanguage]?.statisticsDistribution || 'Distribúcia podobností';
    container.appendChild(title);
    
    // Zozbierame všetky podobnosti
    const similarities = [];
    patterns.forEach((p1, i) => {
        patterns.forEach((p2, j) => {
            if (i < j) {
                const sim = similarityMatrix[p1.filename]?.[p2.filename] || 0;
                similarities.push(sim * 100);
            }
        });
    });
    
    // Rozdelenie do intervalov
    const intervals = [
        { min: 0, max: 20, count: 0, label: '0-20%' },
        { min: 20, max: 40, count: 0, label: '20-40%' },
        { min: 40, max: 60, count: 0, label: '40-60%' },
        { min: 60, max: 80, count: 0, label: '60-80%' },
        { min: 80, max: 100, count: 0, label: '80-100%' }
    ];
    
    similarities.forEach(sim => {
        for (let interval of intervals) {
            if (sim >= interval.min && sim < interval.max) {
                interval.count++;
                break;
            }
        }
    });
    
    const maxCount = Math.max(...intervals.map(i => i.count));
    
    const distributionDiv = document.createElement('div');
    distributionDiv.className = 'space-y-2';
    
    intervals.forEach(interval => {
        const percentage = maxCount > 0 ? (interval.count / maxCount) * 100 : 0;
        
        const row = document.createElement('div');
        row.className = 'flex items-center gap-2';
        row.innerHTML = `
            <span class="text-xs text-gray-600 dark:text-gray-400 w-16">${interval.label}</span>
            <div class="flex-1 h-6 bg-gray-200 dark:bg-gray-600 rounded overflow-hidden">
                <div class="h-full bg-indigo-500 dark:bg-indigo-600 transition-all duration-300" 
                     style="width: ${percentage}%"></div>
            </div>
            <span class="text-xs font-medium text-gray-700 dark:text-gray-300 w-12">${interval.count}</span>
        `;
        
        distributionDiv.appendChild(row);
    });
    
    container.appendChild(distributionDiv);
    return container;
}

// Pomocná funkcia pre vytvorenie karty štatistiky
function createStatCard(icon, value, label) {
    const card = document.createElement('div');
    card.className = 'stat-card p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-600 text-center';
    card.innerHTML = `
        <div class="text-2xl mb-1">${icon}</div>
        <div class="text-xl font-bold text-gray-800 dark:text-white">${value}</div>
        <div class="text-xs text-gray-500 dark:text-gray-400">${label}</div>
    `;
    return card;
}

// Výpočet základných štatistík
function calculateBasicStats(patterns, similarityMatrix) {
    const similarities = [];
    
    patterns.forEach((p1, i) => {
        patterns.forEach((p2, j) => {
            if (i < j) {
                const sim = similarityMatrix[p1.filename]?.[p2.filename] || 0;
                similarities.push(sim * 100);
            }
        });
    });
    
    if (similarities.length === 0) {
        return {
            totalPatterns: patterns.length,
            avgSimilarity: 0,
            medianSimilarity: 0,
            stdDeviation: 0
        };
    }
    
    // Priemer
    const sum = similarities.reduce((a, b) => a + b, 0);
    const avg = sum / similarities.length;
    
    // Medián
    const sorted = [...similarities].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const median = sorted.length % 2 === 0 
        ? (sorted[mid - 1] + sorted[mid]) / 2 
        : sorted[mid];
    
    // Smerodajná odchýlka
    const variance = similarities.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / similarities.length;
    const stdDev = Math.sqrt(variance);
    
    return {
        totalPatterns: patterns.length,
        avgSimilarity: avg,
        medianSimilarity: median,
        stdDeviation: stdDev
    };
}

// Uložíme posledné zobrazené dáta pre refresh
let lastDisplayedPatterns = null;
let lastDisplayedMatrix = null;

// Prepíšeme pôvodnú displayStatistics, aby si ukladala dáta
const originalDisplayStatistics = displayStatistics;
displayStatistics = function(patterns, similarityMatrix) {
    lastDisplayedPatterns = patterns;
    lastDisplayedMatrix = similarityMatrix;
    originalDisplayStatistics(patterns, similarityMatrix);
};

// Funkcia na obnovenie štatistík po zmene jazyka
function refreshStatistics() {
    if (lastDisplayedPatterns && lastDisplayedMatrix) {
        // Znovu vykreslíme štatistiky s aktuálnymi prekladmi
        displayStatistics(lastDisplayedPatterns, lastDisplayedMatrix);
    }
}

// Exportujeme refreshStatistics do globálneho priestoru
window.refreshStatistics = refreshStatistics;