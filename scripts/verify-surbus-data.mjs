#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

const SURBUS_BASE = 'https://www.surbusalmeria.es';
const LINES_URL = `${SURBUS_BASE}/tiempos-de-espera/lineas`;

const rootDir = process.cwd();
const paradasPath = path.join(rootDir, 'src/data/paradas.json');
const lineasPath = path.join(rootDir, 'src/data/lineas.json');
const reportPath = path.join(rootDir, 'surbus-data-check-report.md');

const withTimeout = async (url, timeoutMs = 20000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'JuanBusDataVerifier/1.0 (+https://github.com/)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status} al consultar ${url}`);
    }

    return response.text();
  } finally {
    clearTimeout(timer);
  }
};

const parseLineIds = (html) => {
  const ids = new Set();
  const regex = /\/tiempos-de-espera\/linea\/(\d+)/g;
  let match;

  while ((match = regex.exec(html)) !== null) {
    ids.add(Number(match[1]));
  }

  return Array.from(ids).sort((a, b) => a - b);
};

const parseStopIdsFromLineHtml = (html) => {
  const stopIds = new Set();
  const regex = /ConfigureButton\s*\(\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*\d+\s*,\s*(\d+)\s*,\s*\d+\s*\)/g;

  let match;
  while ((match = regex.exec(html)) !== null) {
    stopIds.add(Number(match[1]));
  }

  return stopIds;
};

const toSortedArray = (set) => Array.from(set).sort((a, b) => a - b);

const main = async () => {
  const [paradasRaw, lineasRaw] = await Promise.all([
    fs.readFile(paradasPath, 'utf-8'),
    fs.readFile(lineasPath, 'utf-8')
  ]);

  const localParadas = JSON.parse(paradasRaw);
  const localLineas = JSON.parse(lineasRaw);
  const localStopIds = new Set(localParadas.map((p) => p.id));
  const localLineIds = new Set(localLineas.map((l) => l.id));

  const linesPageHtml = await withTimeout(LINES_URL);
  const remoteLineIds = parseLineIds(linesPageHtml);

  if (remoteLineIds.length === 0) {
    throw new Error('No se pudieron extraer líneas desde Surbus.');
  }

  const remoteStopsByLine = new Map();
  const remoteLinesByStop = new Map();

  await Promise.all(
    remoteLineIds.map(async (lineId) => {
      const lineHtml = await withTimeout(`${SURBUS_BASE}/tiempos-de-espera/linea/${lineId}`);
      const stopIds = parseStopIdsFromLineHtml(lineHtml);
      remoteStopsByLine.set(lineId, stopIds);

      for (const stopId of stopIds) {
        if (!remoteLinesByStop.has(stopId)) {
          remoteLinesByStop.set(stopId, new Set());
        }
        remoteLinesByStop.get(stopId).add(lineId);
      }
    })
  );

  const remoteStopIds = new Set(remoteLinesByStop.keys());

  const missingStopsInLocal = toSortedArray(new Set([...remoteStopIds].filter((id) => !localStopIds.has(id))));
  const staleStopsInLocal = toSortedArray(new Set([...localStopIds].filter((id) => !remoteStopIds.has(id))));

  const missingLinesInLocal = remoteLineIds.filter((id) => !localLineIds.has(id));
  const staleLinesInLocal = [...localLineIds].filter((id) => !remoteLineIds.includes(id)).sort((a, b) => a - b);

  const stopLineDiffs = [];
  for (const parada of localParadas) {
    const remoteLineSet = remoteLinesByStop.get(parada.id);
    if (!remoteLineSet) continue;

    const localSet = new Set(parada.lineas);
    const remoteSet = remoteLineSet;

    const onlyLocal = [...localSet].filter((l) => !remoteSet.has(l)).sort((a, b) => a - b);
    const onlyRemote = [...remoteSet].filter((l) => !localSet.has(l)).sort((a, b) => a - b);

    if (onlyLocal.length > 0 || onlyRemote.length > 0) {
      stopLineDiffs.push({
        stopId: parada.id,
        nombre: parada.nombre,
        onlyLocal,
        onlyRemote
      });
    }
  }

  const now = new Date().toISOString();
  const reportLines = [
    '# Surbus data check report',
    '',
    `Fecha UTC: ${now}`,
    `Líneas remotas detectadas: ${remoteLineIds.length}`,
    `Paradas remotas detectadas: ${remoteStopIds.size}`,
    `Líneas locales: ${localLineIds.size}`,
    `Paradas locales: ${localStopIds.size}`,
    '',
    `- Líneas faltantes en local: ${missingLinesInLocal.length}`,
    `- Líneas obsoletas en local: ${staleLinesInLocal.length}`,
    `- Paradas faltantes en local: ${missingStopsInLocal.length}`,
    `- Paradas obsoletas en local: ${staleStopsInLocal.length}`,
    `- Paradas con diferencias de líneas: ${stopLineDiffs.length}`,
    ''
  ];

  if (missingLinesInLocal.length) reportLines.push(`## Líneas faltantes\n${missingLinesInLocal.join(', ')}\n`);
  if (staleLinesInLocal.length) reportLines.push(`## Líneas obsoletas\n${staleLinesInLocal.join(', ')}\n`);
  if (missingStopsInLocal.length) reportLines.push(`## Paradas faltantes\n${missingStopsInLocal.join(', ')}\n`);
  if (staleStopsInLocal.length) reportLines.push(`## Paradas obsoletas\n${staleStopsInLocal.join(', ')}\n`);

  if (stopLineDiffs.length) {
    reportLines.push('## Paradas con líneas diferentes', '');
    stopLineDiffs.slice(0, 100).forEach((diff) => {
      reportLines.push(
        `- #${diff.stopId} ${diff.nombre} | solo local: [${diff.onlyLocal.join(', ')}] | solo remoto: [${diff.onlyRemote.join(', ')}]`
      );
    });
    if (stopLineDiffs.length > 100) {
      reportLines.push(`- ... y ${stopLineDiffs.length - 100} más`);
    }
    reportLines.push('');
  }

  await fs.writeFile(reportPath, `${reportLines.join('\n')}\n`, 'utf-8');

  const hasChanges =
    missingLinesInLocal.length > 0 ||
    staleLinesInLocal.length > 0 ||
    missingStopsInLocal.length > 0 ||
    staleStopsInLocal.length > 0 ||
    stopLineDiffs.length > 0;

  if (hasChanges) {
    console.error('Se detectaron diferencias entre la app y Surbus. Revisa surbus-data-check-report.md');
    process.exit(1);
  }

  console.log('Datos locales alineados con Surbus.');
};

main().catch(async (error) => {
  const message = `# Surbus data check report\n\nError ejecutando verificación: ${error.message}\n`;
  await fs.writeFile(reportPath, message, 'utf-8');
  console.error(error.message);
  process.exit(2);
});
