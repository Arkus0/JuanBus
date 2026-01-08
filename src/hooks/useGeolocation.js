import { useState, useEffect, useCallback } from 'react';

export const useGeolocation = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const getUserLocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocalización no disponible');
      return;
    }

    setLoadingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLocation({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        });
        setLocationError(null);
        setLoadingLocation(false);
      },
      (err) => {
        setLocationError(err.message);
        setLoadingLocation(false);
      },
      {
        enableHighAccuracy: false, // Más rápido, menos preciso
        timeout: 5000, // 5 segundos (reducido de 10)
        maximumAge: 60000 // Cachear por 1 minuto
      }
    );
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
