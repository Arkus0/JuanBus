// server.dev.js
// Servidor de desarrollo que simula el proxy de Surbus
// Usar solo para desarrollo local: node server.dev.js

import http from 'http';
import https from 'https';

const PORT = 3001;

function httpsGet(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, options, (res) => {
      let data = '';
      const cookies = res.headers['set-cookie'] || [];
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ data, cookies, status: res.statusCode }));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    return res.end();
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);

  if (!url.pathname.startsWith('/api/surbus')) {
    res.writeHead(404);
    return res.end(JSON.stringify({ error: 'Not found' }));
  }

  // Validación y sanitización de parámetros
  const lineaNum = parseInt(url.searchParams.get('l'));
  const paradaNum = parseInt(url.searchParams.get('bs'));

  if (!lineaNum || !paradaNum || isNaN(lineaNum) || isNaN(paradaNum)) {
    res.writeHead(400);
    return res.end(JSON.stringify({ success: false, error: 'Faltan parámetros l y bs' }));
  }

  // Validar rangos válidos
  if (lineaNum < 1 || lineaNum > 31 || paradaNum < 1 || paradaNum > 514) {
    res.writeHead(400);
    return res.end(JSON.stringify({ success: false, error: 'Parámetros fuera de rango válido' }));
  }

  console.log(`[PROXY] Línea ${lineaNum}, Parada ${paradaNum}`);

  try {
    // 1. Obtener página de la línea
    const lineaPageUrl = `https://www.surbusalmeria.es/tiempos-de-espera/linea/${lineaNum}`;
    console.log(`[PROXY] Cargando ${lineaPageUrl}`);
    
    const pageResult = await httpsGet(lineaPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      }
    });

    // Extraer sesión
    const sessionCookie = pageResult.cookies.find(c => c.includes('ASP.NET_SessionId'));
    const sessionMatch = sessionCookie?.match(/ASP\.NET_SessionId=([^;]+)/);
    const sessionId = sessionMatch?.[1];

    if (!sessionId) {
      res.writeHead(502);
      return res.end(JSON.stringify({ success: false, error: 'No session' }));
    }

    console.log(`[PROXY] Sesión: ${sessionId.substring(0, 8)}...`);

    // 2. Extraer GUIDs
    // Sanitizar paradaNum para evitar ReDoS (ya validado como número entero arriba)
    const paradaNumSafe = String(paradaNum);
    const regex = new RegExp(
      `ConfigureButton\\s*\\(\\s*"[^"]+",\\s*"([^"]+)",\\s*"([^"]+)",\\s*"([^"]+)",\\s*\\d+,\\s*${paradaNumSafe},\\s*(\\d+)\\s*\\)`,
      'i'
    );
    
    const match = pageResult.data.match(regex);

    if (!match) {
      res.writeHead(404);
      return res.end(JSON.stringify({ 
        success: false, 
        error: `Parada ${paradaNum} no encontrada en línea ${lineaNum}` 
      }));
    }

    const [, lineGuid, busStopGuid, lineBusStopGuid, nodeType] = match;
    console.log(`[PROXY] GUIDs encontrados`);

    // 3. Llamar a la API
    const apiUrl = `https://www.surbusalmeria.es/API/GetWaitTime?l=${lineGuid}&bs=${busStopGuid}&lbs=${lineBusStopGuid}&n=${paradaNum}&nt=${nodeType}&noCache=${Date.now()}`;
    
    const apiResult = await httpsGet(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': lineaPageUrl,
        'Cookie': `ASP.NET_SessionId=${sessionId}`,
      }
    });

    const data = JSON.parse(apiResult.data);
    console.log(`[PROXY] Respuesta:`, data);

    res.writeHead(200);
    res.end(JSON.stringify(data));

  } catch (error) {
    console.error(`[PROXY] Error:`, error.message);
    res.writeHead(500);
    res.end(JSON.stringify({ success: false, error: error.message }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🚌 Surbus Proxy corriendo en http://localhost:${PORT}`);
  console.log(`\nPrueba: http://localhost:${PORT}/api/surbus?l=5&bs=51\n`);
});
