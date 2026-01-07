// Formatear distancia en metros a formato legible
export const formatDistance = (m) => {
  if (typeof m !== 'number' || !isFinite(m)) return '- m';
  return m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`;
};

// Formatear tiempo de espera con color según urgencia
export const formatTiempo = (tiempo, theme) => {
  if (!tiempo?.success) return { text: 'Sin datos', color: theme.textMuted };
  if (!tiempo.waitTimeString) {
    return {
      text: tiempo.waitTimeType === 3 ? 'Sin servicio' : '...',
      color: theme.textMuted
    };
  }
  const mins = parseInt(tiempo.waitTimeString);
  if (isNaN(mins)) return { text: tiempo.waitTimeString, color: theme.accent };
  if (mins <= 3) return { text: `${mins} min`, color: theme.success };
  if (mins <= 10) return { text: `${mins} min`, color: theme.warning };
  return { text: `${mins} min`, color: theme.danger };
};

// Normalizar texto: eliminar acentos y convertir a minúsculas
export const normalizeText = (str) => {
  if (typeof str !== 'string') return '';
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
};

// Parse JSON seguro con fallback y validación de tipo
export const safeJsonParse = (value, fallback) => {
  try {
    if (value === null || value === undefined) return fallback;
    const parsed = JSON.parse(value);
    // Validar que el tipo coincide con el fallback
    if (Array.isArray(fallback) && !Array.isArray(parsed)) return fallback;
    if (typeof fallback === 'object' && typeof parsed !== 'object') return fallback;
    return parsed;
  } catch {
    return fallback;
  }
};
