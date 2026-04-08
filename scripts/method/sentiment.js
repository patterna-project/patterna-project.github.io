//method/sentiment.js

// Slovník sentimentov pre anglické slová (rozšírený)
const sentimentLexicon = {
    // Pozitívne slová
    'good': 0.6, 'great': 0.8, 'excellent': 0.9, 'awesome': 0.9, 'amazing': 0.9,
    'best': 0.8, 'better': 0.7, 'improve': 0.6, 'improved': 0.6, 'improvement': 0.6,
    'success': 0.7, 'successful': 0.7, 'effective': 0.6, 'efficient': 0.6,
    'easy': 0.5, 'simple': 0.5, 'clear': 0.5, 'stable': 0.5, 'robust': 0.6,
    'flexible': 0.6, 'adaptable': 0.6, 'reusable': 0.6, 'maintainable': 0.6,
    'scalable': 0.6, 'reliable': 0.6, 'safe': 0.5, 'secure': 0.6,
    'benefit': 0.6, 'advantage': 0.6, 'opportunity': 0.5, 'valuable': 0.6,
    'important': 0.5, 'significant': 0.5, 'key': 0.4, 'core': 0.4,
    'support': 0.5, 'help': 0.5, 'facilitate': 0.5, 'enable': 0.5,
    'allow': 0.4, 'encourage': 0.6, 'promote': 0.6, 'foster': 0.6,
    'like': 0.4, 'love': 0.8, 'enjoy': 0.6, 'pleasure': 0.6,
    'happy': 0.7, 'glad': 0.6, 'delighted': 0.8, 'satisfied': 0.6,
    'thank': 0.6, 'thanks': 0.6, 'grateful': 0.7, 'appreciate': 0.6,
    'win': 0.7, 'winner': 0.7, 'victory': 0.8, 'triumph': 0.8,
    'perfect': 0.9, 'ideal': 0.7, 'optimal': 0.6, 'superb': 0.8,
    'outstanding': 0.8, 'remarkable': 0.7, 'notable': 0.6,
    'positive': 0.7, 'optimistic': 0.6, 'confident': 0.6,
    'agree': 0.4, 'correct': 0.5, 'right': 0.5, 'true': 0.4,

    // Negatívne slová
    'bad': -0.6, 'worse': -0.7, 'worst': -0.8, 'terrible': -0.8, 'awful': -0.8,
    'poor': -0.5, 'weak': -0.5, 'fragile': -0.5, 'brittle': -0.5,
    'fail': -0.7, 'failed': -0.7, 'failure': -0.7, 'problem': -0.5,
    'issue': -0.4, 'bug': -0.5, 'error': -0.5, 'mistake': -0.5,
    'difficult': -0.5, 'hard': -0.4, 'complex': -0.3, 'complicated': -0.4,
    'confusing': -0.5, 'unclear': -0.4, 'ambiguous': -0.4,
    'risk': -0.4, 'danger': -0.5, 'dangerous': -0.6, 'unsafe': -0.6,
    'vulnerable': -0.5, 'exposed': -0.4, 'threat': -0.6,
    'lack': -0.4, 'missing': -0.4, 'absent': -0.4, 'without': -0.3,
    'cannot': -0.3, 'can\'t': -0.3, 'unable': -0.4,
    'against': -0.3, 'oppose': -0.4, 'opposed': -0.4, 'disagree': -0.4,
    'wrong': -0.5, 'false': -0.5, 'incorrect': -0.5, 'invalid': -0.5,
    'hate': -0.7, 'dislike': -0.5, 'upset': -0.5, 'sad': -0.6,
    'unhappy': -0.6, 'disappointed': -0.6, 'frustrated': -0.6,
    'annoying': -0.5, 'irritating': -0.5, 'troublesome': -0.5,
    'break': -0.5, 'broken': -0.6, 'crash': -0.6, 'corrupt': -0.6,
    'deadlock': -0.6, 'stuck': -0.5, 'block': -0.4, 'blocked': -0.4,
    'limit': -0.3, 'limited': -0.4, 'restrict': -0.4, 'restricted': -0.4,
    'constraint': -0.4, 'constrained': -0.4, 'bottleneck': -0.5,
    'overhead': -0.3, 'costly': -0.5, 'expensive': -0.5,
    'critical': -0.3, 'severe': -0.5, 'serious': -0.4,
    'warning': -0.3, 'caution': -0.3, 'careful': -0.2,
    'negative': -0.6, 'pessimistic': -0.5, 'uncertain': -0.4,
    'doubt': -0.3, 'doubtful': -0.4, 'questionable': -0.4
};

// Intenzifikátory (zvyšujú intenzitu)
const intensifiers = {
    'very': 0.3, 'extremely': 0.5, 'absolutely': 0.5, 'completely': 0.4,
    'totally': 0.4, 'utterly': 0.5, 'highly': 0.4, 'deeply': 0.4,
    'really': 0.3, 'so': 0.2, 'such': 0.2, 'quite': 0.2,
    'rather': 0.2, 'pretty': 0.2, 'fairly': 0.1, 'somewhat': 0.1
};

// Negácie (obracajú znamienko)
const negations = new Set([
    'not', 'no', 'never', 'none', 'nothing', 'nowhere',
    'neither', 'nor', 'cannot', 'can\'t', 'don\'t', 'doesn\'t',
    'didn\'t', 'won\'t', 'wouldn\'t', 'couldn\'t', 'shouldn\'t',
    'isn\'t', 'aren\'t', 'wasn\'t', 'weren\'t', 'haven\'t', 'hasn\'t',
    'hadn\'t', 'without', 'lacks', 'missing'
]);

// Funkcia na výpočet sentiment skóre pre text
function calculateSentimentScore(text) {
    // Normalizácia textu
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 2);
    
    let totalScore = 0;
    let wordCount = 0;
    let negationActive = false;
    let intensifierMultiplier = 1.0;
    
    for (let i = 0; i < words.length; i++) {
        const word = words[i];
        
        // Kontrola negácie
        if (negations.has(word)) {
            negationActive = !negationActive; // prepínač
            continue;
        }
        
        // Kontrola intenzifikátora
        if (intensifiers[word] !== undefined) {
            intensifierMultiplier = 1.0 + intensifiers[word];
            continue;
        }
        
        // Kontrola sentiment slova
        if (sentimentLexicon[word] !== undefined) {
            let wordScore = sentimentLexicon[word];
            
            // Aplikujeme negáciu
            if (negationActive) {
                wordScore = -wordScore;
            }
            
            // Aplikujeme intenzifikátor
            wordScore *= intensifierMultiplier;
            
            totalScore += wordScore;
            wordCount++;
            
            // Reset intenzifikátora (platí len pre nasledujúce slovo)
            intensifierMultiplier = 1.0;
        }
    }
    
    // Priemerné skóre (aby texty s rôznou dĺžkou boli porovnateľné)
    const avgScore = wordCount > 0 ? totalScore / wordCount : 0;
    
    // Normalizácia do rozsahu -1 až 1 (ale v našom prípade necháme tak)
    return Math.max(-1, Math.min(1, avgScore));
}

// Funkcia na získanie sentimentu pre všetky vzory
function getSentimentScores(patterns) {
    const scores = {};
    patterns.forEach(pattern => {
        scores[pattern.filename] = calculateSentimentScore(pattern.content);
    });
    return scores;
}

// Export do globálneho priestoru
window.getSentimentScores = getSentimentScores;
window.calculateSentimentScore = calculateSentimentScore;