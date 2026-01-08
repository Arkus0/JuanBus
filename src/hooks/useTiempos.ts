import { useState, useCallback, useEffect } from 'react';
import type { Parada, TiemposMap } from '../types';
import { fetchTiempoEspera } from '../utils/api';

export const useTiempos = (selectedParada: Parada | null, autoRefresh: boolean, isOnline: boolean) => {
  const [tiempos, setTiempos] = useState<TiemposMap>({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  // Cargar tiempos con límite de caché
  const loadTiempos = useCallback(async (parada: Parada) => {
    if (!parada) return;
    setLoading(true);
    const nuevo: TiemposMap = {};
    await Promise.all(parada.lineas.map(async (l) => {
      nuevo[`${parada.id}-${l}`] = await fetchTiempoEspera(parada.id, l);
    }));

    // Limitar caché a últimas 100 entradas para evitar memory leak
    setTiempos(prev => {
      const combined = { ...prev, ...nuevo };
      const keys = Object.keys(combined);
      if (keys.length > 100) {
        const recentKeys = keys.slice(-100);
        return Object.fromEntries(recentKeys.map(k => [k, combined[k]]));
      }
      return combined;
    });

    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  // Auto-refresh con prevención de race conditions
  useEffect(() => {
    if (!selectedParada || !isOnline) return;

    let isCancelled = false;

    const loadData = async () => {
      if (!isCancelled) {
        await loadTiempos(selectedParada);
      }
    };

    loadData(); // Carga inicial

    let intervalId: NodeJS.Timeout | undefined;
    if (autoRefresh) {
      intervalId = setInterval(loadData, 30000);
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
