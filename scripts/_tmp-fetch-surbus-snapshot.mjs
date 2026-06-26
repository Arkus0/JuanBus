#!/usr/bin/env node
const BASE = 'https://www.surbusalmeria.es';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const get = async (url) => {
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  return res.text();
};

const dumpMatches = (html, label, regex) => {
  console.log(`--- ${label} ---`);
  let m;
  let count = 0;
  while ((m = regex.exec(html)) && count < 10) {
    const start = Math.max(0, m.index - 150);
    const end = Math.min(html.length, m.index + 150);
    console.log(html.slice(start, end).replace(/\n/g, ' '));
    console.log('---');
    count++;
  }
  if (count === 0) console.log('(no matches)');
};

const main = async () => {
  for (const id of [159, 7]) {
    const html = await get(`${BASE}/tiempos-de-espera/parada/${id}`);
    console.log(`\n===== PARADA ${id} (length ${html.length}) =====`);
    dumpMatches(html, 'coord', /coord/gi);
    dumpMatches(html, 'lat (word boundary)', /\blat\b|latitude|latitud/gi);
    dumpMatches(html, 'lng/lon', /\blng\b|longitude|longitud/gi);
    dumpMatches(html, 'data-* attrs', /data-[a-z-]+="[^"]*"/gi);
    dumpMatches(html, 'script src', /<script[^>]*src="[^"]*"[^>]*>/gi);
  }

  console.error('DONE');
};

main().catch((e) => {
  console.error('FETCH_ERROR', e.message);
  process.exit(1);
});
