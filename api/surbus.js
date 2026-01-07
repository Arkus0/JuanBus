// /api/surbus.js
// Proxy inteligente para Surbus Almería
// Obtiene sesión y GUIDs automáticamente

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Validación y sanitización de parámetros
  const lineaNum = parseInt(req.query.l);
  const paradaNum = parseInt(req.query.bs);

  if (!lineaNum || !paradaNum || isNaN(lineaNum) || isNaN(paradaNum)) {
    return res.status(400).json({
      success: false,
      error: 'Faltan parámetros l (línea) y bs (parada)'
    });
  }

  // Validar rangos válidos
  if (lineaNum < 1 || lineaNum > 31 || paradaNum < 1 || paradaNum > 514) {
    return res.status(400).json({
      success: false,
      error: 'Parámetros fuera de rango válido'
    });
  }

  try {
    // 1. Obtener la página de la línea para extraer sesión y GUIDs
    const lineaPageUrl = `https://www.surbusalmeria.es/tiempos-de-espera/linea/${lineaNum}`;
    
    const pageResponse = await fetch(lineaPageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
      },
    });

    if (!pageResponse.ok) {
      return res.status(502).json({ 
        success: false, 
        error: `Error cargando página de línea: ${pageResponse.status}` 
      });
    }

    // Extraer cookie de sesión
    const cookies = pageResponse.headers.get('set-cookie') || '';
    const sessionMatch = cookies.match(/ASP\.NET_SessionId=([^;]+)/);
    const sessionId = sessionMatch ? sessionMatch[1] : null;

    if (!sessionId) {
      return res.status(502).json({ 
        success: false, 
        error: 'No se pudo obtener sesión de Surbus' 
      });
    }

    const html = await pageResponse.text();

    // 2. Buscar los GUIDs para esta parada
    // Formato: ConfigureButton("busStopButton0_X", "lineGuid", "busStopGuid", "lineBusStopGuid", state, paradaNum, nodeType)
    // Sanitizar paradaNum para evitar ReDoS (ya validado como número entero arriba)
    const paradaNumSafe = String(paradaNum);
    const regex = new RegExp(
      `ConfigureButton\\s*\\(\\s*"[^"]+",\\s*"([^"]+)",\\s*"([^"]+)",\\s*"([^"]+)",\\s*\\d+,\\s*${paradaNumSafe},\\s*(\\d+)\\s*\\)`,
      'i'
    );
    
    const match = html.match(regex);

    if (!match) {
      // Intentar buscar en la página de la parada directamente
      return res.status(404).json({ 
        success: false, 
        error: `Parada ${paradaNum} no encontrada en línea ${lineaNum}`,
        hint: 'Verifica que la parada pertenece a esta línea'
      });
    }

    const [, lineGuid, busStopGuid, lineBusStopGuid, nodeType] = match;

    // 3. Llamar a la API real con todos los parámetros
    const apiUrl = `https://www.surbusalmeria.es/API/GetWaitTime?l=${lineGuid}&bs=${busStopGuid}&lbs=${lineBusStopGuid}&n=${paradaNum}&nt=${nodeType}&noCache=${Date.now()}`;

    const apiResponse = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'es-ES,es;q=0.9',
        'X-Requested-With': 'XMLHttpRequest',
        'Referer': lineaPageUrl,
        'Cookie': `ASP.NET_SessionId=${sessionId}`,
      },
    });

    if (!apiResponse.ok) {
      return res.status(502).json({ 
        success: false, 
        error: `Error de API Surbus: ${apiResponse.status}` 
      });
    }

    const data = await apiResponse.json();

    // Añadir info de debug en desarrollo
    res.setHeader('Cache-Control', 'public, s-maxage=15, stale-while-revalidate=30');
    
    return res.status(200).json({
      ...data,
      _meta: {
        linea: lineaNum,
        parada: paradaNum,
        cached: false
      }
    });

  } catch (error) {
    console.error('[SURBUS PROXY]', error);
    return res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}
