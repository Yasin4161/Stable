const ENGINE = process.env.STABILITY_ENGINE_ID || 'stable-diffusion-xl-1024-v1-0';
const ALLOWED_SIZES = [
  [1024, 1024], [1152, 896], [1216, 832],
  [1344, 768],  [1536, 640], [896, 1152],
  [832, 1216],  [768, 1344], [640, 1536],
];
const isAllowed = (w, h) => ALLOWED_SIZES.some(([aw, ah]) => aw === w && ah === h);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Yalnızca POST.' });

  const { prompt, width, height, cfg, steps, samples } = req.body || {};
  if (!prompt?.trim()) return res.status(400).json({ message: 'prompt zorunlu.' });

  const W = +width  || 1024;
  const H = +height || 1024;
  if (!isAllowed(W, H)) return res.status(400).json({ message: `Geçersiz boyut ${W}x${H}` });

  const CFG     = Math.min(Math.max(+cfg     || 7, 1), 15);
  const STEPS   = Math.min(Math.max(+steps   || 30, 10), 60);
  const SAMPLES = Math.min(Math.max(+samples || 1, 1), 30);

  const apiKey = process.env.STABILITY_API_KEY;
  if (!apiKey) return res.status(500).json({ message: 'STABILITY_API_KEY yok.' });

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
          steps: STEPS,
          samples: SAMPLES,
        }),
      }
    );

    const raw = await rsp.text();
    let data;
    try { data = JSON.parse(raw); }
    catch { return res.status(rsp.status).json({ message: raw }); }

    if (!rsp.ok)
      return res.status(rsp.status).json({ message: data?.message || 'API hata', details: data });

    const arr = (data.artifacts || []).map(a => a.base64).filter(Boolean);
    if (!arr.length) return res.status(500).json({ message: 'Görsel verisi yok.' });

    return res.status(200).json({ base64Arr: arr });
  } catch (e) {
    return res.status(500).json({ message: String(e) });
  }
}
