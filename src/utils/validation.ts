// Validar coordenadas geográficas
export const validateCoords = (lat: number, lng: number): boolean => {
  if (typeof lat !== 'number' || !isFinite(lat) || lat < -90 || lat > 90) {
    throw new Error('Latitud inválida');
  }
  if (typeof lng !== 'number' || !isFinite(lng) || lng < -180 || lng > 180) {
    throw new Error('Longitud inválida');
  }
  return true;
};

// Sanitizar entrada de texto (limitar longitud y caracteres especiales)
export const sanitizeInput = (input: string, maxLength = 100): string => {
  if (typeof input !== 'string') return '';
  return input.slice(0, maxLength).trim();
};

// Validar parámetros de URL para Google Maps
export const validateGoogleMapsParams = (origin: any, destination: any): boolean => {
  if (!origin || !destination) {
    throw new Error('Origen y destino son requeridos');
  }
  // Si son coordenadas, validarlas
  const coordRegex = /^-?\d+\.?\d*,-?\d+\.?\d*$/;
  if (coordRegex.test(origin)) {
    const [lat, lng] = origin.split(',').map(parseFloat);
    validateCoords(lat, lng);
  }
  if (coordRegex.test(destination)) {
    const [lat, lng] = destination.split(',').map(parseFloat);
    validateCoords(lat, lng);
  }
  return true;
};
