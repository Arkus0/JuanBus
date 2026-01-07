// Nueva estructura de datos con sentidos
// Basado en datos reales de surbus.es

// ═══════════════════════════════════════════════════════════════════════════
// NUEVA ESTRUCTURA DE LINEAS (con sentidos y paradas ordenadas)
// ═══════════════════════════════════════════════════════════════════════════

export const LINEAS_NUEVAS = [
  {
    id: 1,
    nombre: "Obispo Orberá",
    color: "#8B4513", // Marrón
    descripcion: "Recorre el centro histórico",
    sentidos: [
      {
        id: "A",
        nombre: "Hacia Avenida del Mar 39",
        paradaFinal: "Avenida del Mar 39",
        paradas: [
          7,    // Stella Maris
          479,  // Hermanos Machado
          293,  // Artés de Arcos
          273,  // Carretera de Ronda 31
          292,  // Estación Intermodal
          415,  // Nicolás Salmerón 8
          414,  // Nicolás Salmerón 20
          413,  // Nicolás Salmerón 40
          412,  // Nicolás Salmerón 52
          79    // Avenida del Mar 39
        ]
      },
      {
        id: "B",
        nombre: "Hacia Arquímedes",
        paradaFinal: "Arquímedes",
        paradas: [
          506,  // Plaza del Carmen
          507,  // Plaza de la Administración Vieja
          null, // Plaza Marqués de Heredia (Provis.) - sin ID conocido
          6,    // Paseo-Delegación de Gobierno
          406,  // Puerta del Mar
          407,  // Paseo San Luis 7
          408,  // La Reina 17
          409,  // Alcazaba
          410,  // Reducto 8
          411,  // Reducto 92
          440   // Arquímedes
        ]
      }
    ]
  },
  {
    id: 2,
    nombre: "Hospital Universitario Torrecárdenas",
    color: "#E63946", // Rojo
    descripcion: "De Rambla-Celia Viñas a Hospital Universitario Torrecárdenas",
    sentidos: [
      {
        id: "A",
        nombre: "Hacia Hospital Universitario Torrecárdenas",
        paradaFinal: "Hospital Universitario Torrecárdenas",
        paradas: [
          32,   // Gregorio Marañón 45
          31,   // Sanidad
          30,   // Ronda-Juzgados
          29,   // Ronda-Cruz Roja
          28,   // Ronda-Bola Azul
          27,   // Ronda-La Magnesita
          392,  // Italia-Parque
          394,  // Italia 11
          67,   // Centro Comercial Mediterráneo
          403,  // Colegio Almería Norte
          307,  // Domingo Artés 20
          23,   // Estadio Municipal Juan Rojas
          426   // Parking Hospital
        ]
      },
      {
        id: "B",
        nombre: "Hacia Rambla 9",
        paradaFinal: "Rambla 9",
        paradas: [
          420,  // Rambla 9
          400,  // Canónigo Molina Alonso
          292,  // Estación Intermodal
          401,  // Carretera de Ronda 78
          9,    // Ronda-Sanidad
          10,   // Ronda-Blas Infante
          11,   // Cruz Roja
          12,   // Bola Azul
          13,   // La Magnesita
          391,  // Italia 6
          393,  // Italia-Tito Pedro
          61,   // Av. Mediterráneo-Centro Comercial
          396,  // Av. Mediterráneo-Hotel Elba
          402,  // Parroquia Jesucristo Redentor
          423,  // Av. Mediterráneo-Colegio Europa
          19,   // Carretera de Huércal 24
          20,   // Carretera de Huércal 56
          21    // Materno Infantil
        ]
      }
    ]
  }
];

// ═══════════════════════════════════════════════════════════════════════════
// NUEVA ESTRUCTURA DE PARADAS (con referencias a sentidos específicos)
// ═══════════════════════════════════════════════════════════════════════════

// Nuevo formato: en lugar de lineas: [1, 2, 3]
// Ahora será: lineas: [{lineaId: 1, sentidoId: "A"}, {lineaId: 1, sentidoId: "B"}]

