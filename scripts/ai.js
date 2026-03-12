//ai.js

let aiEvaluationInProgress = false;

async function evaluateWithAI(sequence, similarityMatrix) {
    if (aiEvaluationInProgress) return;
    
    const aiContainer = document.getElementById('aiConfidenceContainer');
    const aiValue = document.getElementById('aiConfidenceValue');
    const aiExplanation = document.getElementById('aiExplanation');
    const t = translations[currentLanguage];
    
    try {
        aiEvaluationInProgress = true;
        aiContainer.classList.remove('hidden');
        aiValue.textContent = '⏳ Analýza...';
        aiValue.style.background = 'transparent';
        aiValue.style.color = 'inherit';
        aiValue.style.border = 'none';
        aiExplanation.classList.add('hidden');
        
        // Pripravíme prompt - dáme viac textu
        const patternsText = sequence.map((p, index) => {
            // Vezmeme prvých 800 znakov (celý prvý odstavec a kúsok)
            const fullText = p.content;
            
            // Nájdeme koniec prvej vety alebo odstavca
            let endIndex = fullText.indexOf('\n\n');
            if (endIndex === -1) endIndex = fullText.indexOf('. ', 300);
            if (endIndex === -1) endIndex = Math.min(800, fullText.length);
            
            const relevantText = fullText.substring(0, endIndex);
            
            return `${index + 1}. ${p.name}
Popis: ${relevantText}...
`;
        }).join('\n---\n');
        
        // Pridáme aj maticu podobností pre lepšie hodnotenie
        const similaritiesText = [];
        for (let i = 0; i < sequence.length - 1; i++) {
            const sim = similarityMatrix[sequence[i].filename]?.[sequence[i+1].filename] || 0;
            similaritiesText.push(`${sequence[i].name} → ${sequence[i+1].name}: ${(sim*100).toFixed(1)}%`);
        }
        
        const prompt = currentLanguage === 'sk' 
            ? `Si expert na softvérové vzory a ich vzájomné vzťahy. Analyzuj túto sekvenciu vzorov a ohodnoť ju na škále 0-100 podľa toho, ako logicky na seba nadväzujú a ako spolu súvisia.

SEKVEČNIA VZOROV (v poradí):
${patternsText}

PODOBNOSTI MEDZI PO SEBE IDÚCIMI VZORMI:
${similaritiesText.join('\n')}

ZADANIE:
1. Ohodnoť sekvenciu na 0-100 podľa logickej nadväznosti
2. Vysvetli, ktoré prechody sú silné a ktoré slabé
3. Navrhni, či by sa dalo poradie vylepšiť

Odpovedaj PRESNE v tomto formáte:
"SKÓRE: 75
VYSVETLENIE: (tvoje vysvetlenie)"

Príklad:
"SKÓRE: 85
VYSVETLENIE: Sekvencia začína silne prepojením medzi vzormi A a B. Prechod medzi C a D je slabší, ale celkovo dáva zmysel."

Tvoje hodnotenie:`
            : `You are an expert on software patterns and their relationships. Analyze this sequence of patterns and rate it on a scale 0-100 based on how logically they follow each other and how they relate.

PATTERN SEQUENCE (in order):
${patternsText}

SIMILARITIES BETWEEN CONSECUTIVE PATTERNS:
${similaritiesText.join('\n')}

TASK:
1. Rate the sequence 0-100 based on logical coherence
2. Explain which transitions are strong and which are weak
3. Suggest if the order could be improved

Answer EXACTLY in this format:
"SCORE: 75
EXPLANATION: (your explanation)"

Example:
"SCORE: 85
EXPLANATION: The sequence starts with strong connections between patterns A and B. The transition between C and D is weaker, but overall it makes sense."

Your evaluation:`;
        
        console.log('Volám Gemini API s promptom (dĺžka:', prompt.length, 'znakov)');
        
        // Opravený model: "gemini-1.5-pro" namiesto "gemini-pro"
        const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDft9DT_d3H-ct0Pex7firbrPvB2E_SCxA', {
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
                    maxOutputTokens: 500,
                }
            })
        });
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('API error response:', errorText);
            
            // Skúsime fallback na gemini-1.0-pro
            console.log('Skúšam fallback na gemini-1.0-pro...');
            const fallbackResponse = await fetch('https://generativelanguage.googleapis.com/v1/models/gemini-1.0-pro:generateContent?key=AIzaSyANkB8jIR3fFMojyH0aDqh4vVvdBXgNE5o', {
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
                        maxOutputTokens: 500,
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
        
        if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
            throw new Error('Neočakávaná odpoveď od API');
        }
        
        const aiResponse = data.candidates[0].content.parts[0].text;
        
        // Parseujeme odpoveď
        const scoreMatch = aiResponse.match(/\b(\d{1,3})\b/);
        let score = 50;
        let explanation = aiResponse;
        
        if (scoreMatch) {
            score = parseInt(scoreMatch[0]);
            // Odstránime "SCORE: X" z vysvetlenia
            explanation = aiResponse
                .replace(/SCORE:\s*\d{1,3}/i, '')
                .replace(/SKÓRE:\s*\d{1,3}/i, '')
                .replace(/EXPLANATION:\s*/i, '')
                .replace(/VYSVETLENIE:\s*/i, '')
                .replace(/[:\s]/g, ' ')
                .trim();
        }
        
        score = Math.min(100, Math.max(0, score));
        
        console.log(`Parsed score: ${score}`);
        
        // Zobrazíme skóre
        const colors = getConfidenceColor(score);
        aiValue.textContent = score + '%';
        aiValue.style.background = colors.bg;
        aiValue.style.color = colors.text;
        aiValue.style.borderColor = colors.border;
        aiValue.style.borderWidth = '1px';
        aiValue.style.borderStyle = 'solid';
        
        aiExplanation.textContent = explanation;
        aiExplanation.classList.remove('hidden');
        
    } catch (error) {
        console.error('AI evaluation failed:', error);
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