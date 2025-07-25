import { useState } from 'react';

// SD-XL izinli boyutlar
const ALLOWED_SIZES = [
  [1024, 1024], [1152, 896], [1216, 832],
  [1344, 768],  [1536, 640], [896, 1152],
  [832, 1216],  [768, 1344], [640, 1536],
];

export default function App() {
  const [prompt, setPrompt] = useState('');
  const [width, setWidth]   = useState(1024);
  const [height, setHeight] = useState(1024);
  const [cfg, setCfg]       = useState(7);
  const [steps, setSteps]   = useState(30);

  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading]   = useState(false);
  const [err, setErr]           = useState('');

  const generate = async () => {
    if (!prompt.trim()) return;
    setLoading(true); setErr(''); setImageUrl('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, width, height, cfg, steps }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || 'Hata');
      setImageUrl(`data:image/png;base64,${data.base64}`);
    } catch (e) {
      setErr(e.message);
    } finally { setLoading(false); }
  };

  return (
    <div>
      <h1>Stable Diffusion Görsel Oluşturucu</h1>

      <input
        type="text"
        value={prompt}
        placeholder="Bir hayal kur: Cyberpunk İstanbul gece..."
        onChange={e => setPrompt(e.target.value)}
        style={{width: '90%', maxWidth: 480, padding: 12, borderRadius: 8, border: 'none', background: '#222', color:'#fff'}}
      />

      {/* Ayarlar */}
      <div className="control">
        <label>
          Çözünürlük&nbsp;
          <select
            value={`${width}x${height}`}
            onChange={e => {
              const [w, h] = e.target.value.split('x').map(Number);
              setWidth(w); setHeight(h);
            }}
          >
            {ALLOWED_SIZES.map(([w, h]) => (
              <option key={`${w}x${h}`}>{`${w}x${h}`}</option>
            ))}
          </select>
        </label>

        <label>
          CFG&nbsp;
          <input
            type="number"
            min={1} max={15} step={0.5}
            value={cfg}
            onChange={e => setCfg(Number(e.target.value))}
            style={{width: 70}}
          />
        </label>

        <label>
          Steps&nbsp;
          <input
            type="number"
            min={10} max={60} step={1}
            value={steps}
            onChange={e => setSteps(Number(e.target.value))}
            style={{width: 70}}
          />
        </label>
      </div>

      <button onClick={generate} disabled={loading}>
        {loading ? 'Oluşturuluyor…' : 'Resmi Oluştur'}
      </button>

      {err && <div className="error">{err}</div>}

      {imageUrl && (
        <>
          <img src={imageUrl} alt="Oluşturulan görsel" />
          <br />
          <a href={imageUrl} download="gorsel.png" style={{color:'#4ade80'}}>Resmi İndir</a>
        </>
      )}
    </div>
  );
}
