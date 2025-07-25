import { useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  async function generateImage() {
    if (!prompt.trim()) return;

    setLoading(true);
    setErr('');
    setImageUrl('');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Bilinmeyen hata');
      }

      if (data?.base64) {
        setImageUrl(`data:image/png;base64,${data.base64}`);
      } else {
        setErr('Beklenen formatta cevap gelmedi.');
      }
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Stable Diffusion Görsel Oluşturucu</h1>

      <input
        type="text"
        value={prompt}
        placeholder="Örn: ayda yürüyen bir astronot, sinematik ışık"
        onChange={(e) => setPrompt(e.target.value)}
      />
      <br />

      <button onClick={generateImage} disabled={loading}>
        {loading ? 'Oluşturuluyor...' : 'Resmi Oluştur'}
      </button>

      {err && <p style={{ color: 'red' }}>{err}</p>}

      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Oluşturulan görsel" />
          <br />
          <a href={imageUrl} download="gorsel.png" style={{ color: 'lime' }}>
            Resmi İndir
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
