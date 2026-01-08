import { useState, useCallback, useEffect } from 'react';
import type { Parada, TiemposMap } from '../types';
import { fetchTiempoEspera } from '../utils/api';

// Configuración de cache persistente
const CACHE_KEY = 'surbus_tiempos_cache';
const CACHE_EXPIRY_MS = 5 * 60 * 1000; // 5 minutos
const MAX_CACHE_ENTRIES = 50; // Limitar para evitar exceder localStorage

interface CachedTiempo {
  data: any;
  timestamp: number;
}

interface TiemposCache {
  [key: string]: CachedTiempo;
}

/**
 * Hook de tiempos de espera optimizado con cache persistente
 * - Cache en localStorage para funcionalidad offline mejorada
 * - Expiración automática de datos antiguos
 * - Prevención de race conditions
 * - Auto-refresh configurable
 */
export const useTiempos = (selectedParada: Parada | null, autoRefresh: boolean, isOnline: boolean) => {
  const [tiempos, setTiempos] = useState<TiemposMap>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Cargar cache desde localStorage
  const loadFromCache = useCallback((key: string): any | null => {
    try {
      const cache = localStorage.getItem(CACHE_KEY);
      if (!cache) return null;

      const parsed: TiemposCache = JSON.parse(cache);
      const cached = parsed[key];

      if (!cached) return null;

      // Verificar si expiró
      const now = Date.now();
      if (now - cached.timestamp > CACHE_EXPIRY_MS) {
        return null;
      }

      return cached.data;
    } catch {
      return null;
    }
  }, []);

  // Guardar en cache
  const saveToCache = useCallback((key: string, data: any) => {
    try {
      const cache = localStorage.getItem(CACHE_KEY);
      let parsed: TiemposCache = cache ? JSON.parse(cache) : {};

      // Agregar nuevo dato
      parsed[key] = {
        data,
        timestamp: Date.now()
      };

      // Limpiar entradas expiradas y limitar tamaño
      const now = Date.now();
      const entries = Object.entries(parsed)
        .filter(([_, v]) => now - v.timestamp <= CACHE_EXPIRY_MS)
        .sort((a, b) => b[1].timestamp - a[1].timestamp)
        .slice(0, MAX_CACHE_ENTRIES);

      parsed = Object.fromEntries(entries);

      localStorage.setItem(CACHE_KEY, JSON.stringify(parsed));
    } catch (error) {
      // Si localStorage está lleno, limpiar cache antiguo
      try {
        localStorage.removeItem(CACHE_KEY);
      } catch {
        // Ignorar errores de localStorage
      }
    }
  }, []);

  // Cargar tiempos con cache inteligente
  const loadTiempos = useCallback(async (parada: Parada) => {
    if (!parada) return;
    setLoading(true);

    const nuevo: TiemposMap = {};

    // Cargar datos (desde cache si offline, o desde API si online)
    await Promise.all(parada.lineas.map(async (l) => {
      const key = `${parada.id}-${l}`;

      // Si estamos offline, intentar usar cache
      if (!isOnline) {
        const cached = loadFromCache(key);
        if (cached) {
          nuevo[key] = cached;
          return;
        }
      }

      // Si estamos online, obtener datos frescos
      try {
        const data = await fetchTiempoEspera(parada.id, l);
        nuevo[key] = data;

        // Guardar en cache para uso offline futuro
        if (data?.success) {
          saveToCache(key, data);
        }
      } catch (error) {
        // En caso de error, intentar usar cache como fallback
        const cached = loadFromCache(key);
        if (cached) {
          nuevo[key] = cached;
        }
      }
    }));

    // Actualizar estado con límite de memoria
    setTiempos(prev => {
      const combined = { ...prev, ...nuevo };
      const keys = Object.keys(combined);

      // Limitar a 100 entradas en memoria para evitar memory leak
      if (keys.length > 100) {
        const recentKeys = keys.slice(-100);
        return Object.fromEntries(recentKeys.map(k => [k, combined[k]]));
      }

      return combined;
    });

    setLastUpdate(new Date());
    setLoading(false);
  }, [isOnline, loadFromCache, saveToCache]);

  // Auto-refresh con prevención de race conditions
  useEffect(() => {
    if (!selectedParada) return;

    let isCancelled = false;

    const loadData = async () => {
      if (!isCancelled) {
        await loadTiempos(selectedParada);
      }
    };

    loadData(); // Carga inicial

    // Solo auto-refresh si estamos online
    let intervalId: NodeJS.Timeout | undefined;
    if (autoRefresh && isOnline) {
      intervalId = setInterval(loadData, 30000); // 30 segundos
    }

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedParada, autoRefresh, isOnline, loadTiempos]);

  return {
    tiempos,
    loading,
    lastUpdate,
    loadTiempos
  };
};

/**
 * Limpia el cache de tiempos expirados
 */
export const cleanExpiredTiemposCache = (): void => {
  try {
    const cache = localStorage.getItem(CACHE_KEY);
    if (!cache) return;

    const parsed: TiemposCache = JSON.parse(cache);
    const now = Date.now();

    const validEntries = Object.entries(parsed)
      .filter(([_, v]) => now - v.timestamp <= CACHE_EXPIRY_MS);

    if (validEntries.length === 0) {
      localStorage.removeItem(CACHE_KEY);
    } else {
      localStorage.setItem(CACHE_KEY, JSON.stringify(Object.fromEntries(validEntries)));
    }
  } catch {
    // Ignorar errores
  }
};
