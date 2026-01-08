/**
 * Sistema de índices optimizado para búsquedas ultrarrápidas
 * Crea índices invertidos para búsqueda en O(1) en lugar de O(n)
 */

import type { Parada } from '../types';
import { normalizeText } from './formatters';

export interface SearchIndex {
  // Índice: palabra normalizada -> IDs de paradas
  wordIndex: Map<string, Set<number>>;

  // Índice: prefijo (2-3 caracteres) -> IDs de paradas
  prefixIndex: Map<string, Set<number>>;

  // Índice: línea -> IDs de paradas
  lineaIndex: Map<number, Set<number>>;

  // Índice: ID de parada -> objeto parada completo
  paradaById: Map<number, Parada>;

  // Metadata
  totalParadas: number;
  indexedAt: Date;
}

/**
 * Construye índices para búsqueda rápida
 * Se ejecuta una sola vez al iniciar la app
 */
export const buildSearchIndex = (paradas: Parada[]): SearchIndex => {
  const wordIndex = new Map<string, Set<number>>();
  const prefixIndex = new Map<string, Set<number>>();
  const lineaIndex = new Map<number, Set<number>>();
  const paradaById = new Map<number, Parada>();

  for (const parada of paradas) {
    // Índice por ID
    paradaById.set(parada.id, parada);

    // Índice por palabras del nombre
    const nombreNorm = normalizeText(parada.nombre);
    const words = nombreNorm.split(/\s+/).filter(w => w.length > 0);

    for (const word of words) {
      // Índice de palabras completas
      if (!wordIndex.has(word)) {
        wordIndex.set(word, new Set());
      }
      wordIndex.get(word)!.add(parada.id);

      // Índice de prefijos (para autocompletado)
      for (let len = 2; len <= Math.min(word.length, 4); len++) {
        const prefix = word.substring(0, len);
        if (!prefixIndex.has(prefix)) {
          prefixIndex.set(prefix, new Set());
        }
        prefixIndex.get(prefix)!.add(parada.id);
      }
    }

    // Índice por líneas
    for (const linea of parada.lineas) {
      if (!lineaIndex.has(linea)) {
        lineaIndex.set(linea, new Set());
      }
      lineaIndex.get(linea)!.add(parada.id);
    }

    // Índice por ID como string
    const idStr = parada.id.toString();
    if (!wordIndex.has(idStr)) {
      wordIndex.set(idStr, new Set());
    }
    wordIndex.get(idStr)!.add(parada.id);
  }

  return {
    wordIndex,
    prefixIndex,
    lineaIndex,
    paradaById,
    totalParadas: paradas.length,
    indexedAt: new Date()
  };
};

/**
 * Busca paradas usando el índice (mucho más rápido que búsqueda lineal)
 */
export const searchWithIndex = (
  index: SearchIndex,
  searchTerm: string,
  options: {
    usePrefix?: boolean;
    minPrefixLength?: number;
  } = {}
): Set<number> => {
  const { usePrefix = true, minPrefixLength = 2 } = options;
  const results = new Set<number>();

  if (!searchTerm) return results;

  const searchNorm = normalizeText(searchTerm);
  const searchWords = searchNorm.split(/\s+/).filter(w => w.length > 0);

  for (const word of searchWords) {
    // Búsqueda exacta por palabra completa
    if (index.wordIndex.has(word)) {
      index.wordIndex.get(word)!.forEach(id => results.add(id));
    }

    // Búsqueda por prefijo (para términos cortos o autocompletado)
    if (usePrefix && word.length >= minPrefixLength) {
      const prefix = word.substring(0, Math.min(word.length, 4));
      if (index.prefixIndex.has(prefix)) {
        index.prefixIndex.get(prefix)!.forEach(id => results.add(id));
      }
    }

    // Búsqueda por línea (si el término es "l" + número)
    const lineaMatch = word.match(/^l?(\d+)$/);
    if (lineaMatch) {
      const lineaNum = parseInt(lineaMatch[1]);
      if (index.lineaIndex.has(lineaNum)) {
        index.lineaIndex.get(lineaNum)!.forEach(id => results.add(id));
      }
    }
  }

  return results;
};

/**
 * Obtiene sugerencias de búsqueda basadas en prefijos
 */
export const getSuggestions = (
  index: SearchIndex,
  searchTerm: string,
  limit: number = 5
): string[] => {
  if (!searchTerm || searchTerm.length < 2) return [];

  const searchNorm = normalizeText(searchTerm);
  const suggestions = new Set<string>();

  // Buscar todas las palabras que empiecen con el prefijo
  for (const [word, _ids] of index.wordIndex.entries()) {
    if (word.startsWith(searchNorm) && word !== searchNorm) {
      suggestions.add(word);
      if (suggestions.size >= limit * 2) break;
    }
  }

  // Convertir a array, ordenar por longitud y frecuencia, limitar
  return Array.from(suggestions)
    .sort((a, b) => {
      // Priorizar palabras más cortas (más probables de ser útiles)
      const lenDiff = a.length - b.length;
      if (lenDiff !== 0) return lenDiff;
      return a.localeCompare(b);
    })
    .slice(0, limit);
};

/**
 * Obtiene las paradas más populares (más líneas = más conexiones)
 */
export const getPopularParadas = (index: SearchIndex, limit: number = 10): Parada[] => {
  const paradas = Array.from(index.paradaById.values());

  return paradas
    .sort((a, b) => {
      // Ordenar por número de líneas (descendente)
      const lineaDiff = b.lineas.length - a.lineas.length;
      if (lineaDiff !== 0) return lineaDiff;

      // En caso de empate, ordenar por ID (arbitrario pero consistente)
      return a.id - b.id;
    })
    .slice(0, limit);
};

/**
 * Estadísticas del índice (útil para debugging)
 */
export const getIndexStats = (index: SearchIndex) => {
  return {
    totalParadas: index.totalParadas,
    uniqueWords: index.wordIndex.size,
    uniquePrefixes: index.prefixIndex.size,
    totalLineas: index.lineaIndex.size,
    indexedAt: index.indexedAt.toISOString(),
    avgWordsPerParada: index.wordIndex.size / index.totalParadas,
    memorySizeEstimate: `~${Math.round((
      index.wordIndex.size +
      index.prefixIndex.size +
      index.lineaIndex.size +
      index.paradaById.size
    ) / 1024)}KB`
  };
};
