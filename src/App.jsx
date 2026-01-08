import { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react';
import {
  MapPin, Bus, Clock, Star, Search, Moon, Sun, Navigation, AlertTriangle,
  RefreshCw, ChevronRight, X, Heart, Map as MapIcon, Bell, BellOff, Share2,
  History, Settings, Locate, ChevronDown, Filter, Zap, Info,
  ExternalLink, Wifi, WifiOff, Download, Check, CloudOff, List, Home, Briefcase
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// ═══════════════════════════════════════════════════════════════════════════
// IMPORTS DE DATOS Y UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

import PARADAS from './data/paradas.json';
import LINEAS from './data/lineas.json';
import SINONIMOS_POI from './data/sinonimos.json';

import { useTheme } from './hooks/useTheme';
import { useGeolocation } from './hooks/useGeolocation';
import { usePWA } from './hooks/usePWA';
import { useBusSearch } from './hooks/useBusSearch';

import { haversineDistance } from './utils/distance';
import { formatDistance, formatTiempo, normalizeText, safeJsonParse } from './utils/formatters';
import { fetchTiempoEspera, generateGoogleMapsUrl } from './utils/api';

// ═══════════════════════════════════════════════════════════════════════════
// UTILIDADES
// ═══════════════════════════════════════════════════════════════════════════

const getLinea = (id) => LINEAS.find(l => l.id === id);

// Fix para iconos de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTES - Vista General del Mapa
// ═══════════════════════════════════════════════════════════════════════════

const GeneralMapView = ({ paradas, lineaId = null, theme, activeTab, userLocation, setSelectedParada }) => {
  // Mapa colapsado por defecto en todas las vistas
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  // Centro inicial solo la primera vez, no en cada render
  const [initialCenter] = useState(() =>
    userLocation || (paradas.length > 0 ? { lat: paradas[0].lat, lng: paradas[0].lng } : { lat: 36.84, lng: -2.46 })
  );
  // Key estable - no cambia con selección de parada
  const mapKey = `${activeTab}-${lineaId || 'general'}`;

  // Icono personalizado para ubicación del usuario
  const userLocationIcon = L.divIcon({
    className: 'user-location-marker',
    html: `
      <div style="
        width: 20px;
        height: 20px;
        background: #2196F3;
        border: 3px solid #fff;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        position: relative;
        left: -10px;
        top: -10px;
      "></div>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });

  return (
    <div style={{ marginBottom: 16 }}>
      <button
        onClick={() => setIsMapExpanded(!isMapExpanded)}
        style={{
          width: '100%',
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          padding: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          color: theme.text,
          fontSize: 14,
          fontWeight: 600
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <MapIcon size={18} color={theme.accent} />
          Ver mapa {isMapExpanded ? '' : `(${paradas.length} paradas)`}
        </div>
        <ChevronDown
          size={18}
          style={{
            transform: isMapExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease'
          }}
        />
      </button>

      {isMapExpanded && (
        <div style={{ height: 350, borderRadius: 12, overflow: 'hidden', border: `1px solid ${theme.border}`, marginTop: 12 }}>
          <MapContainer
            key={mapKey}
            center={[initialCenter.lat, initialCenter.lng]}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            scrollWheelZoom={false}
          >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ubicación del usuario */}
        {userLocation && (
          <Marker
            position={[userLocation.lat, userLocation.lng]}
            icon={userLocationIcon}
          >
            <Popup>
              <strong>Tu ubicación</strong>
            </Popup>
          </Marker>
        )}

        {/* Marcadores de paradas */}
        {paradas.map((parada) => (
          <Marker
            key={parada.id}
            position={[parada.lat, parada.lng]}
            eventHandlers={{
              click: () => setSelectedParada(parada)
            }}
          >
            <Popup>
              <strong>{parada.nombre}</strong><br/>
              ID: {parada.id}<br/>
              Líneas: {parada.lineas.join(', ')}
              {parada.distancia && <><br/>Distancia: {formatDistance(parada.distancia)}</>}
            </Popup>
          </Marker>
        ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
};

// LocationSelector - Selector de ubicación (parada, lugar o mi ubicación)
const LocationSelector = ({ label, value, onChange, placeholder, theme, userLocation }) => {
  const [lugarTexto, setLugarTexto] = useState('');
  const [searchLocal, setSearchLocal] = useState('');
  const [showParadasDropdown, setShowParadasDropdown] = useState(false);

  const paradasFiltradas = useMemo(() => {
    if (!searchLocal) return PARADAS.slice(0, 50);
    const term = searchLocal.toLowerCase();
    return PARADAS.filter(p =>
      p.nombre.toLowerCase().includes(term) ||
      p.id.toString().includes(term)
    ).slice(0, 20);
  }, [searchLocal]);

  // Actualizar el campo de texto cuando value cambie
  useEffect(() => {
    if (value && value.tipo === 'lugar') {
      setLugarTexto(value.nombre);
    } else if (value && value.tipo !== 'ubicacion' && value.tipo !== 'parada') {
      setLugarTexto('');
    }
  }, [value]);

  return (
    <div style={{ position: 'relative' }}>
      <label style={{ display: 'block', color: theme.text, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{label}</label>

      {/* Campo de texto para buscar lugar */}
      <input
        type="text"
        placeholder={placeholder || "Escribe un lugar (ej: Universidad de Almería)"}
        value={lugarTexto}
        onChange={(e) => {
          setLugarTexto(e.target.value);
          if (e.target.value) {
            onChange({ nombre: e.target.value, tipo: 'lugar' });
          } else {
            onChange(null); // Limpiar cuando el campo esté vacío
          }
        }}
        style={{
          width: '100%',
          padding: '12px 14px',
          borderRadius: 12,
          border: `1px solid ${theme.border}`,
          background: theme.bgCard,
          color: theme.text,
          fontSize: 14,
          outline: 'none',
          marginBottom: 8
        }}
      />

      {/* Botones de acceso rápido */}
      <div style={{ display: 'flex', gap: 8 }}>
        {/* Botón Mi ubicación */}
        {userLocation && (
          <button
            onClick={() => {
              onChange({ lat: userLocation.lat, lng: userLocation.lng, nombre: 'Mi ubicación', tipo: 'ubicacion' });
              setLugarTexto('');
              setShowParadasDropdown(false);
            }}
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: value?.tipo === 'ubicacion' ? theme.accent : theme.bgCard,
              color: value?.tipo === 'ubicacion' ? '#fff' : theme.text,
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6
            }}
          >
            <Locate size={16} />
            Mi ubicación
          </button>
        )}

        {/* Botón Parada de autobús */}
        <button
          onClick={() => {
            const nextState = !showParadasDropdown;
            setShowParadasDropdown(nextState);
            if (nextState) {
              // Limpiar selección anterior al abrir el dropdown
              onChange(null);
              setLugarTexto('');
            }
          }}
          style={{
            flex: 1,
            padding: '10px 12px',
            borderRadius: 10,
            border: `1px solid ${theme.border}`,
            background: (value?.tipo === 'parada' || showParadasDropdown) ? theme.accent : theme.bgCard,
            color: (value?.tipo === 'parada' || showParadasDropdown) ? '#fff' : theme.text,
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6
          }}
        >
          <MapPin size={16} />
          Parada de autobús
        </button>
      </div>

      {/* Mostrar selección actual si es parada */}
      {value && value.tipo === 'parada' && (
        <div style={{
          marginTop: 8,
          padding: '8px 12px',
          background: theme.bgHover,
          borderRadius: 8,
          fontSize: 13,
          color: theme.text
        }}>
          <strong>Parada:</strong> {value.nombre}
        </div>
      )}

      {/* Dropdown de paradas */}
      {showParadasDropdown && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          marginTop: 4,
          background: theme.bgCard,
          border: `1px solid ${theme.border}`,
          borderRadius: 12,
          maxHeight: 300,
          overflowY: 'auto',
          zIndex: 100,
          boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
        }}>
          <div style={{ padding: 10, borderBottom: `1px solid ${theme.border}`, position: 'sticky', top: 0, background: theme.bgCard }}>
            <input
              type="text"
              placeholder="Buscar parada..."
              value={searchLocal}
              onChange={(e) => setSearchLocal(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: `1px solid ${theme.border}`,
                background: theme.bg,
                color: theme.text,
                fontSize: 13,
                outline: 'none'
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            {paradasFiltradas.map(p => (
              <div
                key={p.id}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange({ lat: p.lat, lng: p.lng, nombre: p.nombre, tipo: 'parada' });
                  setShowParadasDropdown(false);
                  setSearchLocal('');
                  setLugarTexto('');
                }}
                style={{
                  padding: '10px 14px',
                  cursor: 'pointer',
                  background: value?.nombre === p.nombre ? theme.bgHover : 'transparent',
                  borderBottom: `1px solid ${theme.border}`
                }}
              >
                <div style={{ color: theme.text, fontSize: 13, fontWeight: 600 }}>{p.nombre}</div>
                <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>ID: {p.id} • Líneas: {p.lineas.join(', ')}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// RoutePlannerView - Vista del planificador de rutas
const RoutePlannerView = ({ theme, origenCoords, setOrigenCoords, destinoCoords, setDestinoCoords, userLocation }) => {
  const generateGoogleMapsUrl = useCallback(() => {
    if (!origenCoords || !destinoCoords) return null;

    // Para origen: usar coordenadas si están disponibles (ubicación o parada), sino usar nombre
    let origin;
    if (origenCoords.lat && origenCoords.lng) {
      origin = `${origenCoords.lat},${origenCoords.lng}`;
    } else {
      origin = encodeURIComponent(`${origenCoords.nombre}, Almería`);
    }

    // Para destino: usar coordenadas si están disponibles (ubicación o parada), sino usar nombre
    let destination;
    if (destinoCoords.lat && destinoCoords.lng) {
      destination = `${destinoCoords.lat},${destinoCoords.lng}`;
    } else {
      destination = encodeURIComponent(`${destinoCoords.nombre}, Almería`);
    }

    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=transit`;
  }, [origenCoords, destinoCoords]);

  const openGoogleMaps = useCallback(() => {
    const url = generateGoogleMapsUrl();
    if (url) {
      window.open(url, '_blank');
    }
  }, [generateGoogleMapsUrl]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ background: theme.bgCard, borderRadius: 16, padding: 20, border: `1px solid ${theme.border}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <MapIcon size={24} color={theme.accent} />
          <h2 style={{ margin: 0, color: theme.text, fontSize: 18, fontWeight: 700 }}>Planificador de Rutas</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <LocationSelector
            label="Origen"
            value={origenCoords}
            onChange={setOrigenCoords}
            placeholder="Selecciona ubicación de origen"
            theme={theme}
            userLocation={userLocation}
          />

          <LocationSelector
            label="Destino"
            value={destinoCoords}
            onChange={setDestinoCoords}
            placeholder="Selecciona ubicación de destino"
            theme={theme}
            userLocation={userLocation}
          />

          {origenCoords && destinoCoords && (
            <button
              onClick={() => {
                const temp = origenCoords;
                setOrigenCoords(destinoCoords);
                setDestinoCoords(temp);
              }}
              style={{
                background: theme.bgHover, color: theme.text, border: `1px solid ${theme.border}`, borderRadius: 10, padding: '10px 14px',
                fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center'
              }}
            >
              <RefreshCw size={16} />
              Intercambiar origen y destino
            </button>
          )}
        </div>
      </div>

      {origenCoords && destinoCoords ? (
        <div style={{ background: theme.bgCard, borderRadius: 16, padding: 24, border: `1px solid ${theme.border}`, textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <MapIcon size={48} color={theme.accent} style={{ opacity: 0.8 }} />
          </div>
          <h3 style={{ margin: '0 0 8px', color: theme.text, fontSize: 16, fontWeight: 700 }}>
            Ruta lista para calcular
          </h3>
          <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>
            De <span style={{ color: theme.accent, fontWeight: 600 }}>{origenCoords.nombre}</span> a <span style={{ color: theme.accent, fontWeight: 600 }}>{destinoCoords.nombre}</span>
          </p>
          <button
            onClick={openGoogleMaps}
            style={{
              background: theme.accent,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 24px',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              boxShadow: `0 4px 12px ${theme.accent}40`
            }}
          >
            <ExternalLink size={20} />
            Ver Ruta en Google Maps
          </button>
          <p style={{ color: theme.textMuted, fontSize: 11, marginTop: 12 }}>
            Se abrirá Google Maps con la ruta en transporte público
          </p>
        </div>
      ) : (
        <div style={{ background: theme.bgCard, borderRadius: 16, padding: 40, textAlign: 'center', border: `1px solid ${theme.border}` }}>
          <MapIcon size={48} color={theme.accent} style={{ opacity: 0.5 }} />
          <p style={{ color: theme.text, marginTop: 16, fontSize: 15 }}>Selecciona origen y destino</p>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 8 }}>
            Elige ubicaciones de origen y destino para calcular la mejor ruta en transporte público con Google Maps.
          </p>
        </div>
      )}
    </div>
  );
};
// ═══════════════════════════════════════════════════════════════════════════
// WIDGET CASA / TRABAJO (CommuteWidget)
// ═══════════════════════════════════════════════════════════════════════════

const CommuteWidget = ({ theme, casaParadaId, trabajoParadaId, casaDireccion, trabajoDireccion, userLocation, setCommuteFilterLineas, setSelectedParada }) => {
  const getParada = (id) => PARADAS.find(p => p.id === id);

  // Maneja click en "Ir al Trabajo" - lógica inteligente
  const handleIrAlTrabajo = () => {
    const paradaCasa = casaParadaId ? getParada(casaParadaId) : null;

    console.log('🏢 Ir al Trabajo:', {
      casaParadaId,
      paradaCasa: paradaCasa?.nombre,
      userLocation,
      trabajoDireccion
    });

    // Si hay parada de casa y ubicación del usuario
    if (paradaCasa && userLocation) {
      // Calcular distancia a la parada de casa
      const distancia = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        paradaCasa.lat,
        paradaCasa.lng
      );

      console.log('📏 Distancia a casa:', distancia.toFixed(2), 'km');

      // Si está cerca de casa (< 400m), mostrar parada de casa
      if (distancia < 0.4) {
        console.log('✅ Cerca de casa, mostrando parada');
        setSelectedParada(paradaCasa);
        setCommuteFilterLineas(null);
        return;
      }
    }

    // Si está lejos y hay dirección de trabajo, abrir Google Maps
    if (trabajoDireccion) {
      console.log('🗺️ Lejos de casa, abriendo Google Maps');
      const origin = userLocation
        ? `${userLocation.lat},${userLocation.lng}`
        : '';
      const destination = encodeURIComponent(`${trabajoDireccion}, Almería`);
      const url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${destination}&travelmode=transit`;
      window.open(url, '_blank');
      return;
    }

    // Fallback: si no hay dirección pero sí parada, mostrar la parada de todos modos
    if (paradaCasa) {
      console.log('🔄 Fallback, mostrando parada');
      setSelectedParada(paradaCasa);
      setCommuteFilterLineas(null);
    }
  };

  // Maneja click en "Ir a Casa" - lógica inteligente
  const handleIrACasa = () => {
    const paradaTrabajo = trabajoParadaId ? getParada(trabajoParadaId) : null;

    console.log('🏠 Ir a Casa:', {
      trabajoParadaId,
      paradaTrabajo: paradaTrabajo?.nombre,
      userLocation,
      casaDireccion
    });

    // Si hay parada de trabajo y ubicación del usuario
    if (paradaTrabajo && userLocation) {
      // Calcular distancia a la parada de trabajo
      const distancia = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        paradaTrabajo.lat,
        paradaTrabajo.lng
      );

      console.log('📏 Distancia al trabajo:', distancia.toFixed(2), 'km');

      // Si está cerca del trabajo (< 400m), mostrar parada de trabajo
      if (distancia < 0.4) {
        console.log('✅ Cerca del trabajo, mostrando parada');
        setSelectedParada(paradaTrabajo);
        setCommuteFilterLineas(null);
        return;
      }
    }

    // Si está lejos y hay dirección de casa, abrir Google Maps
    if (casaDireccion) {
      console.log('🗺️ Lejos del trabajo, abriendo Google Maps');
      const origin = userLocation
        ? `${userLocation.lat},${userLocation.lng}`
        : '';
      const destination = encodeURIComponent(`${casaDireccion}, Almería`);
      const url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${destination}&travelmode=transit`;
      window.open(url, '_blank');
      return;
    }

    // Fallback: si no hay dirección pero sí parada, mostrar la parada de todos modos
    if (paradaTrabajo) {
      console.log('🔄 Fallback, mostrando parada');
      setSelectedParada(paradaTrabajo);
      setCommuteFilterLineas(null);
    }
  };

  // Si no hay nada configurado, no mostramos nada
  if (!casaParadaId && !trabajoParadaId && !casaDireccion && !trabajoDireccion) return null;

  const ButtonCard = ({ icon: Icon, label, subtitle, onClick, isConfigured, color }) => (
    <div
      onClick={onClick}
      style={{
        flex: 1,
        background: theme.bgCard,
        border: `1px solid ${theme.border}`,
        borderRadius: 16,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        cursor: isConfigured ? 'pointer' : 'default',
        opacity: isConfigured ? 1 : 0.6,
        boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
      }}
    >
      <div style={{ background: `${color}15`, padding: 10, borderRadius: '50%' }}>
        <Icon size={24} color={color} />
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ color: theme.text, fontWeight: 700, fontSize: 14 }}>{label}</div>
        <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>
          {subtitle}
        </div>
      </div>
    </div>
  );

  // Determinar subtítulo para "Ir a Casa"
  const getSubtituloIrACasa = () => {
    if (!trabajoParadaId && !casaDireccion) return 'No configurado';

    const paradaTrabajo = trabajoParadaId ? getParada(trabajoParadaId) : null;

    // Mostrar info de ubicación si no está disponible
    if (!userLocation) {
      if (casaDireccion) return 'Ruta a casa (GPS desactivado)';
      if (trabajoParadaId) return `Parada ${trabajoParadaId} (GPS desactivado)`;
      return 'No configurado';
    }

    if (paradaTrabajo && userLocation) {
      const distancia = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        paradaTrabajo.lat,
        paradaTrabajo.lng
      );
      const distanciaMetros = Math.round(distancia * 1000);

      if (distancia < 0.4) {
        return `Parada ${trabajoParadaId} (${distanciaMetros}m)`;
      }
      // Mostrar distancia si está lejos
      if (casaDireccion) {
        return `Ruta a casa (${distanciaMetros}m del trabajo)`;
      }
      return `Parada ${trabajoParadaId} (${distanciaMetros}m)`;
    }

    // Si hay dirección, mostrar "Ruta a casa", sino mostrar la parada como fallback
    if (casaDireccion) {
      return 'Ruta a casa';
    } else if (trabajoParadaId) {
      return `Parada ${trabajoParadaId}`;
    }
    return 'No configurado';
  };

  // Determinar subtítulo para "Ir al Trabajo"
  const getSubtituloIrAlTrabajo = () => {
    if (!casaParadaId && !trabajoDireccion) return 'No configurado';

    const paradaCasa = casaParadaId ? getParada(casaParadaId) : null;

    // Mostrar info de ubicación si no está disponible
    if (!userLocation) {
      if (trabajoDireccion) return 'Ruta al trabajo (GPS desactivado)';
      if (casaParadaId) return `Parada ${casaParadaId} (GPS desactivado)`;
      return 'No configurado';
    }

    if (paradaCasa && userLocation) {
      const distancia = haversineDistance(
        userLocation.lat,
        userLocation.lng,
        paradaCasa.lat,
        paradaCasa.lng
      );
      const distanciaMetros = Math.round(distancia * 1000);

      if (distancia < 0.4) {
        return `Parada ${casaParadaId} (${distanciaMetros}m)`;
      }
      // Mostrar distancia si está lejos
      if (trabajoDireccion) {
        return `Ruta al trabajo (${distanciaMetros}m de casa)`;
      }
      return `Parada ${casaParadaId} (${distanciaMetros}m)`;
    }

    // Si hay dirección, mostrar "Ruta al trabajo", sino mostrar la parada como fallback
    if (trabajoDireccion) {
      return 'Ruta al trabajo';
    } else if (casaParadaId) {
      return `Parada ${casaParadaId}`;
    }
    return 'No configurado';
  };

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
      <ButtonCard
        icon={Home}
        label="Ir a Casa"
        subtitle={getSubtituloIrACasa()}
        onClick={handleIrACasa}
        isConfigured={!!(trabajoParadaId || casaDireccion)}
        color={theme.accent}
      />
      <ButtonCard
        icon={Briefcase}
        label="Ir al Trabajo"
        subtitle={getSubtituloIrAlTrabajo()}
        onClick={handleIrAlTrabajo}
        isConfigured={!!(casaParadaId || trabajoDireccion)}
        color="#10b981"
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// FIN WIDGET
// ═══════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════════════════

export default function App() {
  const { isOnline, isInstalled, canInstall, install } = usePWA();

  // Debug: Ver qué hay en localStorage al cargar
  console.log('🔍 localStorage al cargar:', {
    casa: localStorage.getItem('surbus_casa'),
    trabajo: localStorage.getItem('surbus_trabajo'),
    casaDireccion: localStorage.getItem('surbus_casa_direccion'),
    trabajoDireccion: localStorage.getItem('surbus_trabajo_direccion'),
    favoritos: localStorage.getItem('surbus_fav')
  });

  const [activeTab, setActiveTab] = useState('cercanas');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm); // Debouncing de búsqueda
  const [selectedParada, setSelectedParada] = useState(null);
  const [selectedLinea, setSelectedLinea] = useState(null);
  const [commuteFilterLineas, setCommuteFilterLineas] = useState(null); // Filtro de líneas desde widget casa/curro
  const [favoritos, setFavoritos] = useState(() =>
    safeJsonParse(localStorage.getItem('surbus_fav'), [])
  );
  const [tiempos, setTiempos] = useState({});
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  
  
  
  
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Estados del planificador de rutas
  const [origenCoords, setOrigenCoords] = useState(null); // { lat, lng, nombre }
  const [destinoCoords, setDestinoCoords] = useState(null); // { lat, lng, nombre }
  
  

  // Estado de vista (lista o mapa)
  const [viewMode, setViewMode] = useState('list'); // 'list' | 'map'

  // Paradas especiales: Casa y Trabajo
  const [casaParadaId, setCasaParadaId] = useState(() =>
    safeJsonParse(localStorage.getItem('surbus_casa'), null)
  );
  const [trabajoParadaId, setTrabajoParadaId] = useState(() =>
    safeJsonParse(localStorage.getItem('surbus_trabajo'), null)
  );
  const [casaDireccion, setCasaDireccion] = useState(() =>
    localStorage.getItem('surbus_casa_direccion') || ''
  );
  const [trabajoDireccion, setTrabajoDireccion] = useState(() =>
    localStorage.getItem('surbus_trabajo_direccion') || ''
  );

  // Estado de expansión del panel de configuración Casa/Trabajo
  // Expandido por defecto si los campos están vacíos
  const [isConfigExpanded, setIsConfigExpanded] = useState(() => {
    const casaDir = localStorage.getItem('surbus_casa_direccion') || '';
    const trabajoDir = localStorage.getItem('surbus_trabajo_direccion') || '';
    return !casaDir && !trabajoDir; // Expandido si ambos están vacíos
  });

  // Tema
    const { theme: t, darkMode, toggleTheme } = useTheme();
  const { userLocation, locationError, loadingLocation, getUserLocation } = useGeolocation();



  // Paradas ordenadas
  const paradasCercanas = useMemo(() => {
    if (!userLocation) return PARADAS;
    return [...PARADAS].map(p => ({
      ...p, distancia: haversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
    })).sort((a, b) => a.distancia - b.distancia);
  }, [userLocation]);

  // Búsqueda con hook personalizado
  const { paradasFiltradas } = useBusSearch(searchTerm, activeTab === 'cercanas' ? paradasCercanas : PARADAS, userLocation, selectedLinea, activeTab);

  

  // Cargar tiempos con límite de caché
  const loadTiempos = useCallback(async (parada) => {
    if (!parada) return;
    setLoading(true);
    const nuevo = {};
    await Promise.all(parada.lineas.map(async (l) => {
      nuevo[`${parada.id}-${l}`] = await fetchTiempoEspera(parada.id, l);
    }));

    // Limitar caché a últimas 100 entradas para evitar memory leak
    setTiempos(prev => {
      const combined = { ...prev, ...nuevo };
      const keys = Object.keys(combined);
      if (keys.length > 100) {
        const recentKeys = keys.slice(-100);
        return Object.fromEntries(recentKeys.map(k => [k, combined[k]]));
      }
      return combined;
    });

    setLastUpdate(new Date());
    setLoading(false);
  }, []);

  // Auto-refresh con prevención de race conditions
  useEffect(() => {
    if (!selectedParada || !isOnline) return;

    let isCancelled = false;

    const loadData = async () => {
      if (!isCancelled) {
        await loadTiempos(selectedParada);
      }
    };

    loadData(); // Carga inicial

    let intervalId;
    if (autoRefresh) {
      intervalId = setInterval(loadData, 30000);
    }

    return () => {
      isCancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedParada, autoRefresh, isOnline, loadTiempos]);

  // Guardar parada de casa en localStorage
  useEffect(() => {
    if (casaParadaId) {
      console.log('💾 Guardando parada de casa:', casaParadaId);
      localStorage.setItem('surbus_casa', JSON.stringify(casaParadaId));
    } else {
      console.log('🗑️ Eliminando parada de casa');
      localStorage.removeItem('surbus_casa');
    }
  }, [casaParadaId]);

  // Guardar parada de trabajo en localStorage
  useEffect(() => {
    if (trabajoParadaId) {
      console.log('💾 Guardando parada de trabajo:', trabajoParadaId);
      localStorage.setItem('surbus_trabajo', JSON.stringify(trabajoParadaId));
    } else {
      console.log('🗑️ Eliminando parada de trabajo');
      localStorage.removeItem('surbus_trabajo');
    }
  }, [trabajoParadaId]);

  // Guardar dirección de casa en localStorage
  useEffect(() => {
    if (casaDireccion) {
      localStorage.setItem('surbus_casa_direccion', casaDireccion);
    } else {
      localStorage.removeItem('surbus_casa_direccion');
    }
  }, [casaDireccion]);

  // Guardar dirección de trabajo en localStorage
  useEffect(() => {
    if (trabajoDireccion) {
      localStorage.setItem('surbus_trabajo_direccion', trabajoDireccion);
    } else {
      localStorage.removeItem('surbus_trabajo_direccion');
    }
  }, [trabajoDireccion]);

  // Guardar favoritos en localStorage
  useEffect(() => {
    console.log('💾 Guardando favoritos:', favoritos);
    localStorage.setItem('surbus_fav', JSON.stringify(favoritos));
  }, [favoritos]);



  const toggleFavorito = (id) => {
    setFavoritos(prev => {
      const isRemoving = prev.includes(id);
      // Si se está quitando de favoritos, también limpiar casa/trabajo
      if (isRemoving) {
        if (casaParadaId === id) setCasaParadaId(null);
        if (trabajoParadaId === id) setTrabajoParadaId(null);
      }
      return isRemoving ? prev.filter(x => x !== id) : [...prev, id];
    });
  };

  const formatTiempo = (tiempo) => {
    if (!tiempo?.success) return { text: 'Sin datos', color: t.textMuted };
    if (!tiempo.waitTimeString) return { text: tiempo.waitTimeType === 3 ? 'Sin servicio' : '...', color: t.textMuted };
    const mins = parseInt(tiempo.waitTimeString);
    if (isNaN(mins)) return { text: tiempo.waitTimeString, color: t.accent };
    if (mins <= 3) return { text: `${mins} min`, color: t.success };
    if (mins <= 10) return { text: `${mins} min`, color: t.warning };
    return { text: `${mins} min`, color: t.danger };
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPONENTES
  // ═══════════════════════════════════════════════════════════════════════════

  const ParadaCard = ({ parada, showHomeWorkButtons = false }) => (
    <div onClick={() => setSelectedParada(parada)} style={{
      background: t.bgCard, borderRadius: 16, padding: '16px 20px', cursor: 'pointer',
      border: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 14
    }}>
      <div style={{ width: 48, height: 48, borderRadius: 12, background: t.gradient,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>{parada.id}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: t.text, fontWeight: 600, fontSize: 15, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {parada.nombre}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {parada.lineas.slice(0, 5).map(l => {
            const linea = getLinea(l);
            return linea && <span key={l} style={{ background: linea.color, color: '#fff', padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700 }}>L{l}</span>;
          })}
          {parada.lineas.length > 5 && <span style={{ color: t.textMuted, fontSize: 11 }}>+{parada.lineas.length - 5}</span>}
        </div>
        {parada.distancia !== undefined && (
          <div style={{ color: t.accent, fontSize: 12, marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
            <Navigation size={12} />{formatDistance(parada.distancia)}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {showHomeWorkButtons && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newValue = casaParadaId === parada.id ? null : parada.id;
                console.log('🏠 Marcando parada casa:', { parada: parada.id, nombre: parada.nombre, newValue });
                setCasaParadaId(newValue);
              }}
              style={{
                background: casaParadaId === parada.id ? t.accent : 'transparent',
                border: `1px solid ${casaParadaId === parada.id ? t.accent : t.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Parada cerca de casa (para ir al trabajo)"
            >
              <Home size={18} color={casaParadaId === parada.id ? '#fff' : t.textMuted} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                const newValue = trabajoParadaId === parada.id ? null : parada.id;
                console.log('🏢 Marcando parada trabajo:', { parada: parada.id, nombre: parada.nombre, newValue });
                setTrabajoParadaId(newValue);
              }}
              style={{
                background: trabajoParadaId === parada.id ? t.accent : 'transparent',
                border: `1px solid ${trabajoParadaId === parada.id ? t.accent : t.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Parada cerca del trabajo (para volver a casa)"
            >
              <Briefcase size={18} color={trabajoParadaId === parada.id ? '#fff' : t.textMuted} />
            </button>
          </>
        )}
        <button onClick={(e) => { e.stopPropagation(); toggleFavorito(parada.id); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 8 }}>
          <Heart size={22} fill={favoritos.includes(parada.id) ? '#ef4444' : 'transparent'}
            color={favoritos.includes(parada.id) ? '#ef4444' : t.textMuted} />
        </button>
      </div>
    </div>
  );

  const ParadaDetail = () => {
    if (!selectedParada) return null;

    // Cerrar modal y limpiar filtro
    const handleClose = () => {
      setSelectedParada(null);
      setCommuteFilterLineas(null);
    };

    // Determinar qué líneas mostrar
    const lineasAMostrar = commuteFilterLineas || selectedParada.lineas;

    return (
      <div onClick={handleClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
        zIndex: 1001, display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
      }}>
        <div onClick={e => e.stopPropagation()} style={{
          background: t.bg, borderRadius: '24px 24px 0 0', width: '100%', maxWidth: 500, maxHeight: '90vh', overflow: 'auto'
        }}>
          <div style={{ position: 'sticky', top: 0, background: t.bg, padding: '20px 24px', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: 16, zIndex: 10 }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: t.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>{selectedParada.id}</span>
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: t.text, margin: 0, fontSize: 17, fontWeight: 700 }}>{selectedParada.nombre}</h2>
              <p style={{ color: t.textMuted, margin: '4px 0 0', fontSize: 13 }}>
                {commuteFilterLineas ? `${lineasAMostrar.length} ${lineasAMostrar.length === 1 ? 'línea útil' : 'líneas útiles'}` : `${selectedParada.lineas.length} líneas`}
                {selectedParada.distancia !== undefined && ` • ${formatDistance(selectedParada.distancia)}`}
              </p>
            </div>
            <button onClick={handleClose} style={{ background: t.bgCard, border: 'none', borderRadius: 12, padding: 10, cursor: 'pointer' }}>
              <X size={20} color={t.text} />
            </button>
          </div>

          {!isOnline && (
            <div style={{ margin: '16px 24px 0', padding: '12px 16px', background: `${t.warning}20`, borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CloudOff size={18} color={t.warning} />
              <span style={{ color: t.text, fontSize: 13 }}>Sin conexión</span>
            </div>
          )}

          <div style={{ padding: '16px 24px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => loadTiempos(selectedParada)} disabled={loading || !isOnline} style={{
              flex: '1 1 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              background: isOnline ? t.accent : t.textMuted, color: '#fff', border: 'none', borderRadius: 12,
              padding: '12px 16px', fontWeight: 600, fontSize: 14, cursor: loading || !isOnline ? 'not-allowed' : 'pointer'
            }}>
              <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
              {loading ? 'Actualizando...' : 'Actualizar'}
            </button>
            <button onClick={() => toggleFavorito(selectedParada.id)} style={{
              background: favoritos.includes(selectedParada.id) ? t.danger : t.bgCard, color: favoritos.includes(selectedParada.id) ? '#fff' : t.text,
              border: `1px solid ${t.border}`, borderRadius: 12, padding: 12, cursor: 'pointer'
            }}>
              <Heart size={18} fill={favoritos.includes(selectedParada.id) ? '#fff' : 'transparent'} />
            </button>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${selectedParada.lat},${selectedParada.lng}&travelmode=walking`} 
              target="_blank" rel="noopener noreferrer" style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.bgCard,
              border: `1px solid ${t.border}`, borderRadius: 12, padding: 12
            }}>
              <Navigation size={18} color={t.text} />
            </a>
          </div>

          <div style={{ padding: '0 24px 24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ color: t.text, margin: 0, fontSize: 16, fontWeight: 600 }}>Próximos buses</h3>
              {lastUpdate && <span style={{ color: t.textMuted, fontSize: 12 }}>{lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {lineasAMostrar
                .filter(lineaId => !selectedLinea || lineaId === selectedLinea)
                .map(lineaId => {
                const linea = getLinea(lineaId);
                const tiempo = tiempos[`${selectedParada.id}-${lineaId}`];
                const fmt = formatTiempo(tiempo);
                return linea && (
                  <div key={lineaId} style={{ background: t.bgCard, borderRadius: 14, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, border: `1px solid ${t.border}` }}>
                    <div style={{ width: 44, height: 44, borderRadius: 11, background: linea.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>L{lineaId}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ color: t.text, fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{linea.nombre}</div>
                      <div style={{ color: t.textMuted, fontSize: 12, marginTop: 2 }}>{linea.descripcion}</div>
                    </div>
                    <div style={{ background: `${fmt.color}20`, borderRadius: 10, padding: '8px 14px', minWidth: 70, textAlign: 'center' }}>
                      <span style={{ color: fmt.color, fontWeight: 700, fontSize: 14 }}>{fmt.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const LineasView = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {LINEAS.map(linea => {
        const paradasLinea = PARADAS.filter(p => p.lineas.includes(linea.id));
        const isExp = selectedLinea === linea.id;
        return (
          <div key={linea.id} style={{ background: t.bgCard, borderRadius: 16, overflow: 'hidden', border: `1px solid ${isExp ? linea.color : t.border}` }}>
            <div onClick={() => setSelectedLinea(isExp ? null : linea.id)} style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: linea.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>L{linea.id}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: t.text, fontWeight: 600, fontSize: 15 }}>{linea.nombre}</div>
                <div style={{ color: t.textMuted, fontSize: 13, marginTop: 2 }}>{paradasLinea.length} paradas</div>
              </div>
              <ChevronDown size={20} color={t.textMuted} style={{ transform: isExp ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
            </div>
            {isExp && (
              <div style={{ padding: '0 20px 16px', borderTop: `1px solid ${t.border}`, paddingTop: 16, maxHeight: 300, overflowY: 'auto' }}>
                {paradasLinea.map((p, i) => (
                  <div key={p.id} onClick={() => setSelectedParada(p)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: t.bgHover, borderRadius: 10, cursor: 'pointer', marginBottom: 8 }}>
                    <div style={{ width: 24, height: 24, borderRadius: '50%', background: linea.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#fff' }}>{i + 1}</div>
                    <span style={{ color: t.text, fontSize: 13, flex: 1 }}>{p.nombre}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Mapa genérico para Cercanas, Favoritos y Líneas
  // Componente Selector de Parada

  // Vista del Planificador de Rutas

  // ═══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ minHeight: '100vh', background: t.bg, paddingBottom: 100 }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <header style={{ position: 'sticky', top: 0, zIndex: 50, background: `${t.bg}f0`, backdropFilter: 'blur(20px)', borderBottom: `1px solid ${t.border}` }}>
        <div style={{ maxWidth: 600, margin: '0 auto', padding: '14px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 46, height: 46, borderRadius: 13, background: t.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Bus size={26} color="#fff" />
              </div>
              <div>
                <h1 style={{ color: t.text, margin: 0, fontSize: 22, fontWeight: 800 }}>Juan <span style={{ color: t.accent }}>Bus</span></h1>
                <p style={{ color: t.textMuted, margin: 0, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                  Almería {isInstalled && <Check size={12} color={t.success} />}
                  {!isOnline && <WifiOff size={12} color={t.warning} />}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {canInstall && (
                <button onClick={install} style={{ background: t.accent, border: 'none', borderRadius: 11, padding: 10, cursor: 'pointer' }}>
                  <Download size={20} color="#fff" />
                </button>
              )}
              <button
                onClick={toggleTheme}
                aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                style={{ background: t.bgCard, border: `1px solid ${t.border}`, borderRadius: 11, padding: 10, cursor: 'pointer' }}>
                {darkMode ? <Sun size={20} color={t.text} /> : <Moon size={20} color={t.text} />}
              </button>
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <Search size={18} color={t.textMuted} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              placeholder="Buscar parada, número o línea..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Buscar paradas de autobús"
              role="searchbox"
              style={{ width: '100%', padding: '14px 44px', borderRadius: 14, border: `1px solid ${t.border}`, background: t.bgCard, color: t.text, fontSize: 15, outline: 'none' }} />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                aria-label="Limpiar búsqueda"
                style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={18} color={t.textMuted} />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '16px 20px' }}>
        {/* Widget Casa-Trabajo */}
        <CommuteWidget
          theme={t}
          casaParadaId={casaParadaId}
          trabajoParadaId={trabajoParadaId}
          casaDireccion={casaDireccion}
          trabajoDireccion={trabajoDireccion}
          userLocation={userLocation}
          setCommuteFilterLineas={setCommuteFilterLineas}
          setSelectedParada={setSelectedParada}
        />

        {/* Tabs y controles - sticky */}
        <div style={{ position: 'sticky', top: 80, zIndex: 40, background: `${t.bg}f0`, backdropFilter: 'blur(20px)', marginLeft: -20, marginRight: -20, paddingLeft: 20, paddingRight: 20, paddingTop: 8, paddingBottom: 8, marginBottom: 8 }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 12, overflowX: 'auto', paddingBottom: 4 }}>
            {[
              { id: 'cercanas', icon: Locate, label: 'Cercanas' },
              { id: 'favoritos', icon: Star, label: 'Favoritos' },
              { id: 'lineas', icon: Bus, label: 'Líneas' },
              { id: 'rutas', icon: MapIcon, label: 'Rutas' },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderRadius: 11, border: 'none',
                background: activeTab === tab.id ? t.accent : t.bgCard, color: activeTab === tab.id ? '#fff' : t.textMuted,
                fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap'
              }}>
                <tab.icon size={16} />
                {tab.label}
                {tab.id === 'favoritos' && favoritos.length > 0 && (
                  <span style={{ background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : t.danger, color: '#fff', padding: '2px 6px', borderRadius: 6, fontSize: 11 }}>{favoritos.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* Toggle Vista Lista/Mapa */}
          {activeTab !== 'rutas' && (
            <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10,
                  border: `1px solid ${t.border}`, background: viewMode === 'list' ? t.accent : t.bgCard,
                  color: viewMode === 'list' ? '#fff' : t.textMuted, fontWeight: 600, fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                <List size={16} />
                Lista
              </button>
              <button
                onClick={() => setViewMode('map')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6, padding: '8px 12px', borderRadius: 10,
                  border: `1px solid ${t.border}`, background: viewMode === 'map' ? t.accent : t.bgCard,
                  color: viewMode === 'map' ? '#fff' : t.textMuted, fontWeight: 600, fontSize: 12,
                  cursor: 'pointer'
                }}
              >
                <MapIcon size={16} />
                Mapa
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {activeTab === 'cercanas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {locationError ? (
              <div style={{ background: `${t.warning}20`, borderRadius: 12, padding: 14, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={20} color={t.warning} />
                <span style={{ color: t.text, fontSize: 13, flex: 1 }}>{locationError}</span>
                <button onClick={getUserLocation} style={{ background: t.warning, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 12px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Reintentar</button>
              </div>
            ) : loadingLocation ? (
              <div style={{ textAlign: 'center', padding: 40, color: t.textMuted }}>
                <Locate size={32} style={{ animation: 'spin 2s linear infinite' }} />
                <p style={{ marginTop: 12 }}>Obteniendo ubicación...</p>
              </div>
            ) : viewMode === 'list' ? (
              <>
                <p style={{ color: t.textMuted, fontSize: 13, margin: '0 0 4px' }}>{paradasFiltradas.length} paradas</p>
                {paradasFiltradas.slice(0, 50).map(p => <ParadaCard key={p.id} parada={p} />)}
              </>
            ) : (
              <GeneralMapView
                paradas={paradasFiltradas.slice(0, 100)}
                theme={t}
                activeTab={activeTab}
                userLocation={userLocation}
                setSelectedParada={setSelectedParada}
              />
            )}
          </div>
        )}

        {activeTab === 'favoritos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Configuración de dirección de casa */}
            <div style={{ background: t.bgCard, borderRadius: 16, padding: 20, border: `1px solid ${t.border}` }}>
              <div
                onClick={() => setIsConfigExpanded(!isConfigExpanded)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: isConfigExpanded ? 12 : 0,
                  cursor: 'pointer'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Settings size={20} color={t.accent} />
                  <h3 style={{ margin: 0, color: t.text, fontSize: 16, fontWeight: 700 }}>Configuración Casa/Trabajo</h3>
                </div>
                <ChevronDown
                  size={20}
                  color={t.text}
                  style={{
                    transform: isConfigExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: 'transform 0.3s ease'
                  }}
                />
              </div>

              {isConfigExpanded && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: t.text, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      Dirección de tu casa
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Calle Mayor 10, Almería"
                      value={casaDireccion}
                      onChange={(e) => setCasaDireccion(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: `1px solid ${t.border}`,
                        background: t.bg,
                        color: t.text,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                    <p style={{ color: t.textMuted, fontSize: 11, marginTop: 6, marginBottom: 0 }}>
                      Se usará cuando estés lejos del trabajo (más de 400m) y quieras volver a casa
                    </p>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'block', color: t.text, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
                      Dirección de tu trabajo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej: Universidad de Almería"
                      value={trabajoDireccion}
                      onChange={(e) => setTrabajoDireccion(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '12px 14px',
                        borderRadius: 12,
                        border: `1px solid ${t.border}`,
                        background: t.bg,
                        color: t.text,
                        fontSize: 14,
                        outline: 'none'
                      }}
                    />
                    <p style={{ color: t.textMuted, fontSize: 11, marginTop: 6, marginBottom: 0 }}>
                      Se usará cuando estés lejos de casa (más de 400m) y quieras ir al trabajo
                    </p>
                  </div>

                  <div style={{ background: `${t.accent}10`, borderRadius: 12, padding: 12 }}>
                    <p style={{ color: t.text, fontSize: 12, margin: 0, lineHeight: 1.5 }}>
                      <strong>💡 Cómo funciona:</strong><br/>
                      • <strong>Parada Casa</strong> ({casaParadaId || 'no configurada'}): Se muestra si estás a menos de 400m de casa<br/>
                      • <strong>Parada Trabajo</strong> ({trabajoParadaId || 'no configurada'}): Se muestra si estás a menos de 400m del trabajo<br/>
                      • <strong>Direcciones</strong>: Si estás lejos (más de 400m), se abre Google Maps con la ruta. Si no hay dirección, se muestra la parada igualmente
                    </p>
                  </div>
                </>
              )}
            </div>

            {favoritos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: t.textMuted }}>
                <Heart size={48} strokeWidth={1} style={{ opacity: 0.5 }} />
                <p style={{ marginTop: 16 }}>No tienes favoritos</p>
              </div>
            ) : viewMode === 'list' ? (
              PARADAS.filter(p => favoritos.includes(p.id)).map(p => <ParadaCard key={p.id} parada={p} showHomeWorkButtons={true} />)
            ) : (
              <GeneralMapView
                paradas={PARADAS.filter(p => favoritos.includes(p.id))}
                theme={t}
                activeTab={activeTab}
                userLocation={userLocation}
                setSelectedParada={setSelectedParada}
              />
            )}
          </div>
        )}

        {activeTab === 'lineas' && (viewMode === 'list' ? <LineasView /> : (
          selectedLinea ? (
            <GeneralMapView
              paradas={PARADAS.filter(p => p.lineas.includes(selectedLinea))}
              lineaId={selectedLinea}
              theme={t}
              activeTab={activeTab}
              userLocation={userLocation}
              setSelectedParada={setSelectedParada}
            />
          ) : (
            <div style={{ background: t.bgCard, borderRadius: 16, padding: 40, textAlign: 'center', border: `1px solid ${t.border}` }}>
              <MapIcon size={48} color={t.accent} style={{ opacity: 0.5 }} />
              <p style={{ color: t.text, marginTop: 16, fontSize: 15 }}>Selecciona una línea</p>
              <p style={{ color: t.textMuted, fontSize: 13, marginTop: 8 }}>
                Cambia a vista de lista para seleccionar una línea y ver su recorrido en el mapa.
              </p>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  marginTop: 16, background: t.accent, color: '#fff', border: 'none', borderRadius: 10,
                  padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer'
                }}
              >
                Ir a vista de lista
              </button>
            </div>
          )
        ))}

        {activeTab === 'rutas' && (
          <RoutePlannerView
            theme={t}
            origenCoords={origenCoords}
            setOrigenCoords={setOrigenCoords}
            destinoCoords={destinoCoords}
            setDestinoCoords={setDestinoCoords}
            userLocation={userLocation}
          />
        )}
      </main>

      {selectedParada && <ParadaDetail />}

      {/* Footer */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: `${t.bg}f0`, backdropFilter: 'blur(20px)', borderTop: `1px solid ${t.border}`, padding: '10px 20px', paddingBottom: 'max(10px, env(safe-area-inset-bottom))' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isOnline ? <Wifi size={14} color={t.success} /> : <WifiOff size={14} color={t.danger} />}
            <span style={{ color: t.textMuted, fontSize: 11 }}>{isOnline ? 'Online' : 'Offline'}</span>
          </div>
          <span style={{ color: t.textMuted, fontSize: 11 }}>Juan Bus v2.0 {isInstalled && '✓'}</span>
        </div>
      </div>
    </div>
  );
}

