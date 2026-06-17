const express = require('express');
const winston = require('winston');

const PORT = process.env.PORT || 8080;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const DD_SERVICE = process.env.DD_SERVICE || 'dancing-duck';
const DD_ENV = process.env.DD_ENV || 'development';
const DD_VERSION = process.env.DD_VERSION || '1.0.0';

const logger = winston.createLogger({
  level: LOG_LEVEL,
  format: winston.format.json(),
  defaultMeta: { service: DD_SERVICE, env: DD_ENV, version: DD_VERSION },
  transports: [new winston.transports.Console()],
});

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.on('finish', () => {
    logger.info('request', { method: req.method, path: req.path, status: res.statusCode });
  });
  next();
});

app.get('/healthz', (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/ready', (req, res) => res.status(200).json({ status: 'ready' }));

app.get('/', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dancing Duck</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    h1 { font-size: 2.5rem; color: #e65c00; margin-bottom: 0.5rem; }
    .subtitle { color: #c0392b; margin-bottom: 2rem; font-size: 1.1rem; }
    .duck-container {
      font-size: 8rem;
      line-height: 1;
      margin-bottom: 1.5rem;
      cursor: pointer;
      user-select: none;
      transition: transform 0.1s;
    }
    .duck-container.dancing {
      animation: dance 0.4s infinite alternate;
    }
    @keyframes dance {
      0%   { transform: rotate(-15deg) translateY(0px); }
      25%  { transform: rotate(0deg)   translateY(-12px); }
      50%  { transform: rotate(15deg)  translateY(0px); }
      75%  { transform: rotate(0deg)   translateY(-8px); }
      100% { transform: rotate(-15deg) translateY(0px); }
    }
    .speech-bubble {
      position: relative;
      background: #fff;
      border-radius: 1rem;
      padding: 1rem 1.5rem;
      margin-bottom: 2rem;
      max-width: 400px;
      min-height: 3rem;
      font-size: 1.3rem;
      color: #333;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      text-align: center;
      word-break: break-word;
      min-width: 200px;
    }
    .speech-bubble::after {
      content: '';
      position: absolute;
      top: -18px;
      left: 50%;
      transform: translateX(-50%);
      border: 10px solid transparent;
      border-bottom-color: #fff;
    }
    .controls {
      display: flex;
      gap: 0.75rem;
      width: 100%;
      max-width: 420px;
    }
    input[type="text"] {
      flex: 1;
      padding: 0.75rem 1rem;
      font-size: 1.1rem;
      border: 2px solid #fcb69f;
      border-radius: 0.6rem;
      outline: none;
      transition: border-color 0.2s;
    }
    input[type="text"]:focus { border-color: #e65c00; }
    button {
      padding: 0.75rem 1.25rem;
      font-size: 1.1rem;
      background: #e65c00;
      color: #fff;
      border: none;
      border-radius: 0.6rem;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.2s;
    }
    button:hover { background: #c0392b; }
    .hint { margin-top: 1rem; font-size: 0.85rem; color: #a04000; }
  </style>
</head>
<body>
  <h1>🎵 Dancing Duck 🎵</h1>
  <p class="subtitle">Type something and make the duck sing!</p>

  <div class="speech-bubble" id="bubble">Quack quack! Type something for me to sing! 🎶</div>

  <div class="duck-container" id="duck" title="Click me to dance!">🦆</div>

  <div class="controls">
    <input type="text" id="lyric" placeholder="What should I sing?" autofocus maxlength="200">
    <button id="singBtn">Sing! 🎵</button>
  </div>
  <p class="hint">Press Enter or click Sing — click the duck to dance!</p>

  <script>
    const duck = document.getElementById('duck');
    const bubble = document.getElementById('bubble');
    const input = document.getElementById('lyric');
    const btn = document.getElementById('singBtn');
    let danceTimer = null;

    function startDancing(ms) {
      duck.classList.add('dancing');
      clearTimeout(danceTimer);
      danceTimer = setTimeout(() => duck.classList.remove('dancing'), ms || 3000);
    }

    function sing() {
      const text = input.value.trim();
      if (!text) {
        bubble.textContent = 'Quack! Give me some lyrics! 🎶';
        startDancing(1500);
        return;
      }
      bubble.textContent = '🎵 ' + text + ' 🎶';
      startDancing(text.length * 80 + 2000);
      input.value = '';
    }

    btn.addEventListener('click', sing);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') sing(); });
    duck.addEventListener('click', () => startDancing(3000));
  </script>
</body>
</html>`);
});

module.exports = app;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info('server started', { port: PORT });
  });

  process.on('SIGTERM', () => {
    logger.info('SIGTERM received, shutting down gracefully');
    server.close(() => {
      logger.info('server closed');
      process.exit(0);
    });
  });
}
