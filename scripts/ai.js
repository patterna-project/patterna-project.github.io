// ai.js - NA ZAČIATOK SÚBORU
// Proxy URL pre Vercel (bez API kľúča!)
const GEMINI_API_PROXY = 'https://patterna-project-github-io.vercel.app/api/gemini';

let aiEvaluationInProgress = false;

// Na začiatok súboru, k ostatným premenným
let currentAIController = null;

window.cancelAICall = function() {
    if (currentAIController) {
        currentAIController.abort();
        currentAIController = null;
        aiEvaluationInProgress = false;
        console.log('🛑 Zrušené predchádzajúce AI volanie');
    }
};

async function evaluateWithAI(sequence, similarityMatrix) {


    if (window.cancelAICall) {
        window.cancelAICall();
        // Počkáme na dokončenie zrušenia
        await new Promise(resolve => setTimeout(resolve, 50));
    }
        
    const aiContainer = document.getElementById('aiConfidenceContainer');
    const aiValue = document.getElementById('aiConfidenceValue');
    const aiValueButton = document.getElementById('aiValueButton');
    const aiExplanation = document.getElementById('aiExplanation');
    const aiTooltip = document.getElementById('aiConfidenceTooltip');
    const t = translations[currentLanguage];
    
    try {
        aiEvaluationInProgress = true;
        aiContainer.classList.remove('hidden');
        
        // Pridáme animované hodinky
        aiValue.innerHTML = '<span class="loading-spinner">⏳</span>';
        aiValue.classList.add('loading-active');

        // Pridáme CSS animáciu (ak ešte neexistuje)
        if (!document.querySelector('#ai-spinner-style')) {
            const style = document.createElement('style');
            style.id = 'ai-spinner-style';
            style.textContent = `
                .loading-spinner {
                    display: inline-block;
                    animation: spin 1s ease-in-out infinite;
                    font-size: 1.2rem;
                    line-height: 1;
                }
                
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
                
                .loading-active {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                }
            `;
            document.head.appendChild(style);
        }
        
        // Reset štýlov pre loading
        if (aiValueButton) {
            aiValueButton.style.background = 'transparent';
            aiValueButton.style.color = 'inherit';
            aiValueButton.style.border = 'none';
        }
        
        aiExplanation.classList.add('hidden');
        
        // --- CELÝ TEXT každého vzoru (nie skrátený) ---
        const patternsText = sequence.map((p, index) => {
            return `${index + 1}. ${p.name}
CELÝ TEXT VZORU:
${p.content}
`;
        }).join('\n' + '='.repeat(50) + '\n\n');
        
        const similaritiesText = [];
        for (let i = 0; i < sequence.length - 1; i++) {
            const sim = similarityMatrix[sequence[i].filename]?.[sequence[i+1].filename] || 0;
            similaritiesText.push(`${sequence[i].name} → ${sequence[i+1].name}: ${(sim*100).toFixed(1)}%`);
        }
        
        const prompt = currentLanguage === 'sk' 
            ? `Si expert na softvérové vzory a ich vzájomné vzťahy. Analyzuj túto sekvenciu vzorov a ohodnoť ju na škále 0-100 podľa toho, ako logicky na seba nadväzujú a ako spolu súvisia.

MÁŠ K DISPOZÍCII CELÝ TEXT KAŽDÉHO VZORU, takže môžeš urobiť hĺbkovú analýzu.

SEKVEČNIA VZOROV (v poradí):
${patternsText}

PODOBNOSTI MEDZI PO SEBE IDÚCIMI VZORMI:
${similaritiesText.join('\n')}

ZADANIE:
1. Ohodnoť sekvenciu na 0-100 podľa logickej nadväznosti
2. Vysvetli, ktoré prechody sú silné a ktoré slabé - použi konkrétne detaily z textov vzorov
3. Navrhni, či by sa dalo poradie vylepšiť

Dôležité: Lepšie je byť mierne benevolentný než príliš kritický.

Odpovedaj PRESNE v tomto formáte:
"SKÓRE: 75
VYSVETLENIE: (tvoje podrobné vysvetlenie)"

Tvoje hodnotenie:`
            : `You are an expert on software patterns and their relationships. Analyze this sequence of patterns and rate it on a scale 0-100 based on how logically they follow each other and how they relate.

YOU HAVE THE FULL TEXT OF EACH PATTERN, so you can do a deep analysis.

PATTERN SEQUENCE (in order):
${patternsText}

SIMILARITIES BETWEEN CONSECUTIVE PATTERNS:
${similaritiesText.join('\n')}

TASK:
1. Rate the sequence 0-100 based on logical coherence
2. Explain which transitions are strong and which are weak - use specific details from the pattern texts
3. Suggest if the order could be improved

IMPORTANT: It's better to be slightly benevolent than overly critical.

Answer EXACTLY in this format:
"SCORE: 75
EXPLANATION: (your detailed explanation)"

Your evaluation:`;
        
        console.log('Volám Vercel proxy s promptom (dĺžka:', prompt.length, 'znakov)');
        
        // Vytvoríme nový controller pre toto volanie
        currentAIController = new AbortController();

        // Voláme Vercel proxy namiesto priameho Gemini API
        const response = await fetch(GEMINI_API_PROXY, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            signal: currentAIController.signal,
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 8192,
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Proxy error response:', errorText);
            throw new Error(`Proxy error: ${response.status}`);
        }
        
        const data = await response.json();
        
        console.log('Proxy response received');
        
        // --- PARSOVANIE ODPOVEDE ---
        let aiResponse = '';
        
        if (data.candidates && data.candidates[0]) {
            if (data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                aiResponse = data.candidates[0].content.parts[0].text;
            } else if (data.candidates[0].output) {
                aiResponse = data.candidates[0].output;
            }
        }
        
        if (!aiResponse) {
            console.error('Neočakávaná štruktúra odpovede:', data);
            throw new Error('Nepodarilo sa načítať odpoveď od AI');
        }
        
        console.log('AI response:', aiResponse);
        
        // --- PARSOVANIE SKÓRE ---
        let score = 50;
        let explanation = aiResponse;
        
        const scoreMatch = aiResponse.match(/\b(\d{1,3})\b/);
        if (scoreMatch) {
            score = parseInt(scoreMatch[0]);
            
            const explanationMatch = aiResponse.match(/(?:VYSVETLENIE|EXPLANATION):\s*([\s\S]*)/i);
            if (explanationMatch && explanationMatch[1]) {
                explanation = explanationMatch[1].trim();
            } else {
                const lines = aiResponse.split('\n');
                if (lines.length > 1) {
                    lines.shift();
                    explanation = lines.join('\n').trim();
                }
            }
        }
        
        if (!explanation || explanation.length < 10) {
            explanation = aiResponse;
        }
        
        score = Math.min(100, Math.max(0, score));
        
        console.log(`Parsed score: ${score}`);
        console.log(`Explanation length: ${explanation.length} znakov`);
        
        // Odstránime spinner
        if (aiValue) {
            aiValue.classList.remove('loading-active');
        }
        
        // ROVNAKÝ ŠTÝL AKO PRE CELKOVÚ SPOĽAHLIVOSŤ
        const colors = getConfidenceColor(score);
        
        aiValue.textContent = score + '%';
        if (aiValueButton) {
            aiValueButton.style.background = colors.bg;
            aiValueButton.style.color = colors.text;
            aiValueButton.style.borderColor = colors.border;
            aiValueButton.style.borderWidth = '1px';
            aiValueButton.style.borderStyle = 'solid';
            aiValueButton.style.borderRadius = '9999px';
            aiValueButton.style.padding = '0.35rem 0.9rem';
            aiValueButton.style.display = 'inline-flex';
            aiValueButton.style.alignItems = 'center';
            aiValueButton.style.justifyContent = 'center';
            aiValueButton.style.minWidth = '70px';
            aiValueButton.style.lineHeight = '1.2';
        }
        
        // Formátovanie pre modal
        const formattedExplanation = explanation
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            .replace(/\n/g, '<br>');
        
        aiExplanation.innerHTML = formattedExplanation;
        
        // Event listener pre otvorenie modalu
        if (aiValueButton) {
            const newButton = aiValueButton.cloneNode(true);
            aiValueButton.parentNode.replaceChild(newButton, aiValueButton);
            
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const modal = document.getElementById('aiExplanationModal');
                const modalContent = document.getElementById('aiExplanationModalContent');
                
                if (modal && modalContent) {
                    modalContent.innerHTML = `
                        <div class="prose dark:prose-invert max-w-none custom-scrollbar" style="max-height: 60vh; overflow-y: auto; padding-right: 10px;">
                            ${formattedExplanation}
                        </div>
                    `;
                    modal.classList.remove('hidden');
                }
            });
        }
        
        // Tooltip
        if (aiTooltip) {
            aiTooltip.title = t.aiConfidenceTooltip || 
                (currentLanguage === 'sk' 
                    ? 'Hodnotenie od AI na základe analýzy textových opisov. Po kliknutí na skóre sa zobrazí podrobné vysvetlenie.'
                    : 'AI evaluation based on analysis of textual descriptions. Click on the score to see detailed explanation.');
        }
        
    } catch (error) {
        // Ak bolo volanie zrušené, ticho to ignorujeme
        if (error.name === 'AbortError') {
            console.log('⏹️ AI volanie bolo zrušené');
            return;
        }
        
        console.error('AI evaluation failed:', error);
        
        if (aiValue) {
            aiValue.classList.remove('loading-active');
        }
        aiContainer.classList.add('hidden');
        
        showToast(
            currentLanguage === 'sk' 
                ? 'AI hodnotenie momentálne nie je dostupné'
                : 'AI evaluation is currently unavailable',
            'warning'
        );
    } finally {
        currentAIController = null;
        aiEvaluationInProgress = false;
    }
}

// Event listener pre zatvorenie modalu
document.addEventListener('DOMContentLoaded', () => {
    const aiModal = document.getElementById('aiExplanationModal');
    const closeBtn = document.getElementById('closeAiExplanationModal');
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            aiModal?.classList.add('hidden');
        });
    }
    
    if (aiModal) {
        aiModal.addEventListener('click', (e) => {
            if (e.target === aiModal) {
                aiModal.classList.add('hidden');
            }
        });
    }
});
