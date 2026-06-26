#!/usr/bin/env node
const BASE = 'https://www.surbusalmeria.es';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const get = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
};

const main = async () => {
  const paradasHtml = await get(`${BASE}/tiempos-de-espera/paradas`);

  const idx = paradasHtml.indexOf('reloadNear');
  console.log('--- reloadNear context ---');
  console.log(paradasHtml.slice(Math.max(0, idx - 1500), idx + 1500));

  console.log('--- NearBusStops occurrences ---');
  let pos = 0;
  while (true) {
    const i = paradasHtml.indexOf('NearBusStops', pos);
    if (i === -1) break;
    console.log(paradasHtml.slice(Math.max(0, i - 800), i + 200));
    console.log('====');
    pos = i + 1;
  }

  console.log('--- Trying NearBusStops endpoint variants ---');
  const attempts = [
    { method: 'GET', url: `${BASE}/es/WaitTime/NearBusStops?latitude=36.84&longitude=-2.46&accuracy=20000` },
    { method: 'POST', url: `${BASE}/es/WaitTime/NearBusStops`, body: 'latitude=36.84&longitude=-2.46&accuracy=20000', headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
    { method: 'POST', url: `${BASE}/es/WaitTime/NearBusStops`, body: JSON.stringify({ latitude: 36.84, longitude: -2.46, accuracy: 20000 }), headers: { 'Content-Type': 'application/json' } },
  ];
  for (const a of attempts) {
    try {
      const res = await fetch(a.url, {
        method: a.method,
        headers: { 'User-Agent': UA, 'X-Requested-With': 'XMLHttpRequest', ...(a.headers || {}) },
        body: a.body,
      });
      const text = await res.text();
      console.log(`ATTEMPT ${a.method} ${a.url} body=${a.body ?? ''} -> HTTP ${res.status}`);
      console.log(text.slice(0, 2000));
      console.log('====');
    } catch (e) {
      console.log(`ATTEMPT ${a.method} ${a.url} FAILED: ${e.message}`);
    }
  }

  console.log('--- New stop pages (159, 279, 439, 479) ---');
  for (const id of [159, 279, 439, 479]) {
    try {
      const html = await get(`${BASE}/tiempos-de-espera/parada/${id}`);
      console.log(`PARADA ${id} length=${html.length}`);
      const titleMatch = html.match(/<title>([^<]*)<\/title>/);
      console.log('title:', titleMatch ? titleMatch[1] : null);
      const hasLat = /lat|lng|coord/i.test(html);
      console.log('mentions lat/lng/coord:', hasLat);
    } catch (e) {
      console.log(`PARADA ${id} FETCH_ERROR ${e.message}`);
    }
  }

  console.error('DONE');
};

main().catch((e) => {
  console.error('FETCH_ERROR', e.message);
  process.exit(1);
});
