import { useState, memo } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { MapIcon, ChevronDown } from 'lucide-react';
import type { Parada, Theme } from '../types';
import { createUserLocationIcon } from '../utils/leafletConfig';
import { formatDistance } from '../utils/formatters';

interface GeneralMapViewProps {
  paradas: Parada[];
  lineaId?: number | null;
  theme: Theme;
  activeTab: string;
  userLocation: { lat: number; lng: number } | null;
  setSelectedParada: (parada: Parada) => void;
}

const GeneralMapView = memo(({
  paradas,
  lineaId = null,
  theme,
  activeTab,
  userLocation,
  setSelectedParada
}: GeneralMapViewProps) => {
  // Mapa colapsado por defecto en todas las vistas
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Centro inicial solo la primera vez, no en cada render
  const [initialCenter] = useState(() =>
    userLocation || (paradas.length > 0 ? { lat: paradas[0].lat, lng: paradas[0].lng } : { lat: 36.84, lng: -2.46 })
  );

  // Key estable - no cambia con selección de parada
  const mapKey = `${activeTab}-${lineaId || 'general'}`;

  // Icono personalizado para ubicación del usuario
  const userLocationIcon = createUserLocationIcon();

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
        <div style={{
          height: 350,
          borderRadius: 12,
          overflow: 'hidden',
          border: `1px solid ${theme.border}`,
          marginTop: 12
        }}>
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
                  {parada.distancia !== undefined && <><br/>Distancia: {formatDistance(parada.distancia)}</>}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
});

GeneralMapView.displayName = 'GeneralMapView';

export default GeneralMapView;
