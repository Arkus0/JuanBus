// Diccionario de sinónimos y POIs → IDs de paradas relacionadas
export const SINONIMOS_POI = {
  // Hospitales y centros médicos
  'hospital': [22, 21, 332, 333], // Torrecárdenas, Materno, El Toyo
  'torrecardenas': [22, 21, 426], // Hospital + parking
  'materno': [21],
  'toyo': [332, 333],

  // Universidad y centros educativos
  'universidad': [144, 482], // Universidad
  'uni': [144, 482],
  'campus': [144],

  // Transporte
  'estacion': [292], // Estación Intermodal
  'intermodal': [292],
  'aeropuerto': [188],
  'aena': [188],

  // Comercio
  'ikea': [18],
  'carrefour': [56],
  'mediterraneo': [61, 67], // Centro Comercial Mediterráneo

  // Zonas y barrios
  'centro': [292, 420], // Centro ciudad
  'rambla': [80, 478],
  'zapillo': [165],
  'retamar': [192, 193, 195, 196],
  'alquian': [194, 195, 268, 457, 458],
  'nueva almeria': [138, 149, 150],

  // Deportes y ocio
  'estadio': [37, 320, 23, 385, 388], // Varios estadios
  'auditorio': [136, 152],
  'playa': [149, 443],
  'parque': [56, 57, 162],

  // Otros POIs
  'cementerio': [17],
  'alcazaba': [409],
  'cable ingles': [294, 318],
  'palmeral': [135, 164]
};
