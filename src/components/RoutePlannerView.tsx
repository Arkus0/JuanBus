import { useCallback, memo } from 'react';
import { MapIcon, RefreshCw, ExternalLink } from 'lucide-react';
import type { Theme, Ubicacion } from '../types';
import LocationSelector from './LocationSelector';

interface RoutePlannerViewProps {
  theme: Theme;
  origenCoords: Ubicacion | null;
  setOrigenCoords: (coords: Ubicacion | null) => void;
  destinoCoords: Ubicacion | null;
  setDestinoCoords: (coords: Ubicacion | null) => void;
  userLocation: { lat: number; lng: number } | null;
}

const RoutePlannerView = memo(({
  theme,
  origenCoords,
  setOrigenCoords,
  destinoCoords,
  setDestinoCoords,
  userLocation
}: RoutePlannerViewProps) => {
  const generateGoogleMapsUrl = useCallback(() => {
    if (!origenCoords || !destinoCoords) return null;

    // Para origen: usar coordenadas si están disponibles (ubicación o parada), sino usar nombre
    let origin: string;
    if (origenCoords.lat && origenCoords.lng) {
      origin = `${origenCoords.lat},${origenCoords.lng}`;
    } else {
      origin = encodeURIComponent(`${origenCoords.nombre}, Almería`);
    }

    // Para destino: usar coordenadas si están disponibles (ubicación o parada), sino usar nombre
    let destination: string;
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
      <div style={{
        background: theme.bgCard,
        borderRadius: 16,
        padding: 20,
        border: `1px solid ${theme.border}`
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <MapIcon size={24} color={theme.accent} />
          <h2 style={{ margin: 0, color: theme.text, fontSize: 18, fontWeight: 700 }}>
            Planificador de Rutas
          </h2>
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
                background: theme.bgHover,
                color: theme.text,
                border: `1px solid ${theme.border}`,
                borderRadius: 10,
                padding: '10px 14px',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                justifyContent: 'center'
              }}
            >
              <RefreshCw size={16} />
              Intercambiar origen y destino
            </button>
          )}
        </div>
      </div>

      {origenCoords && destinoCoords ? (
        <div style={{
          background: theme.bgCard,
          borderRadius: 16,
          padding: 24,
          border: `1px solid ${theme.border}`,
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: 16 }}>
            <MapIcon size={48} color={theme.accent} style={{ opacity: 0.8 }} />
          </div>
          <h3 style={{ margin: '0 0 8px', color: theme.text, fontSize: 16, fontWeight: 700 }}>
            Ruta lista para calcular
          </h3>
          <p style={{ color: theme.textMuted, fontSize: 13, marginBottom: 20 }}>
            De <span style={{ color: theme.accent, fontWeight: 600 }}>{origenCoords.nombre}</span>
            {' a '}
            <span style={{ color: theme.accent, fontWeight: 600 }}>{destinoCoords.nombre}</span>
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
        <div style={{
          background: theme.bgCard,
          borderRadius: 16,
          padding: 40,
          textAlign: 'center',
          border: `1px solid ${theme.border}`
        }}>
          <MapIcon size={48} color={theme.accent} style={{ opacity: 0.5 }} />
          <p style={{ color: theme.text, marginTop: 16, fontSize: 15 }}>
            Selecciona origen y destino
          </p>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 8 }}>
            Elige ubicaciones de origen y destino para calcular la mejor ruta en transporte público con Google Maps.
          </p>
        </div>
      )}
    </div>
  );
});

RoutePlannerView.displayName = 'RoutePlannerView';

export default RoutePlannerView;
