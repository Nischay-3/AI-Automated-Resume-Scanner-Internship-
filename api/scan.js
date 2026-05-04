// api/scan.js — Vercel Serverless Function (Gemini Free API)
// Runs on Vercel's servers only — GEMINI_API_KEY is never exposed to users.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Add GEMINI_API_KEY to Vercel environment variables.' });
  }

  try {
    const { parts } = req.body;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 1500,
          }
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    // Extract text and return to browser
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
    res.status(200).json({ text });

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy request failed', details: err.message });
  }
}
