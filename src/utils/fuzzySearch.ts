/**
 * Algoritmo de Fuzzy Search optimizado con Levenshtein Distance
 * Para búsquedas inteligentes tolerantes a errores tipográficos
 */

// Cache para resultados de distancia de Levenshtein
const levenshteinCache = new Map<string, number>();

/**
 * Calcula la distancia de Levenshtein entre dos strings (optimizado)
 * Usa programación dinámica con optimización de espacio O(min(m,n))
 */
export const levenshteinDistance = (a: string, b: string): number => {
  const key = `${a}|${b}`;
  if (levenshteinCache.has(key)) {
    return levenshteinCache.get(key)!;
  }

  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  // Optimización: siempre procesar el string más corto como 'a'
  if (a.length > b.length) {
    [a, b] = [b, a];
  }

  const aLen = a.length;
  const bLen = b.length;

  // Usar solo un array para ahorrar memoria
  let prevRow = Array.from({ length: aLen + 1 }, (_, i) => i);
  let currRow = new Array(aLen + 1);

  for (let j = 1; j <= bLen; j++) {
    currRow[0] = j;
    for (let i = 1; i <= aLen; i++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      currRow[i] = Math.min(
        prevRow[i] + 1,      // deletion
        currRow[i - 1] + 1,  // insertion
        prevRow[i - 1] + cost // substitution
      );
    }
    [prevRow, currRow] = [currRow, prevRow];
  }

  const result = prevRow[aLen];

  // Limitar cache a 1000 entradas para evitar memory leak
  if (levenshteinCache.size > 1000) {
    const firstKey = levenshteinCache.keys().next().value;
    if (firstKey !== undefined) {
      levenshteinCache.delete(firstKey);
    }
  }

  levenshteinCache.set(key, result);
  return result;
};

/**
 * Calcula una puntuación de similitud entre 0 y 1
 * 1 = coincidencia perfecta, 0 = muy diferente
 */
export const similarityScore = (a: string, b: string): number => {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 1;

  const distance = levenshteinDistance(a, b);
  return 1 - distance / maxLen;
};

/**
 * Fuzzy match: verifica si hay coincidencia parcial tolerante a errores
 * @param needle - término de búsqueda
 * @param haystack - texto donde buscar
 * @param threshold - umbral de similitud (0-1), por defecto 0.7
 */
export const fuzzyMatch = (needle: string, haystack: string, threshold: number = 0.7): boolean => {
  // Coincidencia exacta
  if (haystack.includes(needle)) return true;

  // Buscar coincidencia fuzzy en palabras
  const words = haystack.split(/\s+/);

  for (const word of words) {
    // Si la palabra es muy corta, requerir coincidencia exacta
    if (needle.length <= 2) {
      if (word.startsWith(needle)) return true;
      continue;
    }

    // Calcular similitud
    const score = similarityScore(needle, word);
    if (score >= threshold) return true;

    // También verificar si needle está contenido en word con pequeñas diferencias
    if (word.length >= needle.length) {
      for (let i = 0; i <= word.length - needle.length; i++) {
        const substring = word.substring(i, i + needle.length);
        const subScore = similarityScore(needle, substring);
        if (subScore >= threshold) return true;
      }
    }
  }

  return false;
};

/**
 * Calcula una puntuación de relevancia para un resultado de búsqueda
 * Considera múltiples factores: coincidencia exacta, fuzzy match, posición, etc.
 */
export const calculateRelevanceScore = (
  searchTerm: string,
  text: string,
  options: {
    exactMatchBonus?: number;
    startMatchBonus?: number;
    fuzzyThreshold?: number;
  } = {}
): number => {
  const {
    exactMatchBonus = 100,
    startMatchBonus = 50,
    fuzzyThreshold = 0.7
  } = options;

  let score = 0;
  const lowerText = text.toLowerCase();
  const lowerSearch = searchTerm.toLowerCase();

  // Coincidencia exacta (máxima puntuación)
  if (lowerText.includes(lowerSearch)) {
    score += exactMatchBonus;

    // Bonus si empieza con el término
    if (lowerText.startsWith(lowerSearch)) {
      score += startMatchBonus;
    }

    // Bonus por longitud de coincidencia
    score += (lowerSearch.length / lowerText.length) * 20;

    return score;
  }

  // Buscar coincidencias fuzzy en palabras
  const words = lowerText.split(/\s+/);
  const searchWords = lowerSearch.split(/\s+/);

  let maxWordScore = 0;

  for (const searchWord of searchWords) {
    for (const word of words) {
      const similarity = similarityScore(searchWord, word);

      if (similarity >= fuzzyThreshold) {
        const wordScore = similarity * 50;
        maxWordScore = Math.max(maxWordScore, wordScore);

        // Bonus si la palabra empieza similar
        if (word.startsWith(searchWord.substring(0, Math.min(3, searchWord.length)))) {
          maxWordScore += 10;
        }
      }
    }
  }

  score += maxWordScore;

  return score;
};

/**
 * Ordena un array de ítems por relevancia según un término de búsqueda
 */
export const sortByRelevance = <T>(
  items: T[],
  searchTerm: string,
  getText: (item: T) => string,
  threshold: number = 0
): T[] => {
  const itemsWithScore = items.map(item => ({
    item,
    score: calculateRelevanceScore(searchTerm, getText(item))
  }));

  return itemsWithScore
    .filter(({ score }) => score >= threshold)
    .sort((a, b) => b.score - a.score)
    .map(({ item }) => item);
};

/**
 * Limpia la cache de Levenshtein (útil para evitar memory leaks en sesiones largas)
 */
export const clearLevenshteinCache = () => {
  levenshteinCache.clear();
};
