import { useState, useEffect, useMemo } from 'react';
import type { Favorito } from '../types';
import { safeJsonParse } from '../utils/formatters';

export const useFavoritos = () => {
  const [favoritos, setFavoritos] = useState<Favorito[]>(() => {
    const stored = safeJsonParse(localStorage.getItem('surbus_fav'), []);
    // Migrar formato viejo [123, 456] a nuevo [{ id: 123 }, { id: 456 }]
    if (stored.length > 0 && typeof stored[0] === 'number') {
      return stored.map((id: number) => ({ id }));
    }
    return stored;
  });

  const [casaDireccion, setCasaDireccion] = useState<string>(() =>
    localStorage.getItem('surbus_casa_direccion') || ''
  );

  const [trabajoDireccion, setTrabajoDireccion] = useState<string>(() =>
    localStorage.getItem('surbus_trabajo_direccion') || ''
  );

  // Paradas especiales: Casa y Trabajo
  const casaParadaId = useMemo(() => {
    const parada = favoritos.find(f => f.casa);
    return parada ? parada.id : null;
  }, [favoritos]);

  const trabajoParadaId = useMemo(() => {
    const parada = favoritos.find(f => f.trabajo);
    return parada ? parada.id : null;
  }, [favoritos]);

  // Guardar favoritos en localStorage
  useEffect(() => {
    localStorage.setItem('surbus_fav', JSON.stringify(favoritos));
  }, [favoritos]);

  // Guardar dirección de casa en localStorage
  useEffect(() => {
    if (casaDireccion) {
      localStorage.setItem('surbus_casa_direccion', casaDireccion);
    } else {
      localStorage.removeItem('surbus_casa_direccion');
    }
  }, [casaDireccion]);

  // Guardar dirección de trabajo en localStorage
  useEffect(() => {
    if (trabajoDireccion) {
      localStorage.setItem('surbus_trabajo_direccion', trabajoDireccion);
    } else {
      localStorage.removeItem('surbus_trabajo_direccion');
    }
  }, [trabajoDireccion]);

  const toggleFavorito = (id: number) => {
    setFavoritos(prev => {
      const exists = prev.find(f => f.id === id);
      if (exists) {
        return prev.filter(f => f.id !== id);
      } else {
        return [...prev, { id }];
      }
    });
  };

  const toggleCasa = (id: number) => {
    setFavoritos(prev => {
      const exists = prev.find(f => f.id === id);
      if (exists) {
        return prev.map(f =>
          f.id === id ? { ...f, casa: !f.casa } : { ...f, casa: false }
        );
      } else {
        return [...prev.map(f => ({ ...f, casa: false })), { id, casa: true }];
      }
    });
  };

  const toggleTrabajo = (id: number) => {
    setFavoritos(prev => {
      const exists = prev.find(f => f.id === id);
      if (exists) {
        return prev.map(f =>
          f.id === id ? { ...f, trabajo: !f.trabajo } : { ...f, trabajo: false }
        );
      } else {
        return [...prev.map(f => ({ ...f, trabajo: false })), { id, trabajo: true }];
      }
    });
  };

  return {
    favoritos,
    casaParadaId,
    trabajoParadaId,
    casaDireccion,
    trabajoDireccion,
    setCasaDireccion,
    setTrabajoDireccion,
    toggleFavorito,
    toggleCasa,
    toggleTrabajo
  };
};
