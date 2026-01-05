// server.dev.js
// Servidor de desarrollo que simula las API routes de Vercel
// Usar solo para desarrollo local: node server.dev.js

import http from 'http';
import https from 'https';

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  
  // Solo manejar /api/surbus
  if (!url.pathname.startsWith('/api/surbus')) {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  const linea = url.searchParams.get('l');
  const parada = url.searchParams.get('bs');

  if (!linea || !parada) {
    res.writeHead(400);
    res.end(JSON.stringify({ success: false, error: 'Faltan parámetros l y bs' }));
    return;
  }

  const apiUrl = `https://www.surbusalmeria.es/API/GetWaitTime?l=${linea}&bs=${parada}`;
  
  console.log(`[PROXY] ${apiUrl}`);

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(apiUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        }
      }, (response) => {
        let body = '';
        response.on('data', chunk => body += chunk);
        response.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch (e) {
            reject(new Error(`Invalid JSON: ${body.substring(0, 100)}`));
          }
        });
      }).on('error', reject);
    });

    console.log(`[PROXY] OK:`, data);
    res.writeHead(200);
    res.end(JSON.stringify(data));
    
  } catch (error) {
    console.error(`[PROXY] Error:`, error.message);
    res.writeHead(502);
    res.end(JSON.stringify({ success: false, error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🚌 Surbus API Proxy corriendo en http://localhost:${PORT}`);
  console.log(`\nPrueba: http://localhost:${PORT}/api/surbus?l=1&bs=7\n`);
});
