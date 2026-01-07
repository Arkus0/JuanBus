// Utilidades comunes para JuanBus

// Calcular distancia haversine entre dos puntos GPS
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
};

// Formatear distancia en metros o kilómetros
export const formatDistance = (m) => m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`;

// Normalizar texto: eliminar acentos y convertir a minúsculas
export const normalizeText = (str) => str
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '');

// Parse JSON seguro con fallback
export const safeJsonParse = (value, fallback) => {
  try {
    return value !== null ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
};

// LocalStorage helpers seguros
export const safeLocalStorage = {
  getItem: (key, fallback = null) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn(`Error leyendo localStorage key "${key}":`, e);
      return fallback;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (e) {
      console.warn(`Error escribiendo localStorage key "${key}":`, e);
      return false;
    }
  }
};

// Formatear tiempos de espera con colores
export const formatTiempo = (tiempo, theme) => {
  if (!tiempo?.success) return { text: 'Sin datos', color: theme.textMuted };
  if (!tiempo.waitTimeString) return { text: tiempo.waitTimeType === 3 ? 'Sin servicio' : '...', color: theme.textMuted };
  const mins = parseInt(tiempo.waitTimeString);
  if (isNaN(mins)) return { text: tiempo.waitTimeString, color: theme.accent };
  if (mins <= 3) return { text: `${mins} min`, color: theme.success };
  if (mins <= 10) return { text: `${mins} min`, color: theme.warning };
  return { text: `${mins} min`, color: theme.danger };
};
