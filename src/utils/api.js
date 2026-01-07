// API para comunicación con Surbus

const API_BASE = '/api/surbus';

/**
 * Obtener tiempos de espera para una parada y línea
 * @param {number} paradaId - ID de la parada
 * @param {number} lineaId - ID de la línea
 * @param {number} retries - Número de reintentos (default: 2)
 * @returns {Promise<Object>} - Datos de tiempos de espera
 */
export const fetchTiempoEspera = async (paradaId, lineaId, retries = 2) => {
  const timeout = 8000; // 8 segundos timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`${API_BASE}?l=${lineaId}&bs=${paradaId}`, {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();
    if (!data.success && data.error) {
      return { success: false, error: data.error };
    }
    return data;
  } catch (e) {
    clearTimeout(timeoutId);

    // Retry logic para errores de red (no para errores 4xx/5xx)
    if (retries > 0 && (e.name === 'AbortError' || e.name === 'TypeError')) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1s antes de reintentar
      return fetchTiempoEspera(paradaId, lineaId, retries - 1);
    }

    return {
      success: false,
      error: e.name === 'AbortError' ? 'Timeout al obtener tiempos' : e.message
    };
  }
};
