// graph.js - na začiatok súboru

// Použijeme existujúcu currentView z scripts.js alebo si vytvoríme vlastnú
if (typeof window.currentView === 'undefined') {
    window.currentView = 'matrix'; // 'matrix' alebo 'graph'
}

let similarityGraph = null;
let currentGraphData = null;
let selectedNodeId = null; // Sledujeme vybraný uzol
let sequenceHighlightEnabled = false; // Stav zvýraznenia sekvencie

// Funkcia na inicializáciu prepínacích tlačidiel
function initSimilarityViewToggle() {
    const similarityInfo = document.getElementById('similarityInfo');
    if (!similarityInfo) return;
    
    // Získame preklady
    const t = window.translations?.[window.currentLanguage] || { 
        similarityMatrix: "📊 Matica podobností",
        similarityGraph: "🕸️ Graf podobností"
    };
    
    // Najprv odstránime hidden class, aby bolo vidieť
    similarityInfo.classList.remove('hidden');
    
    similarityInfo.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <div class="flex gap-2">
                <button id="matrixViewBtn" 
                    class="px-4 py-2 rounded-lg transition-all duration-200 font-medium
                           bg-indigo-600 text-white hover:bg-indigo-700
                           dark:bg-indigo-500 dark:hover:bg-indigo-600">
                    ${t.similarityMatrix}
                </button>
                <button id="graphViewBtn" 
                    class="px-4 py-2 rounded-lg transition-all duration-200 font-medium
                           bg-gray-200 text-gray-700 hover:bg-gray-300
                           dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                    ${t.similarityGraph}
                </button>
            </div>
        </div>
        <div id="similarityMatrix" class="text-sm overflow-x-auto"></div>
        <div id="similarityGraph" class="w-full min-h-[500px] hidden relative">
            <div id="nodeInfoPanel" class="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs hidden border border-gray-200 dark:border-gray-700">
                <h4 class="font-semibold text-sm mb-2 text-gray-700 dark:text-gray-300" id="nodeInfoTitle"></h4>
                <div id="nodeInfoContent" class="text-xs space-y-1"></div>
            </div>
        </div>
    `;

    document.getElementById('matrixViewBtn').addEventListener('click', () => switchView('matrix'));
    document.getElementById('graphViewBtn').addEventListener('click', () => switchView('graph'));
}



function displaySimilarityGraph(patterns, similarityMatrix) {
    currentGraphData = { patterns, matrix: similarityMatrix };
    const graphDiv = document.getElementById('similarityGraph');
    if (!graphDiv) return;
    if (window.currentView === 'graph') {
        renderSimilarityGraph(patterns, similarityMatrix);
    }
}

function renderSimilarityGraph(patterns, similarityMatrix) {
    const graphDiv = document.getElementById('similarityGraph');
    graphDiv.innerHTML = ''; // Vyčistíme predchádajúci graf
    selectedNodeId = null; // Reset vybraného uzla
    sequenceHighlightEnabled = false;

    // Hranica pre zobrazenie hrany - Dynamický threshold podľa toho, či je zapnuté IDF
    const idfCheckbox = document.getElementById('idfCheckbox');
    const useIDF = idfCheckbox ? idfCheckbox.checked : false;
    let currentThreshold = useIDF ? 0.1 : 0.3;

    // Stav pre izolačný režim - definujeme na začiatku
    let isolationMode = false;
    let isolatedNodeId = null;
    
    // Znova vytvoríme štruktúru s info panelom
    const graphContainer = document.createElement('div');
    graphContainer.className = 'w-full h-full relative';
    graphContainer.innerHTML = `
        <!-- Vyhľadávanie v grafe -->
        <div class="absolute top-4 left-4 z-20">
            <div id="graphSearchContainer" class="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300 overflow-hidden" style="width: 2.5rem;">
                <button id="graphSearchToggle" class="w-10 h-10 flex-shrink-0 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg rounded-full">
                    🔍
                </button>
                <input type="text" id="graphSearchInput" 
                    placeholder="${window.translations?.[window.currentLanguage]?.searchPlaceholder}" 
                    class="w-0 opacity-0 px-0 py-2 text-sm bg-transparent border-none focus:outline-none focus:ring-0 transition-all duration-300"
                    autocomplete="off">
            </div>
            <div id="graphSearchResults" class="absolute left-0 w-64 mt-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-h-60 overflow-y-auto hidden z-30"></div>
        </div>
                
        <div id="similarityGraphSvg" class="w-full h-full"></div>
        <div id="nodeInfoPanel" class="absolute bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 max-w-xs hidden border border-gray-200 dark:border-gray-700">
            <div class="flex justify-between items-start mb-2">
                <h4 class="font-semibold text-sm text-gray-700 dark:text-gray-300" id="nodeInfoTitle"></h4>
                <div class="flex gap-1">
                    <button id="isolateNodeBtn" class="w-5 h-5 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white rounded transition-colors" title="Izolovať uzol (zobraziť len spojenia)">
                        <span class="text-xs">👁️</span>
                    </button>
                    <button id="deselectNodeBtn" class="w-5 h-5 flex items-center justify-center bg-red-500 hover:bg-red-600 text-white rounded transition-colors" title="Zrušiť výber">
                        <svg class="w-3 h-3" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            </div>
            <div id="nodeInfoContent" class="text-xs space-y-1"></div>
        </div>
    `;
    
    // TERAZ VYTVORÍME POSUVNÍK A VLOŽÍME HO DO graphContainer
    const thresholdContainer = document.createElement('div');
    thresholdContainer.className = 'absolute top-4 right-4 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 flex items-center gap-3';
    const t = window.translations?.[window.currentLanguage] || { graphThreshold: "Prah:" };
    
    thresholdContainer.innerHTML = `
    <span class="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap">
        <span id="thresholdLabelText">${t.graphThreshold}</span> <span id="thresholdValue">${useIDF ? '0.10' : '0.30'}</span>
    </span>
        <input type="range" id="similarityThreshold" min="0" max="1" step="0.01" value="${useIDF ? '0.1' : '0.3'}" class="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
        <span class="text-xs text-gray-500 dark:text-gray-400">(0-1)</span>
    `;
    graphContainer.appendChild(thresholdContainer);
    
    // Pridáme tlačidlo pre zvýraznenie sekvencie POD posuvník
    const sequenceHighlightContainer = document.createElement('div');
    sequenceHighlightContainer.className = 'absolute top-20 right-4 z-20'; // top-24 = 6rem (96px) - pod posuvník
    sequenceHighlightContainer.innerHTML = `
        <button id="highlightSequenceBtn" class="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-lg" title="Zvýrazniť sekvenciu">
            🔗
        </button>
    `;

    graphContainer.appendChild(sequenceHighlightContainer);

    graphDiv.appendChild(graphContainer);
    
    const svgDiv = document.getElementById('similarityGraphSvg');
    
    // V časti kde vytvárame nodes, pridáme viac informácií
    const nodes = patterns.map((p, index) => ({
        id: p.filename,
        name: p.name,
        index: index,
        language: p.language,  // Pridáme language
        catalog: p.language && Object.keys(userCatalogs).includes(p.language) ? p.language : 'C & H',  // Pridáme catalog
        element: null // Sem neskôr uložíme referenciu na D3 element
    }));
    
    // Pripravíme hrany (links) - len pre podobnosti > treshold
    const links = [];
    
    patterns.forEach((p1, i) => {
        patterns.forEach((p2, j) => {
            if (i < j) {
                const similarity = similarityMatrix[p1.filename]?.[p2.filename] || 0;
                if (similarity > currentThreshold) { // <-- ZMENENÉ
                    links.push({
                        source: i,
                        target: j,
                        value: similarity,
                        sourceId: p1.filename,
                        targetId: p2.filename
                    });
                }
            }
        });
    });
    
    // Nastavenia grafu
    const width = graphDiv.clientWidth || 800;
    const height = 450;
    
    // Vytvoríme SVG
    const svg = d3.select(svgDiv)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('viewBox', `0 0 ${width} ${height}`)
        .style('background-color', 'transparent');
    
    // Pridáme skupinu pre zoom
    const g = svg.append('g');
    
    // Pridáme zoom
    const zoom = d3.zoom()
        .extent([[0, 0], [width, height]])
        .scaleExtent([0.5, 3])
        .on('zoom', (event) => {
            g.attr('transform', event.transform);
        });
    
    svg.call(zoom);
    
    // Vytvoríme force simuláciu
    const simulation = d3.forceSimulation(nodes)
        .force('link', d3.forceLink(links).id(d => d.index).distance(d => 200 - (d.value * 100)))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force('collision', d3.forceCollide().radius(60));


    let link = g.append('g')
        .selectAll('line')
        .data(links)
        .enter()
        .append('line')
        .attr('stroke', d => {
            let intensity;
            if (useIDF) {
                // Pre IDF: škálujeme od 0.25 do 0.9
                intensity = 0.25 + (d.value * 0.65);
            } else {
                // Pôvodné správanie: priamo value, ale min 0.2
                intensity = Math.min(0.9, Math.max(0.2, d.value));
            }
            return `rgba(34, 197, 94, ${intensity})`;
        })
        .attr('stroke-width', d => {
            if (useIDF) {
                return Math.max(2, Math.min(6, d.value * 12));
            } else {
                return Math.max(1, d.value * 4);
            }
        })
        .attr('stroke-opacity', 1)
        .attr('data-source', d => d.sourceId)
        .attr('data-target', d => d.targetId);
    
    // Vytvoríme texty pre čiary (na začiatku skryté)
    let linkText = g.append('g')
        .selectAll('text')
        .data(links)
        .enter()
        .append('text')
        .text(d => (d.value * 100).toFixed(0) + '%')
        .attr('font-size', '10px')
        .attr('fill', 'currentColor')
        .attr('class', 'text-gray-600 dark:text-gray-400 link-percentage')
        .attr('text-anchor', 'middle')
        .attr('dy', '-5')
        .style('opacity', 0); // Na začiatku skryté

    // Funkcia na aktualizáciu hrán pri zmene prahu
    function updateLinksWithThreshold(newThreshold) {
        // Vyfiltrujeme nové hrany
        const newLinks = [];
        patterns.forEach((p1, i) => {
            patterns.forEach((p2, j) => {
                if (i < j) {
                    const similarity = similarityMatrix[p1.filename]?.[p2.filename] || 0;
                    if (similarity > newThreshold) {
                        newLinks.push({
                            source: i,
                            target: j,
                            value: similarity,
                            sourceId: p1.filename,
                            targetId: p2.filename
                        });
                    }
                }
            });
        });
        
        // Znovu naviažeme dáta na čiary pomocou join (s kľúčom)
        link = link.data(newLinks, d => `${d.sourceId}-${d.targetId}`)
            .join('line')
            .attr('stroke', d => {
                let intensity;
                if (useIDF) {
                    intensity = 0.25 + (d.value * 0.65);
                } else {
                    intensity = Math.min(0.9, Math.max(0.2, d.value));
                }
                return `rgba(34, 197, 94, ${intensity})`;
            })
            .attr('stroke-width', d => {
                if (useIDF) {
                    return Math.max(2, Math.min(6, d.value * 12));
                } else {
                    return Math.max(1, d.value * 4);
                }
            })
            .attr('stroke-opacity', 1)
            .attr('data-source', d => d.sourceId)
            .attr('data-target', d => d.targetId);
        
        // To isté pre texty
        linkText = linkText.data(newLinks, d => `${d.sourceId}-${d.targetId}`)
            .join('text')
            .text(d => (d.value * 100).toFixed(0) + '%')
            .attr('font-size', '10px')
            .attr('fill', 'currentColor')
            .attr('class', 'text-gray-600 dark:text-gray-400 link-percentage')
            .attr('text-anchor', 'middle')
            .attr('dy', '-5')
            .style('opacity', 0);
        
        // Aktualizujeme simuláciu s novými hranami
        simulation.nodes(nodes);
        simulation.force('link').links(newLinks);
        simulation.alpha(0.3).restart();

        // Ak bolo zapnuté zvýraznenie, vypneme ho
        if (sequenceHighlightEnabled) {
            sequenceHighlightEnabled = false;
            const btn = document.getElementById('highlightSequenceBtn');
            if (btn) {
                btn.innerHTML = '🔗';
                btn.title = 'Zvýrazniť sekvenciu';
            }
            resetHighlight();
        }
    }
    
    // Vytvoríme uzly
    const node = g.append('g')
        .selectAll('g')
        .data(nodes)
        .enter()
        .append('g')
        .call(d3.drag()
            .on('start', dragstarted)
            .on('drag', dragged)
            .on('end', dragended))
        .on('click', function(event, d) {
            // Uložíme referenciu na D3 element
            d.element = this;
            selectNode(d, true); // true = kliknutie myšou
        });
    
    // Pridáme kruhy pre uzly - JEDNOTNÁ INDIGO FARBA
    node.append('circle')
        .attr('r', 25)
        .attr('fill', '#4f46e5') // Jednotná indigo farba pre všetky uzly
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .attr('class', 'dark:stroke-gray-800');
    
    // Pridáme text do uzlov (skratka názvu)
    node.append('text')
        .text(d => {
            const words = d.name.split(' ');
            if (words.length > 1) {
                return words[0][0] + words[1][0];
            }
            return d.name.substring(0, 2).toUpperCase();
        })
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .attr('fill', 'white')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold');
    
    // Pridáme tooltip s celým názvom
    node.append('title')
        .text(d => d.name);
    
    // Pridáme popisky pre uzly (celý názov pod uzlom)
    node.append('text')
        .text(d => {
            if (d.name.length > 15) {
                return d.name.substring(0, 12) + '...';
            }
            return d.name;
        })
        .attr('text-anchor', 'middle')
        .attr('dy', '40')
        .attr('fill', 'currentColor')
        .attr('font-size', '10px')
        .attr('class', 'text-gray-700 dark:text-gray-300');

    node.each(function(d) {
        d.element = this; // Teraz má každý uzol referenciu na svoj <g> element
    });
    
    // Aktualizácia pozícií pri simulácii
    simulation.on('tick', () => {
        // Aktualizácia čiar
        link
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y);
        
        // Aktualizácia textov na čiarach
        linkText
            .attr('x', d => (d.source.x + d.target.x) / 2)
            .attr('y', d => (d.source.y + d.target.y) / 2);
        
        // Aktualizácia uzlov
        node
            .attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Funkcie pre drag
    function dragstarted(event) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
    }
    
    function dragged(event) {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
    }
    
    function dragended(event) {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
    }
    
    // Funkcia na výber uzla (zdieľaná pre kliknutie aj vyhľadávanie)
    function selectNode(nodeData, isClick = false) {
        // Ak klikneme na ten istý uzol, vypneme výber
        if (selectedNodeId === nodeData.id && isClick) {
            selectedNodeId = null;
            // Skryjeme všetky percentá
            linkText.style('opacity', 0);
            // Schováme info panel
            document.getElementById('nodeInfoPanel').classList.add('hidden');
            
            // Ak sme v izolačnom režime, vypneme ho
            if (isolationMode) {
                isolationMode = false;
                isolatedNodeId = null;
                const isolateBtn = document.getElementById('isolateNodeBtn');
                if (isolateBtn) {
                    isolateBtn.innerHTML = '<span class="text-xs">👁️</span>';
                    isolateBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
                    isolateBtn.classList.add('bg-green-500', 'hover:bg-green-600');
                    isolateBtn.title = 'Izolovať uzol (zobraziť len spojenia)';
                }
                
                // Obnovíme normálne zobrazenie
                node.style('opacity', 1);
                node.style('pointer-events', 'all');
                link.style('opacity', 1);
            }
        } else {
            selectedNodeId = nodeData.id;
            
            // Ak sme v izolačnom režime, aktualizujeme izoláciu pre nový uzol
            if (isolationMode) {
                isolatedNodeId = nodeData.id;
                
                // Zistíme všetky spojenia nového vybraného uzla
                const connectedNodeIds = new Set([nodeData.id]);
                
                links.forEach(link => {
                    if (link.sourceId === nodeData.id) {
                        connectedNodeIds.add(link.targetId);
                    }
                    if (link.targetId === nodeData.id) {
                        connectedNodeIds.add(link.sourceId);
                    }
                });
                
                // Skryjeme uzly, ktoré nie sú v množine
                node.style('opacity', nodeData => connectedNodeIds.has(nodeData.id) ? 1 : 0.1);
                node.style('pointer-events', nodeData => connectedNodeIds.has(nodeData.id) ? 'all' : 'none');
                
                // Skryjeme hrany, ktoré nie sú spojené s vybraným uzlom
                link.style('opacity', linkData => 
                    (linkData.sourceId === nodeData.id || linkData.targetId === nodeData.id) ? 1 : 0.1
                );
            }
            
            // Zobrazíme informácie o uzle
            showNodeInfo(nodeData, patterns, similarityMatrix);
            
            // Zobrazíme percentá len pre hrany tohto uzla
            linkText.style('opacity', (linkData) => {
                if (linkData.sourceId === nodeData.id || linkData.targetId === nodeData.id) {
                    return 1;
                }
                return 0;
            });
            
            // Vycentrovanie na vybraný uzol (ak to nie je kliknutie, ale výber z vyhľadávania)
            if (!isClick && nodeData.element) {
                const transform = d3.zoomTransform(svg.node());
                const scale = transform.k;
                const x = width / 2 - nodeData.x * scale;
                const y = height / 2 - nodeData.y * scale;
                
                svg.transition()
                    .duration(500)
                    .call(zoom.transform, d3.zoomIdentity.translate(x, y).scale(scale));
                
                // Zvýrazníme uzol (bliknutie)
                d3.select(nodeData.element).select('circle')
                    .transition()
                    .duration(200)
                    .attr('r', 35)
                    .attr('stroke', '#f59e0b')
                    .attr('stroke-width', 4)
                    .transition()
                    .duration(200)
                    .attr('r', 25)
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2);
            }
        }
    }

    // Event listener pre posuvník
    const thresholdSlider = document.getElementById('similarityThreshold');
    const thresholdValue = document.getElementById('thresholdValue');
    
    if (thresholdSlider && thresholdValue) {
        thresholdSlider.addEventListener('input', (e) => {
            const val = parseFloat(e.target.value);
            thresholdValue.textContent = val.toFixed(2);
            currentThreshold = val;
            updateLinksWithThreshold(val);
        });
    }

    // Funkcia na zvýraznenie sekvencie
    function highlightSequence() {
        if (!originalSequence || originalSequence.length === 0) return;

        const sequenceFilenames = originalSequence.map(p => p.filename);
        
        // Zvýrazníme uzly: tie v sekvencii dostanú plnú farbu, ostatné zosvetlíme
        node.style('opacity', d => sequenceFilenames.includes(d.id) ? 1 : 0.2);
        
        // Zvýrazníme hrany: len tie, ktoré spájajú po sebe idúce vzory v sekvencii
        const sequenceEdges = [];
        for (let i = 0; i < sequenceFilenames.length - 1; i++) {
            sequenceEdges.push(`${sequenceFilenames[i]}-${sequenceFilenames[i+1]}`);
        }

        link.style('opacity', d => {
            const edgeId = `${d.sourceId}-${d.targetId}`;
            const reverseEdgeId = `${d.targetId}-${d.sourceId}`;
            return (sequenceEdges.includes(edgeId) || sequenceEdges.includes(reverseEdgeId)) ? 1 : 0.1;
        });
        
        // Skryjeme všetky percentá (ak boli zobrazené)
        linkText.style('opacity', 0);
    }

    // Funkcia na reset zvýraznenia
    function resetHighlight() {
        node.style('opacity', 1);
        link.style('opacity', 1);
        // Percentá necháme skryté (budú sa zobrazovať len pri výbere uzla)
        linkText.style('opacity', 0);
    }
    
    // Inicializácia vyhľadávania
    initGraphSearch(nodes, patterns, similarityMatrix, selectNode, svg, zoom, width, height);
    
    // Teraz, keď už máme node a link definované, môžeme pridať event listenery pre tlačidlá
    
    // Pridáme event listener pre tlačidlo izolácie
    const isolateBtn = document.getElementById('isolateNodeBtn');
    if (isolateBtn) {
        isolateBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            if (!selectedNodeId) return;
            
            isolationMode = !isolationMode;
            
            if (isolationMode) {
                // Ak bolo zapnuté zvýraznenie sekvencie, vypneme ho
                if (sequenceHighlightEnabled) {
                    sequenceHighlightEnabled = false;
                    const highlightBtn = document.getElementById('highlightSequenceBtn');
                    if (highlightBtn) {
                        highlightBtn.innerHTML = '🔗';
                        highlightBtn.title = 'Zvýrazniť sekvenciu';
                    }
                    resetHighlight();
                }
                
                // Aktivujeme izolačný režim
                isolatedNodeId = selectedNodeId;
                isolateBtn.innerHTML = '<span class="text-xs">🚫</span>';
                isolateBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
                isolateBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
                isolateBtn.title = 'Vypnúť izoláciu (zobraziť všetko)';
                
                // Zistíme všetky spojenia vybraného uzla
                const connectedNodeIds = new Set([selectedNodeId]);
                
                links.forEach(link => {
                    if (link.sourceId === selectedNodeId) {
                        connectedNodeIds.add(link.targetId);
                    }
                    if (link.targetId === selectedNodeId) {
                        connectedNodeIds.add(link.sourceId);
                    }
                });
                
                // Skryjeme uzly, ktoré nie sú v množine
                node.style('opacity', d => connectedNodeIds.has(d.id) ? 1 : 0.1);
                node.style('pointer-events', d => connectedNodeIds.has(d.id) ? 'all' : 'none');
                
                // Skryjeme hrany, ktoré nie sú spojené s vybraným uzlom
                link.style('opacity', d => 
                    (d.sourceId === selectedNodeId || d.targetId === selectedNodeId) ? 1 : 0.1
                );
                
                // Skryjeme texty na hranách (necháme len pre vybraný uzol)
                linkText.style('opacity', d => 
                    (d.sourceId === selectedNodeId || d.targetId === selectedNodeId) ? 1 : 0
                );
                
            } else {
                // Vypneme izolačný režim
                isolatedNodeId = null;
                isolateBtn.innerHTML = '<span class="text-xs">👁️</span>';
                isolateBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
                isolateBtn.classList.add('bg-green-500', 'hover:bg-green-600');
                isolateBtn.title = 'Izolovať uzol (zobraziť len spojenia)';
                
                // Obnovíme normálne zobrazenie
                node.style('opacity', 1);
                node.style('pointer-events', 'all');
                link.style('opacity', 1);
                
                // Zobrazíme percentá len pre vybraný uzol (ak je nejaký vybraný)
                if (selectedNodeId) {
                    linkText.style('opacity', (linkData) => {
                        if (linkData.sourceId === selectedNodeId || linkData.targetId === selectedNodeId) {
                            return 1;
                        }
                        return 0;
                    });
                } else {
                    linkText.style('opacity', 0);
                }
            }
        });
    }
    
    // Pridáme event listener pre krížik
    const deselectBtn = document.getElementById('deselectNodeBtn');
    if (deselectBtn) {
        deselectBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Zastavíme propagáciu, aby sa neaktivoval klik na uzol
            selectedNodeId = null;
            
            // Ak sme v izolačnom režime, vypneme ho
            if (isolationMode) {
                isolationMode = false;
                isolatedNodeId = null;
                const isolateBtn = document.getElementById('isolateNodeBtn');
                if (isolateBtn) {
                    isolateBtn.innerHTML = '<span class="text-xs">👁️</span>';
                    isolateBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
                    isolateBtn.classList.add('bg-green-500', 'hover:bg-green-600');
                    isolateBtn.title = 'Izolovať uzol (zobraziť len spojenia)';
                }
            }
            
            // Skryjeme všetky percentá
            d3.selectAll('.link-percentage').style('opacity', 0);
            
            // Obnovíme normálne zobrazenie všetkých uzlov a hrán
            node.style('opacity', 1);
            node.style('pointer-events', 'all');
            link.style('opacity', 1);
            
            // Schováme info panel
            document.getElementById('nodeInfoPanel').classList.add('hidden');
        });
    }

    // Event listener pre tlačidlo zvýraznenia sekvencie
    const highlightBtn = document.getElementById('highlightSequenceBtn');
    if (highlightBtn) {
        highlightBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            
            // Ak bol zapnutý izolačný režim, vypneme ho
            if (isolationMode) {
                isolationMode = false;
                isolatedNodeId = null;
                const isolateBtn = document.getElementById('isolateNodeBtn');
                if (isolateBtn) {
                    isolateBtn.innerHTML = '<span class="text-xs">👁️</span>';
                    isolateBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
                    isolateBtn.classList.add('bg-green-500', 'hover:bg-green-600');
                    isolateBtn.title = 'Izolovať uzol (zobraziť len spojenia)';
                }
                
                // Obnovíme normálne zobrazenie (pred aplikovaním zvýraznenia)
                node.style('opacity', 1);
                node.style('pointer-events', 'all');
                link.style('opacity', 1);
            }
            
            sequenceHighlightEnabled = !sequenceHighlightEnabled;
            
            if (sequenceHighlightEnabled) {
                highlightSequence();
                highlightBtn.innerHTML = '❌'; // Zmena na ❌
                highlightBtn.title = 'Vypnúť zvýraznenie sekvencie';
            } else {
                resetHighlight();
                highlightBtn.innerHTML = '🔗';
                highlightBtn.title = 'Zvýrazniť sekvenciu';
            }
        });
    }
}

function initGraphSearch(nodes, patterns, similarityMatrix, selectNodeCallback, svg, zoom, width, height) {
    const searchContainer = document.getElementById('graphSearchContainer');
    const searchToggle = document.getElementById('graphSearchToggle');
    const searchInput = document.getElementById('graphSearchInput');
    const searchResults = document.getElementById('graphSearchResults');
    
    if (!searchContainer || !searchToggle || !searchInput || !searchResults) return;
    
    // Rozbalenie/zbalenie pri kliknutí na lupu
    searchToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isExpanded = searchContainer.style.width !== '2.5rem';
        
        if (isExpanded) {
            // Zbalenie
            searchContainer.style.width = '2.5rem';
            searchInput.classList.remove('w-48', 'opacity-100', 'px-3');
            searchInput.classList.add('w-0', 'opacity-0', 'px-0');
            searchResults.classList.add('hidden');
            searchInput.value = '';
        } else {
            // Rozbalenie
            searchContainer.style.width = '16rem'; // w-64
            searchInput.classList.remove('w-0', 'opacity-0', 'px-0');
            searchInput.classList.add('w-48', 'opacity-100', 'px-3');
            searchInput.focus();
        }
    });
    
    // Zatvorenie pri kliknutí mimo
    document.addEventListener('click', (e) => {
        if (!searchContainer.contains(e.target) && !searchResults.contains(e.target)) {
            searchContainer.style.width = '2.5rem';
            searchInput.classList.remove('w-48', 'opacity-100', 'px-3');
            searchInput.classList.add('w-0', 'opacity-0', 'px-0');
            searchResults.classList.add('hidden');
            searchInput.value = '';
        }
    });
    
    // Vyhľadávanie pri písaní
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }
        
        const matches = nodes.filter(node => 
            node.name.toLowerCase().includes(query)
        ).slice(0, 10);
        
        if (matches.length === 0) {
            searchResults.classList.add('hidden');
            return;
        }
        
        searchResults.innerHTML = '';
        matches.forEach(node => {
            const resultItem = document.createElement('div');
            resultItem.className = 'px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-0';
            resultItem.innerHTML = `
                <div class="font-medium text-sm">${node.name}</div>
                <div class="text-xs text-gray-500 dark:text-gray-400">${node.catalog} ${node.language ? '· ' + node.language : ''}</div>
            `;
            
            resultItem.addEventListener('click', () => {
                selectNodeCallback(node, false);
                searchContainer.style.width = '2.5rem';
                searchInput.classList.remove('w-48', 'opacity-100', 'px-3');
                searchInput.classList.add('w-0', 'opacity-0', 'px-0');
                searchResults.classList.add('hidden');
                searchInput.value = '';
            });
            
            searchResults.appendChild(resultItem);
        });
        
        searchResults.classList.remove('hidden');
    });
    
    // Zatvorenie výsledkov pri stlačení Escape
    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            searchContainer.style.width = '2.5rem';
            searchInput.classList.remove('w-48', 'opacity-100', 'px-3');
            searchInput.classList.add('w-0', 'opacity-0', 'px-0');
            searchResults.classList.add('hidden');
            searchInput.value = '';
        }
    });
}

// Funkcia pre zobrazenie informácií o uzle
function showNodeInfo(nodeData, patterns, similarityMatrix) {
    const infoPanel = document.getElementById('nodeInfoPanel');
    const infoTitle = document.getElementById('nodeInfoTitle');
    const infoContent = document.getElementById('nodeInfoContent');
    
    // Nájdeme pattern podľa ID (filename)
    const pattern = patterns.find(p => p.filename === nodeData.id);
    
    // Získať top 3 najsilnejšie spojenia
    const connections = [];
    patterns.forEach((p, index) => {
        if (p.filename !== nodeData.id) {
            const similarity = similarityMatrix[nodeData.id]?.[p.filename] || 0;
            if (similarity > 0) {
                connections.push({
                    name: p.name,
                    similarity: similarity
                });
            }
        }
    });
    
    // Zoradiť podľa podobnosti (od najväčšej)
    connections.sort((a, b) => b.similarity - a.similarity);
    
    // Vziať top 3
    const topConnections = connections.slice(0, 3);
    
    // Zistenie katalógu a jazyka
    let catalogName = 'C & H';
    let isUserCatalog = false;
    let languageName = '';

    if (pattern) {
        if (pattern.catalogName) {
            // Vzor z user katalógu
            catalogName = pattern.catalogName;
            isUserCatalog = true;
            // language je názov subfoldra
            if (pattern.language && pattern.language !== 'Ostatné') {
                languageName = pattern.language;
            }
        } else if (pattern.language) {
            // Coplien vzor
            languageName = pattern.language.replace(/_/g, ' ');
        }
    }
    
    // Aktualizovať panel
    infoTitle.textContent = nodeData.name;
    infoContent.innerHTML = '';
    
    // Pridáme informácie o katalógu a prípadne jazyku - kompaktné, bez zbytočných medzier
    const catalogInfo = document.createElement('div');
    catalogInfo.className = 'mb-2'; // Zmenšené z mb-3 na mb-2
    
    let catalogHtml = `
        <div class="flex items-center gap-1 text-xs">
            <span class="px-2 py-0.5 rounded-full text-xs font-medium 
                ${!isUserCatalog 
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                    : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}">
                ${catalogName}
            </span>
        </div>
    `;
    
    // Pre Coplien katalóg pridáme aj jazyk - kompaktne bez extra medzery
    if (languageName) {
        catalogHtml += `
            <div class="flex items-center gap-1 text-xs">
                <span class="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 text-xs font-medium">
                    ${languageName}
                </span>
            </div>
        `;
    }
    
    catalogInfo.innerHTML = catalogHtml;
    infoContent.appendChild(catalogInfo);
    
    // Rovno pridáme top spojenia - bez nadpisu, bez zbytočných medzier
    if (topConnections.length > 0) {
        topConnections.forEach((conn, index) => {
            const item = document.createElement('div');
            // Prvý prvok nemá border-top, posledný nemá border-bottom
            const borderClass = index < topConnections.length - 1 ? 'border-b border-gray-100 dark:border-gray-700' : '';
            item.className = `flex justify-between items-center py-1 ${borderClass}`;
            item.innerHTML = `
                <span class="text-gray-600 dark:text-gray-400 text-xs truncate mr-2" title="${conn.name}">${conn.name}</span>
                <span class="font-medium text-green-600 dark:text-green-400 text-xs whitespace-nowrap">${(conn.similarity * 100).toFixed(1)}%</span>
            `;
            infoContent.appendChild(item);
        });
    } else {
        const noConnections = document.createElement('div');
        noConnections.className = 'text-gray-500 dark:text-gray-400 text-xs italic';
        noConnections.textContent = 'Žiadne spojenia s podobnosťou > 0%';
        infoContent.appendChild(noConnections);
    }
    
    infoPanel.classList.remove('hidden');
}



window.updateGraphSearchPlaceholder = function() {
    const searchInput = document.getElementById('graphSearchInput');
    if (searchInput) {
        const t = window.translations?.[window.currentLanguage];
        searchInput.placeholder = t.searchPlaceholder;
    }
};