#!/usr/bin/env node
const UA = 'JuanBusDataUpdate/1.0 (https://github.com/Arkus0/JuanBus; one-off geocoding for stop data refresh)';

const stops = [
  { id: 159, nombre: 'Avenida Mediterráneo - Estación de Servicio' },
  { id: 279, nombre: 'Cortijo Grande - Tesorería' },
  { id: 439, nombre: 'Miguel de Molina' },
  { id: 479, nombre: 'Calle Hermanos Machado' },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const geocode = async (query) => {
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=3&q=${encodeURIComponent(query)}`;
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
};

const main = async () => {
  for (const s of stops) {
    const street = s.nombre.split(' - ')[0];
    const query = `${street}, Almería, España`;
    try {
      const results = await geocode(query);
      console.log(`STOP ${s.id} "${s.nombre}" query="${query}"`);
      console.log(JSON.stringify(results.map((r) => ({ lat: r.lat, lon: r.lon, display_name: r.display_name, type: r.type, importance: r.importance }))));
    } catch (e) {
      console.log(`STOP ${s.id} GEOCODE_ERROR ${e.message}`);
    }
    await sleep(1200);
  }
  console.error('DONE');
};

main().catch((e) => {
  console.error('FETCH_ERROR', e.message);
  process.exit(1);
});
