// api/generate.js
// Vercel sunucusundaki serverless fonksiyon – Stable Diffusion API çağrısı
export default async function handler(req, res) {
  // Yalnızca POST yöntemi
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Sadece POST istekleri desteklenir.' });
  }

  // İstek gövdesinden prompt al
  const { prompt } = req.body || {};
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ message: 'prompt zorunludur.' });
  }

  // Environment değişkeninden API anahtarını çek
  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ message: 'STABILITY_API_KEY tanımlı değil.' });
  }

  try {
    // Stable Diffusion API’sine istek
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

    // Dönüşü önce düz metin al
    const raw = await response.text();
    let data;
    try {
      // JSON ise parse et
      data = JSON.parse(raw);
    } catch {
      // JSON değilse olduğu gibi döndür
      return res.status(response.status).json({ message: raw });
    }

    // API hata kodu döndüyse ilet
    if (!response.ok) {
      return res.status(response.status).json({ message: data?.message || 'API hata' });
    }

    // Base64 görseli çek
    const base64 = data?.artifacts?.[0]?.base64;
    if (!base64) {
      return res.status(500).json({ message: 'Görsel base64 verisi bulunamadı.' });
    }

    // Başarı
    return res.status(200).json({ base64 });
  } catch (err) {
    // Sunucu tarafı hata
    return res.status(500).json({ message: String(err) });
  }
}
