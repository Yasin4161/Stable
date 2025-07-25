import { useState } from 'react';

function App() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateImage() {
    setLoading(true);
    setImageUrl('');

    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-v1-6/text-to-image', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${import.meta.env.VITE_STABILITY_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        text_prompts: [{ text: prompt }],
        cfg_scale: 7,
        height: 512,
        width: 512,
        samples: 1,
        steps: 30,
      }),
    });

    const data = await response.json();
    const base64 = data.artifacts?.[0]?.base64;

    if (base64) {
      setImageUrl(`data:image/png;base64,${base64}`);
    }

    setLoading(false);
  }

  return (
    <div>
      <h1>Stable Diffusion Görsel Oluşturucu</h1>
      <input
        type="text"
        value={prompt}
        placeholder="Örnek: bir uzay kovboyu ayda yürüyor"
        onChange={(e) => setPrompt(e.target.value)}
      />
      <br />
      <button onClick={generateImage} disabled={loading}>
        {loading ? 'Oluşturuluyor...' : 'Resmi Oluştur'}
      </button>

      {imageUrl && (
        <div>
          <img src={imageUrl} alt="Oluşturulan Görsel" />
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
