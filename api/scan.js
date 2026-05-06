// api/scan.js — Vercel Serverless Function (Groq Free API)
// Runs on Vercel's servers only — GROQ_API_KEY is never exposed to users.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured. Add GROQ_API_KEY to Vercel environment variables.' });
  }

  try {
    const { text } = req.body;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.3,
        max_tokens: 1500,
        messages: [{ role: 'user', content: text }]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data });
    }

    const result = data?.choices?.[0]?.message?.content || '';
    res.status(200).json({ text: result });

  } catch (err) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy request failed', details: err.message });
  }
}
