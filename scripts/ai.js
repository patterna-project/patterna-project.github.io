// ai.js - NA ZAČIATOK SÚBORU
// API kľúč sa načíta z config.js (vytvoreného pri nasadení)
const GEMINI_API_KEY = window.APP_CONFIG?.GEMINI_API_KEY || '';

// Ak nie je kľúč, vypíšeme warning
if (!GEMINI_API_KEY) {
    console.warn('⚠️ API kľúč nie je nastavený. AI hodnotenie nebude fungovať.');
}

let aiEvaluationInProgress = false;

async function evaluateWithAI(sequence, similarityMatrix) {
    // DEBUG: Vypíšeme, ktorú sekvenciu práve hodnotíme
    console.log('🔍 AI EVALUUJE TÚTO SEKVENCIU:');
    sequence.forEach((p, i) => {
        console.log(`  ${i+1}. ${p.name}`);
    });
    console.log('---');
    
    if (aiEvaluationInProgress) {
        console.log('⏳ AI už beží, preskakujem...');
        return;
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
        
        console.log('Volám Gemini API s promptom (dĺžka:', prompt.length, 'znakov)');
        
        // POUŽIJEME MAXIMÁLNY OUTPUT - 8192 tokenov
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
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
            console.error('API error response:', errorText);
            
            // Fallback
            console.log('Skúšam fallback na gemini-2.5-flash-lite...');
            const fallbackResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
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
            
            if (!fallbackResponse.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            var data = await fallbackResponse.json();
        } else {
            var data = await response.json();
        }
        
        console.log('Gemini response received');
        
        // --- NOVÉ, ROBUSTNEJŠIE PARCOVANIE ODPOVEDE ---
        let aiResponse = '';
        
        // Skúsime rôzne možné štruktúry odpovede
        if (data.candidates && data.candidates[0]) {
            if (data.candidates[0].content && data.candidates[0].content.parts && data.candidates[0].content.parts[0]) {
                aiResponse = data.candidates[0].content.parts[0].text;
            } else if (data.candidates[0].output) {
                // Alternatívny formát
                aiResponse = data.candidates[0].output;
            }
        }
        
        if (!aiResponse) {
            console.error('Neočakávaná štruktúra odpovede:', data);
            throw new Error('Nepodarilo sa načítať odpoveď od AI');
        }
        
        console.log('AI response:', aiResponse); // Pre debug
        
        // --- JEDNODUCHÉ PARCOVANIE ---
        let score = 50;
        let explanation = aiResponse;
        
        // Nájdeme skóre (prvé číslo v odpovedi)
        const scoreMatch = aiResponse.match(/\b(\d{1,3})\b/);
        if (scoreMatch) {
            score = parseInt(scoreMatch[0]);
            
            // Skúsime nájsť časť za "VYSVETLENIE:" alebo "EXPLANATION:"
            const explanationMatch = aiResponse.match(/(?:VYSVETLENIE|EXPLANATION):\s*([\s\S]*)/i);
            if (explanationMatch && explanationMatch[1]) {
                explanation = explanationMatch[1].trim();
            } else {
                // Ak nie je explicitné označenie, vezmeme všetko za prvým riadkom
                const lines = aiResponse.split('\n');
                if (lines.length > 1) {
                    // Odstránime prvý riadok (kde je skóre)
                    lines.shift();
                    explanation = lines.join('\n').trim();
                }
            }
        }
        
        // Ak je vysvetlenie prázdne, použijeme celú odpoveď
        if (!explanation || explanation.length < 10) {
            explanation = aiResponse;
        }
        
        score = Math.min(100, Math.max(0, score));
        
        console.log(`Parsed score: ${score}`);
        console.log(`Explanation length: ${explanation.length} znakov`); // Debug
        
        // Odstránime spinner a zobrazíme skóre
        if (aiValue) {
            aiValue.classList.remove('loading-active');
        }
        
        // ROVNAKÝ ŠTÝL AKO PRE CELKOVÚ SPOĽAHLIVOSŤ
        const colors = getConfidenceColor(score);
        
        // Aplikujeme štýly na tlačidlo
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
        
        // Uložíme vysvetlenie pre modal (ako HTML s <br> pre zachovanie riadkov)
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
            // Odstránime starý listener a pridáme nový
            const newButton = aiValueButton.cloneNode(true);
            aiValueButton.parentNode.replaceChild(newButton, aiValueButton);
            
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const modal = document.getElementById('aiExplanationModal');
                const modalContent = document.getElementById('aiExplanationModalContent');
                
                if (modal && modalContent) {
                    // Rovnaké formátovanie pre modal
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
        console.error('AI evaluation failed:', error);
        
        // V prípade chyby odstránime spinner a schováme container
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
