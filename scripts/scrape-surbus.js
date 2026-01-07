// Script para hacer scraping de surbus.es y extraer líneas con sentidos
// Genera el nuevo formato de datos para LINEAS y PARADAS

import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import fs from 'fs';

const LINEAS_IDS = [1, 2, 3, 4, 6, 7, 10, 11, 12, 13, 14, 16, 17, 18, 20, 21, 22, 23];

async function scrapeLinea(lineaId) {
  const url = `https://www.surbusalmeria.es/tiempos-de-espera/linea/${lineaId}`;

  console.log(`\nScraping línea ${lineaId}...`);

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'es-ES,es;q=0.9',
      },
    });

    if (!response.ok) {
      console.error(`Error ${response.status} al cargar línea ${lineaId}`);
      return null;
    }

    const html = await response.text();
    const dom = new JSDOM(html);
    const document = dom.window.document;

    // Extraer nombre de la línea
    const lineaTitle = document.querySelector('h1, .linea-nombre, .page-title')?.textContent.trim();
    const lineaDescripcion = document.querySelector('.linea-descripcion, .descripcion')?.textContent.trim();

    // Extraer color si está disponible
    const colorElement = document.querySelector('[style*="background"]');
    let color = '#999999';
    if (colorElement) {
      const styleMatch = colorElement.getAttribute('style')?.match(/background[^:]*:\s*([^;]+)/);
      if (styleMatch) color = styleMatch[1].trim();
    }

    // Buscar todos los botones de parada con ConfigureButton
    // Formato: ConfigureButton("busStopButton0_X", "lineGuid", "busStopGuid", "lineBusStopGuid", state, paradaNum, nodeType)
    const configureButtonRegex = /ConfigureButton\s*\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*(\d+),\s*(\d+),\s*(\d+)\s*\)/g;

    const paradas = [];
    let match;
    while ((match = configureButtonRegex.exec(html)) !== null) {
      const [, buttonId, lineGuid, busStopGuid, lineBusStopGuid, state, paradaNum, nodeType] = match;

      // Buscar el nombre de la parada cerca del botón
      const buttonSelector = `#${buttonId.replace(/\./g, '\\.')}`;
      const buttonElement = document.querySelector(buttonSelector) ||
                           document.querySelector(`[id="${buttonId}"]`);

      let paradaNombre = 'Desconocida';
      if (buttonElement) {
        // Buscar nombre en el elemento padre o hermanos
        const container = buttonElement.closest('.parada, .bus-stop, li, tr, div[class*="stop"]');
        if (container) {
          const nombreElement = container.querySelector('.nombre, .stop-name, h3, h4, strong, b, span[class*="name"]');
          if (nombreElement) {
            paradaNombre = nombreElement.textContent.trim();
          } else {
            // Intentar obtener texto directo
            paradaNombre = container.textContent.trim().split('\n')[0].trim();
          }
        }
      }

      paradas.push({
        buttonId,
        paradaNum: parseInt(paradaNum),
        nodeType: parseInt(nodeType),
        nombre: paradaNombre,
        lineGuid,
        busStopGuid,
        lineBusStopGuid,
      });
    }

    // Agrupar paradas por nodeType (sentido)
    const sentidos = {};
    paradas.forEach(parada => {
      if (!sentidos[parada.nodeType]) {
        sentidos[parada.nodeType] = [];
      }
      sentidos[parada.nodeType].push(parada);
    });

    // Determinar nombres de sentidos (primera y última parada)
    const sentidosArray = Object.entries(sentidos).map(([nodeType, paradasSentido]) => {
      const ultimaParada = paradasSentido[paradasSentido.length - 1];

      return {
        id: nodeType,
        nombre: `Hacia ${ultimaParada.nombre}`,
        paradas: paradasSentido.map(p => p.paradaNum)
      };
    });

    return {
      id: lineaId,
      nombre: lineaTitle || `Línea ${lineaId}`,
      color: color,
      descripcion: lineaDescripcion || '',
      sentidos: sentidosArray,
      _raw_paradas: paradas // para debug
    };

  } catch (error) {
    console.error(`Error scrapeando línea ${lineaId}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🚌 Iniciando scraping de Surbus Almería...\n');

  const lineas = [];

  for (const lineaId of LINEAS_IDS) {
    const lineaData = await scrapeLinea(lineaId);
    if (lineaData) {
      lineas.push(lineaData);
      console.log(`✓ Línea ${lineaId}: ${lineaData.nombre} (${lineaData.sentidos.length} sentidos, ${lineaData._raw_paradas.length} paradas)`);
    }

    // Esperar un poco entre requests para no saturar
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Guardar resultado
  const output = {
    fecha: new Date().toISOString(),
    lineas: lineas,
  };

  fs.writeFileSync('./surbus-data.json', JSON.stringify(output, null, 2));
  console.log(`\n✓ Datos guardados en surbus-data.json`);
  console.log(`Total líneas: ${lineas.length}`);
  console.log(`Total sentidos: ${lineas.reduce((sum, l) => sum + l.sentidos.length, 0)}`);
}

main().catch(console.error);
