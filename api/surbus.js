// /api/surbus.js
// Proxy para la API de Surbus Almería
// Evita problemas de CORS y añade caché en edge

export const config = {
  runtime: 'edge', // Más rápido que serverless
};

const SURBUS_API = 'https://www.surbusalmeria.es/API';

// Caché en memoria para reducir llamadas (en el edge)
const cache = new Map();
const CACHE_TTL = 20000; // 20 segundos

export default async function handler(request) {
  const url = new URL(request.url);
  
  // Obtener parámetros
  const action = url.searchParams.get('action') || 'waittime';
  const linea = url.searchParams.get('l');
  const parada = url.searchParams.get('bs');
  
  // Validar parámetros básicos
  if (action === 'waittime' && (!linea || !parada)) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Parámetros l (línea) y bs (parada) requeridos' 
      }),
      { 
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }

  try {
    let apiUrl;
    let cacheKey;
    
    switch (action) {
      case 'waittime':
        apiUrl = `${SURBUS_API}/GetWaitTime?l=${linea}&bs=${parada}`;
        cacheKey = `wt-${linea}-${parada}`;
        break;
      
      case 'lines':
        apiUrl = `${SURBUS_API}/GetLines`;
        cacheKey = 'lines';
        break;
        
      case 'stops':
        apiUrl = `${SURBUS_API}/GetStops${linea ? `?l=${linea}` : ''}`;
        cacheKey = `stops-${linea || 'all'}`;
        break;
        
      default:
        apiUrl = `${SURBUS_API}/GetWaitTime?l=${linea}&bs=${parada}`;
        cacheKey = `wt-${linea}-${parada}`;
    }

    // Verificar caché
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return new Response(
        JSON.stringify({ ...cached.data, cached: true }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Cache': 'HIT',
            'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=40'
          }
        }
      );
    }

    // Hacer petición a Surbus
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'SurbusPlus/2.0',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Surbus API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Guardar en caché
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    // Limpiar caché vieja (máx 1000 entradas)
    if (cache.size > 1000) {
      const oldest = [...cache.entries()]
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 100);
      oldest.forEach(([key]) => cache.delete(key));
    }

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'X-Cache': 'MISS',
          'Cache-Control': 'public, s-maxage=20, stale-while-revalidate=40'
        }
      }
    );

  } catch (error) {
    console.error('Surbus proxy error:', error);
    
    // Si hay caché expirada, devolverla como fallback
    const staleCache = cache.get(`wt-${linea}-${parada}`);
    if (staleCache) {
      return new Response(
        JSON.stringify({ ...staleCache.data, stale: true }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Cache': 'STALE',
          }
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Error conectando con Surbus',
        details: error.message 
      }),
      { 
        status: 502,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      }
    );
  }
}
