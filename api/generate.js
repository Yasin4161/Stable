// api/generate.js
const ENGINE = process.env.STABILITY_ENGINE_ID || 'stable-diffusion-xl-1024-v1-0';

// SD-XL'ün izin verdiği boyutlar
const ALLOWED_SIZES = [
  [1024, 1024], [1152, 896], [1216, 832],
  [1344, 768],  [1536, 640], [896, 1152],
  [832, 1216],  [768, 1344], [640, 1536],
];

// Basit yardımcı fonk: boyut geçerli mi?
const isAllowedSize = (w, h) =>
  ALLOWED_SIZES.some(([aw, ah]) => aw === w && ah === h);

export default async function handler(req, res) {
  if (req.method !== 'POST')
    return res.status(405).json({ message: 'Sadece POST istekleri desteklenir.' });

  const { prompt, width, height, cfg, steps } = req.body || {};

  if (!prompt?.trim())
    return res.status(400).json({ message: 'prompt zorunludur.' });

  const W = Number(width)  || 1024;
  const H = Number(height) || 1024;

  if (!isAllowedSize(W, H))
    return res.status(400).json({ message: `Bu model için geçersiz boyut: ${W}x${H}` });

  const CFG   = Math.min(Math.max(Number(cfg)   || 7, 1), 15);
  const STEPS = Math.min(Math.max(Number(steps) || 30, 10), 60);

  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey)
    return res.status(500).json({ message: 'STABILITY_API_KEY tanımlı değil.' });

  try {
    const rsp = await fetch(
      `https://api.stability.ai/v1/generation/${ENGINE}/text-to-image`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          text_prompts: [{ text: prompt }],
          width: W,
          height: H,
          cfg_scale: CFG,
          samples: 1,
          steps: STEPS,
        }),
      },
    );

    const raw = await rsp.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { return res.status(rsp.status).json({ message: raw }); }

    if (!rsp.ok)
      return res.status(rsp.status).json({ message: data?.message || 'API hata', details: data });

    const base64 = data?.artifacts?.[0]?.base64;
    if (!base64)
      return res.status(500).json({ message: 'Görsel base64 verisi bulunamadı.' });

    return res.status(200).json({ base64 });
  } catch (err) {
    return res.status(500).json({ message: String(err) });
  }
}
