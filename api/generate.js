
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Sadece POST istekleri desteklenir.' });
  }

  const { prompt } = req.body || {};
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: 'prompt zorunludur.' });
  }

  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'STABILITY_API_KEY tanımlı değil.' });
  }

  try {
    const response = await fetch(
      'https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height: 512,
          width: 512,
          samples: 1,
          steps: 30,
        }),
      }
    );

    const raw = await response.text();
    let data;
    try {
      data = JSON.parse(raw);
    } catch {
      return res.status(response.status).json({ message: raw });
    }

    if (!response.ok) {
      return res.status(response.status).json({ message: data?.message || 'API hata' });
    }

    const base64 = data?.artifacts?.[0]?.base64;
    if (!base64) {
      return res.status(500).json({ message: 'Görsel base64 verisi bulunamadı.' });
    }

    return res.status(200).json({ base64 });
  } catch (err) {
    return res.status(500).json({ message: String(err) });
  }
}
