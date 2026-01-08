import type { TiempoEspera, Parada, Linea } from '../types';

export const shareWaitTimeViaWhatsApp = (
  lineaId: number,
  linea: Linea | undefined,
  parada: Parada,
  tiempo: TiempoEspera | undefined
) => {
  // Generar mensaje
  let mensaje = `Línea ${lineaId}`;
  if (linea) {
    mensaje += ` (${linea.nombre})`;
  }
  mensaje += ` en ${parada.nombre}: `;

  if (tiempo?.success && tiempo.waitTimeString) {
    const mins = parseInt(tiempo.waitTimeString);
    if (!isNaN(mins)) {
      mensaje += `llega en ${mins} ${mins === 1 ? 'minuto' : 'minutos'}`;
    } else {
      mensaje += tiempo.waitTimeString;
    }
  } else {
    mensaje += 'Sin datos';
  }

  // Abrir WhatsApp
  const urlMensaje = encodeURIComponent(mensaje);
  window.open(`https://wa.me/?text=${urlMensaje}`, '_blank');
};
