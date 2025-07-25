import { useState } from 'react';

const ALLOWED_SIZES = [
  [1024, 1024], [1152, 896], [1216, 832],
  [1344, 768],  [1536, 640], [896, 1152],
  [832, 1216],  [768, 1344], [640, 1536],
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [wh, setWh]         = useState('1024x1024');
  const [cfg, setCfg]       = useState(7);
  const [steps, setSteps]   = useState(30);
  const [samples, setSamples] = useState(1);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setErr(''); setImages([]);

    const [width, height] = wh.split('x').map(Number);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width, height, cfg, steps, samples }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Hata');
      setImages(data.base64Arr.map(b64 => `data:image/png;base64,${b64}`));
    } catch (e) { setErr(e.message); }
    finally { setLoading(false); }
  };

  return (
    <div id="app-card">
      <h1>Stable Diffusion Görsel Üretici</h1>

      <input
        type="text"
        placeholder="Örn: 80'ler neon şehir, yağmurlu gece..."
        value={prompt}
        onChange={e => setPrompt(e.target.value)}
      />

      <div className="control-row">
        <label>
          Çözünürlük
          <select value={wh} onChange={e => setWh(e.target.value)}>
            {ALLOWED_SIZES.map(([w, h]) => (
              <option key={`${w}x${h}`}>{`${w}x${h}`}</option>
            ))}
          </select>
        </label>

        <label>
          CFG
          <input
            type="number" min={1} max={15} step={0.5}
            value={cfg} onChange={e => setCfg(+e.target.value)}
          />
        </label>

        <label>
          Steps
          <input
            type="number" min={10} max={60} step={1}
            value={steps} onChange={e => setSteps(+e.target.value)}
          />
        </label>

        <label>
          Adet (1‑30)
          <input
            type="number" min={1} max={30}
            value={samples} onChange={e => setSamples(+e.target.value)}
          />
        </label>
      </div>

      <button onClick={handleGenerate} disabled={loading}>
        {loading ? 'Oluşturuluyor…' : 'Görselleri Oluştur'}
      </button>

      {err && <div id="error">{err}</div>}

      <div id="gallery">
        {images.map((src, i) => (
          <img key={i} src={src} alt={`görsel-${i}`} />
        ))}
      </div>
    </div>
  );
}
