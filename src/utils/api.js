// Base URL para la API (usa el proxy de Vercel)
const API_BASE = '/api/surbus';

// Fetch tiempo de espera de una parada para una línea específica
export const fetchTiempoEspera = async (paradaId, lineaId) => {
  try {
    const res = await fetch(`${API_BASE}?l=${lineaId}&bs=${paradaId}`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const data = await res.json();
    if (!data.success && data.error) {
      return { success: false, error: data.error };
    }
    return data;
  } catch (e) {
    return { success: false, error: e.message };
  }
};

// Generar URL de Google Maps para rutas
export const generateGoogleMapsUrl = (origenCoords, destinoCoords) => {
  if (!origenCoords || !destinoCoords) return null;

  // Para origen: determinar formato según tipo
  let origin;
  if (origenCoords.tipo === 'ubicacion') {
    origin = `${origenCoords.lat},${origenCoords.lng}`;
  } else {
    origin = encodeURIComponent(`${origenCoords.nombre}, Almería`);
  }

  // Para destino: determinar formato según tipo
  let destination;
  if (destinoCoords.tipo === 'ubicacion') {
    destination = `${destinoCoords.lat},${destinoCoords.lng}`;
  } else {
    destination = encodeURIComponent(`${destinoCoords.nombre}, Almería`);
  }

  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;
};