export function generarParadasConSentidos(paradasOriginales, lineasNuevas) {
  const paradasActualizadas = JSON.parse(JSON.stringify(paradasOriginales)); // Deep clone

  // Crear índice de paradas por línea y sentido
  const indiceLineaSentidoParada = {};

  lineasNuevas.forEach(linea => {
    linea.sentidos.forEach(sentido => {
      sentido.paradas.forEach((paradaId, orden) => {
        if (paradaId === null) return; // Saltar paradas sin ID

        const key = `${linea.id}-${sentido.id}-${paradaId}`;
        indiceLineaSentidoParada[key] = {
          lineaId: linea.id,
          sentidoId: sentido.id,
          sentidoNombre: sentido.nombre,
          orden: orden + 1,
          totalParadas: sentido.paradas.filter(p => p !== null).length
        };
      });
    });
  });

  // Actualizar cada parada con la información de sentidos
  paradasActualizadas.forEach(parada => {
    const nuevasLineas = [];

    // Para cada línea que actualmente tiene la parada
    parada.lineas.forEach(lineaId => {
      const linea = lineasNuevas.find(l => l.id === lineaId);

      if (!linea) {
        // Si la línea no está en las nuevas, mantener el formato antiguo temporalmente
        nuevasLineas.push(lineaId);
        return;
      }

      // Buscar en qué sentidos está esta parada
      linea.sentidos.forEach(sentido => {
        const key = `${lineaId}-${sentido.id}-${parada.id}`;
        const info = indiceLineaSentidoParada[key];

        if (info) {
          nuevasLineas.push({
            lineaId: info.lineaId,
            sentidoId: info.sentidoId,
            sentidoNombre: info.sentidoNombre,
            orden: info.orden,
            totalParadas: info.totalParadas
          });
        }
      });
    });

    parada.lineas = nuevasLineas;
  });

  return paradasActualizadas;
}

// ═══════════════════════════════════════════════════════════════════════════
// FUNCIONES AUXILIARES PARA TRABAJAR CON SENTIDOS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Obtiene las paradas de una línea en un sentido específico, ordenadas
 */
export function getParadasEnSentido(lineaId, sentidoId, lineas, paradas) {
  const linea = lineas.find(l => l.id === lineaId);
  if (!linea) return [];

  const sentido = linea.sentidos.find(s => s.id === sentidoId);
  if (!sentido) return [];

  return sentido.paradas
    .filter(pid => pid !== null)
    .map(pid => paradas.find(p => p.id === pid))
    .filter(p => p !== undefined);
}

/**
 * Verifica si dos paradas están en el mismo sentido de una línea
 * y si el sentido va de origen a destino (no al revés)
 */
export function validarSentidoRuta(lineaId, paradaOrigenId, paradaDestinoId, lineas) {
  const linea = lineas.find(l => l.id === lineaId);
  if (!linea) return { valido: false, sentidoId: null };

  // Buscar en cada sentido
  for (const sentido of linea.sentidos) {
    const indexOrigen = sentido.paradas.indexOf(paradaOrigenId);
    const indexDestino = sentido.paradas.indexOf(paradaDestinoId);

    if (indexOrigen !== -1 && indexDestino !== -1) {
      // Ambas paradas están en este sentido
      // Verificar que origen viene ANTES que destino
      if (indexOrigen < indexDestino) {
        return {
          valido: true,
          sentidoId: sentido.id,
          sentidoNombre: sentido.nombre,
          numParadas: indexDestino - indexOrigen + 1
        };
      }
    }
  }

  return { valido: false, sentidoId: null };
}

/**
 * Obtiene los sentidos en los que está una parada para una línea específica
 */
export function getSentidosDeParada(paradaId, lineaId, paradas) {
  const parada = paradas.find(p => p.id === paradaId);
  if (!parada) return [];

  return parada.lineas.filter(l =>
    typeof l === 'object' && l.lineaId === lineaId
  );
}
