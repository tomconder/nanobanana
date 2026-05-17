import CSS from './style.css';

const HTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>nanobanana</title>
  <link rel="stylesheet" href="/style.css">
</head>
<body>
  <button id="theme-toggle" type="button" aria-label="Toggle theme">🌙</button>
  <h1>nano<span>banana</span></h1>
  <form id="form">
    <textarea id="prompt" placeholder="Describe an image..." required>A professional studio portrait of a woman with dramatic side lighting, wearing elegant jewelry</textarea>

    <div class="upload-area" id="drop-zone">
      <input type="file" id="file-input" accept="image/*">
      <p>Drop a reference photo or <span>click to upload</span> (optional)</p>
    </div>
    <div id="preview-wrap">
      <img id="preview" alt="Reference image preview">
      <button type="button" id="clear-btn">✕</button>
    </div>

    <div class="row">
      <select id="aspect">
        <option value="1:1">1:1</option>
        <option value="3:4" selected>3:4</option>
        <option value="4:3">4:3</option>
        <option value="9:16">9:16</option>
        <option value="16:9">16:9</option>
        <option value="3:2">3:2</option>
        <option value="2:3">2:3</option>
      </select>
      <select id="res">
        <option value="1K">1K</option>
        <option value="2K">2K</option>
        <option value="4K" selected>4K</option>
      </select>
      <button type="submit" id="btn">Generate</button>
    </div>
  </form>
  <p id="status"></p>
  <div id="result"><img id="img" alt="Generated image"></div>

  <script>
    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      document.documentElement.dataset.theme = savedTheme;
      themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.dataset.theme === 'dark';
      const next = isDark ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      themeToggle.textContent = isDark ? '🌙' : '☀️';
      localStorage.setItem('theme', next);
    });

    const form = document.getElementById('form');
    const btn = document.getElementById('btn');
    const status = document.getElementById('status');
    const img = document.getElementById('img');
    const fileInput = document.getElementById('file-input');
    const dropZone = document.getElementById('drop-zone');
    const previewWrap = document.getElementById('preview-wrap');
    const preview = document.getElementById('preview');
    const clearBtn = document.getElementById('clear-btn');
    let selectedFile = null;

    function setFile(file) {
      if (!file || !file.type.startsWith('image/')) return;
      selectedFile = file;
      preview.src = URL.createObjectURL(file);
      previewWrap.style.display = 'block';
    }

    fileInput.addEventListener('change', () => setFile(fileInput.files[0]));

    clearBtn.addEventListener('click', () => {
      selectedFile = null;
      fileInput.value = '';
      previewWrap.style.display = 'none';
      preview.src = '';
    });

    dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('drag'); });
    dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag'));
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('drag');
      setFile(e.dataTransfer.files[0]);
    });

    function readFileAsBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const prompt = document.getElementById('prompt').value.trim();
      const aspect = document.getElementById('aspect').value;
      const res = document.getElementById('res').value;
      if (!prompt) return;

      btn.disabled = true;
      img.style.display = 'none';
      status.textContent = 'Generating…';

      try {
        const body = { prompt, aspect_ratio: aspect, resolution: res, image_base64: null };
        if (selectedFile) body.image_base64 = await readFileAsBase64(selectedFile);

        const r = await fetch('/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error(await r.text());
        const blob = await r.blob();
        img.src = URL.createObjectURL(blob);
        img.style.display = 'block';
        status.textContent = '';
      } catch (err) {
        status.textContent = 'Error: ' + err.message;
      } finally {
        btn.disabled = false;
      }
    });
  </script>
</body>
</html>`;

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/') {
      return new Response(HTML, {headers: {'Content-Type': 'text/html;charset=UTF-8'}});
    }

    if (url.pathname === '/style.css') {
      return new Response(CSS, {headers: {'Content-Type': 'text/css;charset=UTF-8'}});
    }

    if (url.pathname === '/generate' && request.method === 'POST') {
      const body = (await request.json()) as {
        prompt: string;
        aspect_ratio: string;
        resolution: string;
        output_format?: string;
        image_base64?: string;
      };

      const {prompt, aspect_ratio, resolution} = body;
      const output_format = (body.output_format ?? 'jpg') as 'jpg' | 'png' | 'webp';

      const params: Record<string, unknown> = {prompt, aspect_ratio, resolution, output_format};

      if (body.image_base64) {
        params.image_input = [body.image_base64];
      }

      const response = await env.AI.run(
          'google/nano-banana-2',
        params as Parameters<Env['AI']['run']>[1],
      );
      const {result} = response as unknown as { result: { image: string } };
      const imageResponse = await fetch(result.image);
      const contentType =
        output_format === 'png' ?
          'image/png' :
          output_format === 'webp' ?
            'image/webp' :
            'image/jpeg';

      return new Response(imageResponse.body, {headers: {'Content-Type': contentType}});
    }

    return new Response('Not found', {status: 404});
  },
};
