#!/usr/bin/env node
const BASE = 'https://www.surbusalmeria.es';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const get = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
};

const lineIdRegex = /\/tiempos-de-espera\/linea\/(\d+)/g;
const stopIdRegex = /ConfigureButton\s*\(\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*"[^"]+"\s*,\s*\d+\s*,\s*(\d+)\s*,\s*\d+\s*\)/g;
const busStopLinkRegex = /<a href="\/tiempos-de-espera\/parada\/(\d+)" class="busStopLink">[\s\S]*?<span class="name">([^<]*)<\/span>/g;

const main = async () => {
  const lineasHtml = await get(`${BASE}/tiempos-de-espera/lineas`);
  const lineIds = Array.from(new Set([...lineasHtml.matchAll(lineIdRegex)].map((m) => Number(m[1])))).sort((a, b) => a - b);

  const paradasHtml = await get(`${BASE}/tiempos-de-espera/paradas`);
  const stopNames = new Map();
  for (const m of paradasHtml.matchAll(busStopLinkRegex)) {
    stopNames.set(Number(m[1]), m[2].trim());
  }

  const stopLines = new Map();
  for (const lineId of lineIds) {
    const html = await get(`${BASE}/tiempos-de-espera/linea/${lineId}`);
    for (const m of html.matchAll(stopIdRegex)) {
      const stopId = Number(m[1]);
      if (!stopLines.has(stopId)) stopLines.set(stopId, new Set());
      stopLines.get(stopId).add(lineId);
    }
  }

  const allStopIds = new Set([...stopNames.keys(), ...stopLines.keys()]);
  const stops = Array.from(allStopIds)
    .sort((a, b) => a - b)
    .map((id) => ({
      id,
      nombre: stopNames.get(id) ?? null,
      lineas: stopLines.has(id) ? Array.from(stopLines.get(id)).sort((a, b) => a - b) : []
    }));

  console.log('LINEIDS:' + JSON.stringify(lineIds));
  for (const s of stops) {
    console.log('STOP:' + JSON.stringify(s));
  }
  console.error(`DONE lines=${lineIds.length} stops=${stops.length}`);
};

main().catch((e) => {
  console.error('FETCH_ERROR', e.message);
  process.exit(1);
});
