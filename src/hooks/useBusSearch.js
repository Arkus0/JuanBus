import { useMemo, useDeferredValue } from 'react';
import { normalizeText } from '../utils/formatters';
import SINONIMOS_POI from '../data/sinonimos.json';

export const useBusSearch = (searchTerm, paradas, userLocation, selectedLinea, activeTab) => {
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const paradasFiltradas = useMemo(() => {
    if (!deferredSearchTerm) return paradas;

    const searchTermNormalized = normalizeText(deferredSearchTerm);
    const searchWords = searchTermNormalized.split(/\s+/).filter(w => w.length > 0);
    const resultadosMap = new Map();

    // 1. Buscar por sinónimos/POI
    searchWords.forEach(word => {
      Object.entries(SINONIMOS_POI).forEach(([sinonimo, paradaIds]) => {
        if (word.includes(sinonimo) || sinonimo.includes(word)) {
          paradaIds.forEach(id => {
            const parada = paradas.find(p => p.id === id);
            if (parada) {
              resultadosMap.set(parada.id, parada);
            }
          });
        }
      });
    });

    // 2. Búsqueda directa: cada palabra debe aparecer en alguna parte
    paradas.forEach(parada => {
      if (resultadosMap.has(parada.id)) return; // Ya encontrada por POI

      const nombreNorm = normalizeText(parada.nombre);
      const idStr = parada.id.toString();
      const lineasStr = parada.lineas.map(l => `l${l}`).join(' ');

      // Si ALGUNA palabra coincide, incluir
      const coincide = searchWords.some(word =>
        nombreNorm.includes(word) ||
        idStr.includes(word) ||
        lineasStr.includes(word)
      );

      if (coincide) {
        resultadosMap.set(parada.id, parada);
      }
    });

    // 3. Convertir a array
    let resultados = Array.from(resultadosMap.values());

    // 4. Ordenar por contexto
    if (activeTab === 'cercanas' && userLocation) {
      // En Cercanas: priorizar por distancia
      resultados.sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
    } else if (selectedLinea) {
      // En vista de línea: priorizar paradas de esa línea
      resultados.sort((a, b) => {
        const aHasLinea = a.lineas.includes(selectedLinea) ? 0 : 1;
        const bHasLinea = b.lineas.includes(selectedLinea) ? 0 : 1;
        return aHasLinea - bHasLinea;
      });
    } else {
      // General: priorizar por número de líneas (más opciones)
      resultados.sort((a, b) => b.lineas.length - a.lineas.length);
    }

    return resultados;
  }, [deferredSearchTerm, paradas, activeTab, userLocation, selectedLinea]);

  return {
    paradasFiltradas,
    isSearching: deferredSearchTerm !== searchTerm
  };
};
