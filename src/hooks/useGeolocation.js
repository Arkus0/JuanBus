import { useState, useEffect, useCallback } from 'react';

export const useGeolocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getUserLocation = useCallback(() => {
    return new Promise((resolve, reject) => {
      if (!('geolocation' in navigator)) {
        const error = 'Geolocalización no disponible';
        setLocationError(error);
        reject(error);
        return;
      }

      setLoadingLocation(true);
      setLocationError(null);

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const location = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          };
          setUserLocation(location);
          setLocationError(null);
          setLoadingLocation(false);
          resolve(location);
        },
        (err) => {
          setLocationError(err.message);
          setLoadingLocation(false);
          reject(err);
        },
        {
          enableHighAccuracy: false, // Más rápido, menos preciso
          timeout: 15000, // 15 segundos para dar más tiempo
          maximumAge: 60000 // Cachear por 1 minuto
        }
      );
    });
  }, []);

  // Obtener ubicación al montar
  useEffect(() => {
    getUserLocation();
  }, [getUserLocation]);

  return {
    userLocation,
    locationError,
    loadingLocation,
    getUserLocation // Exportar para reintentos
  };
};
