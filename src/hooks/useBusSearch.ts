import { useMemo, useDeferredValue, useState, useCallback, useEffect } from 'react';
import { normalizeText } from '../utils/formatters';
import { fuzzyMatch, calculateRelevanceScore } from '../utils/fuzzySearch';
import { buildSearchIndex, searchWithIndex, getSuggestions, type SearchIndex } from '../utils/searchIndex';
import type { Parada } from '../types';
import SINONIMOS_POI from '../data/sinonimos.json';
import PARADAS from '../data/paradas.json';

// Índice global (se construye una sola vez)
let globalSearchIndex: SearchIndex | null = null;

/**
 * Hook de búsqueda optimizado con fuzzy search e índices
 * - Búsqueda ~100x más rápida con índices
 * - Fuzzy matching para tolerar errores tipográficos
 * - Sistema de puntuación por relevancia
 * - Historial y sugerencias de búsqueda
 */
export const useBusSearch = (
  searchTerm: string,
  paradas: Parada[],
  userLocation: any,
  selectedLinea: number | null,
  activeTab: string
) => {
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    const saved = localStorage.getItem('surbus_search_history');
    return saved ? JSON.parse(saved) : [];
  });

  // Construir índice si no existe (solo se ejecuta una vez)
  const searchIndex = useMemo(() => {
    if (!globalSearchIndex) {
      globalSearchIndex = buildSearchIndex(PARADAS as Parada[]);
    }
    return globalSearchIndex;
  }, []);

  // Agregar al historial cuando se hace una búsqueda válida
  useEffect(() => {
    if (deferredSearchTerm && deferredSearchTerm.length >= 2) {
      setSearchHistory(prev => {
        const newHistory = [deferredSearchTerm, ...prev.filter(h => h !== deferredSearchTerm)].slice(0, 10);
        localStorage.setItem('surbus_search_history', JSON.stringify(newHistory));
        return newHistory;
      });
    }
  }, [deferredSearchTerm]);

  // Obtener sugerencias
  const suggestions = useMemo(() => {
    if (!deferredSearchTerm || deferredSearchTerm.length < 2) {
      return searchHistory.slice(0, 5);
    }
    return getSuggestions(searchIndex, deferredSearchTerm, 5);
  }, [deferredSearchTerm, searchIndex, searchHistory]);

  // Búsqueda optimizada con fuzzy matching
  const paradasFiltradas = useMemo(() => {
    if (!deferredSearchTerm) return paradas;

    const searchTermNormalized = normalizeText(deferredSearchTerm);
    const searchWords = searchTermNormalized.split(/\s+/).filter(w => w.length > 0);

    // Mapa para almacenar paradas con su puntuación
    const resultadosMap = new Map<number, { parada: Parada; score: number }>();

    // 1. Búsqueda por sinónimos/POI (máxima prioridad)
    searchWords.forEach(word => {
      Object.entries(SINONIMOS_POI).forEach(([sinonimo, paradaIds]) => {
        // Fuzzy match en sinónimos
        if (fuzzyMatch(word, sinonimo, 0.75)) {
          (paradaIds as number[]).forEach(id => {
            const parada = searchIndex.paradaById.get(id);
            if (parada && paradas.some(p => p.id === id)) {
              resultadosMap.set(id, {
                parada: paradas.find(p => p.id === id)!,
                score: 150 // Alta puntuación para POI
              });
            }
          });
        }
      });
    });

    // 2. Búsqueda rápida usando índices
    const indexResults = searchWithIndex(searchIndex, deferredSearchTerm);

    // 3. Para cada resultado del índice, calcular puntuación con fuzzy matching
    indexResults.forEach(id => {
      if (resultadosMap.has(id)) return; // Ya encontrada por POI

      const parada = paradas.find(p => p.id === id);
      if (!parada) return;

      const nombreNorm = normalizeText(parada.nombre);
      const idStr = parada.id.toString();

      // Calcular puntuación de relevancia
      let score = 0;

      // Coincidencia exacta en nombre
      if (nombreNorm.includes(searchTermNormalized)) {
        score = calculateRelevanceScore(searchTermNormalized, nombreNorm);
      }
      // Fuzzy match en nombre
      else if (fuzzyMatch(searchTermNormalized, nombreNorm, 0.65)) {
        score = calculateRelevanceScore(searchTermNormalized, nombreNorm) * 0.8;
      }
      // Coincidencia por ID
      else if (idStr.includes(searchTermNormalized)) {
        score = 90;
      }
      // Coincidencia por línea
      else {
        const lineaMatch = searchTermNormalized.match(/^l?(\d+)$/);
        if (lineaMatch) {
          const lineaNum = parseInt(lineaMatch[1]);
          if (parada.lineas.includes(lineaNum)) {
            score = 70;
          }
        }
      }

      // Bonus por número de líneas (paradas más conectadas)
      score += parada.lineas.length * 2;

      // Bonus si tiene la línea seleccionada
      if (selectedLinea && parada.lineas.includes(selectedLinea)) {
        score += 30;
      }

      if (score > 0) {
        resultadosMap.set(id, { parada, score });
      }
    });

    // 4. Búsqueda fuzzy adicional para términos que no encontraron nada
    if (resultadosMap.size === 0 && searchTermNormalized.length >= 3) {
      paradas.forEach(parada => {
        const nombreNorm = normalizeText(parada.nombre);

        // Fuzzy match con umbral más bajo
        if (fuzzyMatch(searchTermNormalized, nombreNorm, 0.6)) {
          const score = calculateRelevanceScore(searchTermNormalized, nombreNorm) * 0.6;
          resultadosMap.set(parada.id, { parada, score });
        }
      });
    }

    // 5. Convertir a array y ordenar por puntuación
    let resultados = Array.from(resultadosMap.values());

    // Ordenar según contexto
    resultados.sort((a, b) => {
      // Primero por puntuación de búsqueda
      const scoreDiff = b.score - a.score;
      if (Math.abs(scoreDiff) > 5) return scoreDiff;

      // Luego por contexto específico
      if (activeTab === 'cercanas' && userLocation) {
        // En Cercanas: priorizar por distancia
        const distA = a.parada.distancia || Infinity;
        const distB = b.parada.distancia || Infinity;
        return distA - distB;
      } else if (selectedLinea) {
        // En vista de línea: priorizar paradas de esa línea
        const aHasLinea = a.parada.lineas.includes(selectedLinea) ? 0 : 1;
        const bHasLinea = b.parada.lineas.includes(selectedLinea) ? 0 : 1;
        return aHasLinea - bHasLinea;
      } else {
        // General: priorizar por número de líneas (más opciones)
        return b.parada.lineas.length - a.parada.lineas.length;
      }
    });

    return resultados.map(r => r.parada);
  }, [deferredSearchTerm, paradas, activeTab, userLocation, selectedLinea, searchIndex]);

  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    localStorage.removeItem('surbus_search_history');
  }, []);

  return {
    paradasFiltradas,
    isSearching: deferredSearchTerm !== searchTerm,
    suggestions,
    searchHistory,
    clearHistory
  };
};
