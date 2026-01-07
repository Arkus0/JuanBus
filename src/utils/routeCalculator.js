import { PARADAS, getLinea } from '../data';
import { haversineDistance } from './helpers';

/**
 * Calcular rutas óptimas entre dos coordenadas
 * @param {Object} origenCoords - { lat, lng, nombre }
 * @param {Object} destinoCoords - { lat, lng, nombre }
 * @returns {Array} - Lista de rutas ordenadas por eficiencia
 */
export const calcularRutas = (origenCoords, destinoCoords) => {
  if (!origenCoords || !destinoCoords) return [];

  const UMBRAL_TRANSBORDO = 500; // Metros - solo hacer transbordo si ahorra >500m andando
  const MAX_DISTANCIA_PARADA = 800; // Metros - radio para buscar paradas cercanas

  const rutas = [];

  // Pre-indexar paradas por línea para optimizar búsquedas (O(n) en lugar de O(n³))
  const paradasPorLinea = {};
  PARADAS.forEach(p => {
    p.lineas.forEach(l => {
      if (!paradasPorLinea[l]) paradasPorLinea[l] = [];
      paradasPorLinea[l].push(p);
    });
  });

  // 1. Encontrar paradas cercanas al origen y destino
  const paradasOrigen = PARADAS.map(p => ({
    ...p,
    distanciaAlOrigen: haversineDistance(origenCoords.lat, origenCoords.lng, p.lat, p.lng)
  })).filter(p => p.distanciaAlOrigen <= MAX_DISTANCIA_PARADA)
    .sort((a, b) => a.distanciaAlOrigen - b.distanciaAlOrigen)
    .slice(0, 10); // Top 10 paradas más cercanas al origen

  const paradasDestino = PARADAS.map(p => ({
    ...p,
    distanciaAlDestino: haversineDistance(destinoCoords.lat, destinoCoords.lng, p.lat, p.lng)
  })).filter(p => p.distanciaAlDestino <= MAX_DISTANCIA_PARADA)
    .sort((a, b) => a.distanciaAlDestino - b.distanciaAlDestino)
    .slice(0, 10); // Top 10 paradas más cercanas al destino

  if (paradasOrigen.length === 0 || paradasDestino.length === 0) return [];

  // 2. RUTAS DIRECTAS (sin transbordo)
  paradasOrigen.forEach(paradaOrigen => {
    paradasDestino.forEach(paradaDestino => {
      if (paradaOrigen.id === paradaDestino.id) return;

      // Buscar líneas en común
      const lineasComunes = paradaOrigen.lineas.filter(l => paradaDestino.lineas.includes(l));

      lineasComunes.forEach(lineaId => {
        const linea = getLinea(lineaId);
        const distanciaAndando = paradaOrigen.distanciaAlOrigen + paradaDestino.distanciaAlDestino;
        const tiempoEstimado = Math.round(distanciaAndando / 70) + 10; // ~70m/min andando + 10min bus aprox

        rutas.push({
          tipo: 'directa',
          lineas: [lineaId],
          paradas: [paradaOrigen, paradaDestino],
          distanciaAndando,
          tiempoEstimado,
          detalles: `Línea ${lineaId}`,
          segmentos: [{
            tipo: 'caminar',
            distancia: paradaOrigen.distanciaAlOrigen,
            desde: 'Origen',
            hasta: paradaOrigen.nombre
          }, {
            tipo: 'bus',
            linea: lineaId,
            color: linea.color,
            nombre: linea.nombre,
            desde: paradaOrigen.nombre,
            hasta: paradaDestino.nombre
          }, {
            tipo: 'caminar',
            distancia: paradaDestino.distanciaAlDestino,
            desde: paradaDestino.nombre,
            hasta: 'Destino'
          }]
        });
      });
    });
  });

  // 3. RUTAS CON TRANSBORDO (solo si mejora significativamente la distancia andando)
  const mejorRutaDirecta = rutas.length > 0
    ? rutas.reduce((min, r) => r.distanciaAndando < min.distanciaAndando ? r : min, rutas[0])
    : null;

  if (mejorRutaDirecta && mejorRutaDirecta.distanciaAndando > UMBRAL_TRANSBORDO) {
    paradasOrigen.forEach(paradaOrigen => {
      paradaOrigen.lineas.forEach(lineaOrigen => {
        const paradasLineaOrigen = paradasPorLinea[lineaOrigen] || [];

        paradasLineaOrigen.forEach(paradaTransbordo => {
          if (paradaTransbordo.id === paradaOrigen.id) return;

          // Buscar líneas que conecten al destino desde el transbordo
          paradasDestino.forEach(paradaDestino => {
            if (paradaDestino.id === paradaTransbordo.id) return;

            const lineasTransbordo = paradaTransbordo.lineas.filter(l =>
              l !== lineaOrigen && paradaDestino.lineas.includes(l)
            );

            lineasTransbordo.forEach(lineaDestino => {
              const lineaO = getLinea(lineaOrigen);
              const lineaD = getLinea(lineaDestino);

              const distanciaAndando = paradaOrigen.distanciaAlOrigen + paradaDestino.distanciaAlDestino;

              // Solo añadir si mejora significativamente vs ruta directa
              if (!mejorRutaDirecta || (mejorRutaDirecta.distanciaAndando - distanciaAndando) > UMBRAL_TRANSBORDO) {
                const tiempoEstimado = Math.round(distanciaAndando / 70) + 20; // +20min por bus y transbordo

                rutas.push({
                  tipo: 'transbordo',
                  lineas: [lineaOrigen, lineaDestino],
                  paradas: [paradaOrigen, paradaTransbordo, paradaDestino],
                  distanciaAndando,
                  tiempoEstimado,
                  detalles: `L${lineaOrigen} → L${lineaDestino}`,
                  segmentos: [{
                    tipo: 'caminar',
                    distancia: paradaOrigen.distanciaAlOrigen,
                    desde: 'Origen',
                    hasta: paradaOrigen.nombre
                  }, {
                    tipo: 'bus',
                    linea: lineaOrigen,
                    color: lineaO.color,
                    nombre: lineaO.nombre,
                    desde: paradaOrigen.nombre,
                    hasta: paradaTransbordo.nombre
                  }, {
                    tipo: 'transbordo',
                    en: paradaTransbordo.nombre
                  }, {
                    tipo: 'bus',
                    linea: lineaDestino,
                    color: lineaD.color,
                    nombre: lineaD.nombre,
                    desde: paradaTransbordo.nombre,
                    hasta: paradaDestino.nombre
                  }, {
                    tipo: 'caminar',
                    distancia: paradaDestino.distanciaAlDestino,
                    desde: paradaDestino.nombre,
                    hasta: 'Destino'
                  }]
                });
              }
            });
          });
        });
      });
    });
  }

  // Ordenar por distancia andando (prioridad) y luego por tiempo
  return rutas
    .sort((a, b) => {
      const diffAndando = a.distanciaAndando - b.distanciaAndando;
      if (Math.abs(diffAndando) > 100) return diffAndando; // Si la diferencia es >100m, priorizar menos andando
      return a.tiempoEstimado - b.tiempoEstimado; // Sino, el más rápido
    })
    .slice(0, 5); // Limitar a top 5 rutas
};
