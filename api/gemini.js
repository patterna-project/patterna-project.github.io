// api/gemini.js
export default async function handler(req, res) {
    // Povoliť CORS pre všetky potrebné domény
    const allowedOrigins = [
        'https://patterna-project.github.io',
        'https://patterna-project-github-io.vercel.app',
        'http://localhost:5500',
        'http://127.0.0.1:5500'
    ];
    
    // Ak request prichádza z allowed origin, nastavíme ho
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    } else {
        // Pre prípad, že by prišiel z inej (napr. Vercel preview)
        res.setHeader('Access-Control-Allow-Origin', '*'); // Dočasne
    }
    
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Preflight OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    // Len POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = process.env.GEMINI_API_KEY; // Z environment variables!

    if (!API_KEY) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(req.body)
            }
        );

        const data = await response.json();
        res.status(response.status).json(data);
        
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
