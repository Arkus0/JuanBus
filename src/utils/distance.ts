/**
 * Utilidades de cálculo de distancia optimizadas con caché
 */

// Cache de cálculos de distancia recientes (límite de 5000 para evitar memory leak)
const distanceCache = new Map<string, number>();
const CACHE_LIMIT = 5000;

/**
 * Haversine formula optimizada para calcular distancia en metros entre dos puntos GPS
 * Incluye caché para evitar recalcular las mismas distancias
 */
export const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  // Redondear coordenadas a 6 decimales (~11cm de precisión) para mejorar cache hit rate
  const lat1Round = Math.round(lat1 * 1e6) / 1e6;
  const lng1Round = Math.round(lon1 * 1e6) / 1e6;
  const lat2Round = Math.round(lat2 * 1e6) / 1e6;
  const lng2Round = Math.round(lon2 * 1e6) / 1e6;

  // Crear key para cache
  const cacheKey = `${lat1Round},${lng1Round},${lat2Round},${lng2Round}`;

  // Verificar cache
  if (distanceCache.has(cacheKey)) {
    return distanceCache.get(cacheKey)!;
  }

  // Calcular distancia
  const R = 6371000; // Radio de la Tierra en metros
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const distance = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  // Guardar en cache (con límite)
  if (distanceCache.size >= CACHE_LIMIT) {
    // Eliminar primera entrada (FIFO simple)
    const firstKey = distanceCache.keys().next().value;
    if (firstKey !== undefined) {
      distanceCache.delete(firstKey);
    }
  }

  distanceCache.set(cacheKey, distance);

  return distance;
};

/**
 * Distancia rápida aproximada (más rápida pero menos precisa)
 * Útil para ordenar por proximidad sin necesitar precisión exacta
 * ~5x más rápido que Haversine
 */
export const fastApproximateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371000; // Radio de la Tierra en metros
  const x = (lon2 - lon1) * Math.cos((lat1 + lat2) / 2 * Math.PI / 180);
  const y = (lat2 - lat1);
  return Math.sqrt(x * x + y * y) * (R * Math.PI / 180);
};

/**
 * Calcula distancias para múltiples puntos de manera optimizada
 * Útil cuando se necesita calcular distancias a muchas paradas
 */
export const batchCalculateDistances = <T extends { lat: number; lng: number }>(
  origin: { lat: number; lng: number },
  points: T[]
): Array<T & { distancia: number }> => {
  return points.map(point => ({
    ...point,
    distancia: haversineDistance(origin.lat, origin.lng, point.lat, point.lng)
  }));
};

/**
 * Limpia el cache de distancias (útil para liberar memoria)
 */
export const clearDistanceCache = (): void => {
  distanceCache.clear();
};

/**
 * Obtiene estadísticas del cache
 */
export const getDistanceCacheStats = () => {
  return {
    size: distanceCache.size,
    limit: CACHE_LIMIT,
    usage: `${((distanceCache.size / CACHE_LIMIT) * 100).toFixed(1)}%`
  };
};
