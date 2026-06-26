# Juan Bus PWA

App de transporte público de Almería con tiempos de espera en tiempo real y planificador de rutas.

## 🚀 Despliegue en Vercel (5 minutos)

### Opción 1: Desde GitHub (Recomendado)

1. **Sube el código a GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Juan Bus PWA v2.0"
   git remote add origin https://github.com/TU_USUARIO/juan-bus.git
   git push -u origin main
   ```

2. **Conecta con Vercel:**
   - Ve a [vercel.com](https://vercel.com) y haz login con GitHub
   - Click en "New Project"
   - Selecciona el repositorio `juan-bus`
   - Click en "Deploy"
   - ¡Listo! Tu app estará en `https://juan-bus.vercel.app`

### Opción 2: Desde CLI

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar (te pedirá login la primera vez)
vercel

# Para producción
vercel --prod
```

## 📁 Estructura del proyecto

```
juan-bus/
├── api/
│   └── surbus.js      # Proxy API (evita CORS)
├── public/
│   └── icons/         # Iconos PWA (añadir manualmente)
├── src/
│   ├── App.jsx        # Componente principal
│   ├── main.jsx       # Entry point
│   └── index.css      # Estilos globales
├── index.html         # HTML principal
├── package.json
├── vercel.json        # Config Vercel
└── vite.config.js     # Config Vite + PWA
```

## 🎨 Iconos PWA

Necesitas generar los iconos. Usa [realfavicongenerator.net](https://realfavicongenerator.net) o créalos manualmente:

```
public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

## 🔧 Desarrollo local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo (incluye proxy API)
npm run dev

# Esto arranca:
# - Vite en http://localhost:5173
# - Proxy API en http://localhost:3001
```

**⚠️ Importante:** En desarrollo local, el proxy (`server.dev.js`) es necesario porque Vite no ejecuta las API routes de Vercel.

### Alternativa: Solo Vite (sin API)
```bash
npm run dev:vite  # Solo frontend, las llamadas API fallarán
```

### Probar el proxy directamente
```bash
npm run dev:proxy
# Luego: curl "http://localhost:3001/api/surbus?l=1&bs=7"
```

## ✨ Características

- ✅ PWA instalable (añadir a pantalla de inicio)
- ✅ Funciona offline (Service Worker con caché)
- ✅ Proxy API integrado (sin problemas de CORS)
- ✅ Geolocalización (paradas cercanas)
- ✅ Favoritos persistentes
- ✅ Modo oscuro/claro
- ✅ Actualización automática de tiempos
- ✅ 348 paradas de autobuses de Almería
- ✅ Planificador de rutas con mapa interactivo
- ✅ Cálculo de rutas directas y con transbordos
- ✅ Visualización en mapa (Leaflet + OpenStreetMap)

## 🌐 API Endpoints

El proxy está en `/api/surbus`:

```
GET /api/surbus?l=1&bs=7     → Tiempo de espera línea 1, parada 7
GET /api/surbus?action=lines → Lista de líneas
GET /api/surbus?action=stops → Lista de paradas
```

## 📱 Instalación como App

1. Abre la web en Chrome/Safari
2. Aparecerá un banner "Instalar Juan Bus"
3. O usa el menú del navegador → "Añadir a pantalla de inicio"

---

Desarrollado para Almería 🌊
