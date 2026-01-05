// /api/surbus.js
// Proxy Edge para la API de Surbus Almería
// Se ejecuta en el edge más cercano al usuario (Europa para usuarios españoles)

export const config = {
  runtime: 'edge',
  regions: ['cdg1', 'fra1', 'lhr1'], // París, Frankfurt, Londres - cerca de España
};

export default async function handler(request) {
  const url = new URL(request.url);
  const linea = url.searchParams.get('l');
  const parada = url.searchParams.get('bs');

  // Headers CORS
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  // Validar parámetros
  if (!linea || !parada) {
    return new Response(
      JSON.stringify({ success: false, error: 'Faltan parámetros l y bs' }),
      { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }

  try {
    const apiUrl = `https://www.surbusalmeria.es/API/GetWaitTime?l=${linea}&bs=${parada}`;
    
    // Simular un navegador español real
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.surbusalmeria.es/tiempos-de-espera',
        'Origin': 'https://www.surbusalmeria.es',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    if (!response.ok) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Surbus API error: ${response.status}`,
          region: 'edge'
        }),
        { 
          status: 502, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const data = await response.json();

    return new Response(
      JSON.stringify(data),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, s-maxage=15, stale-while-revalidate=30',
          ...corsHeaders
        },
      }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        region: 'edge'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }
}
