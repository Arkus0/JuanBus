import { memo } from 'react';
import { Home, Briefcase } from 'lucide-react';
import type { Theme, Parada } from '../types';
import { haversineDistance } from '../utils/distance';
import PARADAS from '../data/paradas.json';

interface CommuteWidgetProps {
  theme: Theme;
  casaParadaId: number | null;
  trabajoParadaId: number | null;
  casaDireccion: string;
  trabajoDireccion: string;
  userLocation: { lat: number; lng: number } | null;
  getUserLocation: () => Promise<{ lat: number; lng: number }>;
  loadingLocation: boolean;
  setCommuteFilterLineas: (lineas: number[] | null) => void;
  setSelectedParada: (parada: Parada) => void;
}

interface ButtonCardProps {
  icon: React.ElementType;
  label: string;
  subtitle: string;
  onClick: () => void;
  isConfigured: boolean;
  color: string;
  theme: Theme;
}

const ButtonCard = ({ icon: Icon, label, subtitle, onClick, isConfigured, color, theme }: ButtonCardProps) => (
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

const CommuteWidget = memo(({
  theme,
  casaParadaId,
  trabajoParadaId,
  casaDireccion,
  trabajoDireccion,
  userLocation,
  getUserLocation,
  setCommuteFilterLineas,
  setSelectedParada
}: CommuteWidgetProps) => {
  const getParada = (id: number): Parada | undefined =>
    PARADAS.find(p => p.id === id);

  // Maneja click en "Ir al Trabajo"
  const handleIrAlTrabajo = async () => {
    const paradaCasa = casaParadaId ? getParada(casaParadaId) : null;
    console.log('🏢 [Ir al Trabajo] Iniciando...');

    try {
      console.log('📍 [Ir al Trabajo] Obteniendo ubicación GPS...');
      const location = await getUserLocation();
      console.log('📍 [Ir al Trabajo] Ubicación obtenida:', location);

      if (paradaCasa && location) {
        const distancia = haversineDistance(
          location.lat,
          location.lng,
          paradaCasa.lat,
          paradaCasa.lng
        );
        console.log(`📏 [Ir al Trabajo] Distancia a parada casa (${casaParadaId}):`, Math.round(distancia), 'metros');

        if (distancia < 400) {
          console.log('✅ [Ir al Trabajo] Estás cerca de casa → Mostrando parada');
          setSelectedParada(paradaCasa);
          setCommuteFilterLineas(null);
          return;
        }
        console.log('🚗 [Ir al Trabajo] Estás lejos de casa → Abriendo Google Maps');
      }

      if (trabajoDireccion) {
        const origin = location ? `${location.lat},${location.lng}` : '';
        const destination = encodeURIComponent(`${trabajoDireccion}, Almería`);
        const url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${destination}&travelmode=transit`;
        window.open(url, '_blank');
        return;
      }

      if (paradaCasa) {
        setSelectedParada(paradaCasa);
        setCommuteFilterLineas(null);
      }
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      if (trabajoDireccion) {
        const destination = encodeURIComponent(`${trabajoDireccion}, Almería`);
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=transit`;
        window.open(url, '_blank');
      }
    }
  };

  // Maneja click en "Ir a Casa"
  const handleIrACasa = async () => {
    const paradaTrabajo = trabajoParadaId ? getParada(trabajoParadaId) : null;
    console.log('🏠 [Ir a Casa] Iniciando...');

    try {
      console.log('📍 [Ir a Casa] Obteniendo ubicación GPS...');
      const location = await getUserLocation();
      console.log('📍 [Ir a Casa] Ubicación obtenida:', location);

      if (paradaTrabajo && location) {
        const distancia = haversineDistance(
          location.lat,
          location.lng,
          paradaTrabajo.lat,
          paradaTrabajo.lng
        );
        console.log(`📏 [Ir a Casa] Distancia a parada trabajo (${trabajoParadaId}):`, Math.round(distancia), 'metros');

        if (distancia < 400) {
          console.log('✅ [Ir a Casa] Estás cerca del trabajo → Mostrando parada');
          setSelectedParada(paradaTrabajo);
          setCommuteFilterLineas(null);
          return;
        }
        console.log('🚗 [Ir a Casa] Estás lejos del trabajo → Abriendo Google Maps');
      }

      if (casaDireccion) {
        const origin = location ? `${location.lat},${location.lng}` : '';
        const destination = encodeURIComponent(`${casaDireccion}, Almería`);
        const url = `https://www.google.com/maps/dir/?api=1${origin ? `&origin=${origin}` : ''}&destination=${destination}&travelmode=transit`;
        window.open(url, '_blank');
        return;
      }

      if (paradaTrabajo) {
        setSelectedParada(paradaTrabajo);
        setCommuteFilterLineas(null);
      }
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      if (casaDireccion) {
        const destination = encodeURIComponent(`${casaDireccion}, Almería`);
        const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=transit`;
        window.open(url, '_blank');
      }
    }
  };

  // Determinar subtítulo para "Ir a Casa"
  const getSubtituloIrACasa = () => {
    if (!trabajoParadaId && !casaDireccion) return 'No configurado';

    const paradaTrabajo = trabajoParadaId ? getParada(trabajoParadaId) : null;

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

      if (distancia < 400) {
        return `Parada ${trabajoParadaId}`;
      }
      if (casaDireccion) {
        return `Ruta a casa`;
      }
      return `Parada ${trabajoParadaId}`;
    }

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

      if (distancia < 400) {
        return `Parada ${casaParadaId}`;
      }
      if (trabajoDireccion) {
        return `Ruta al trabajo`;
      }
      return `Parada ${casaParadaId}`;
    }

    if (trabajoDireccion) {
      return 'Ruta al trabajo';
    } else if (casaParadaId) {
      return `Parada ${casaParadaId}`;
    }
    return 'No configurado';
  };

  // Si no hay nada configurado, no mostramos nada
  if (!casaParadaId && !trabajoParadaId && !casaDireccion && !trabajoDireccion) return null;

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
      <ButtonCard
        icon={Home}
        label="Ir a Casa"
        subtitle={getSubtituloIrACasa()}
        onClick={handleIrACasa}
        isConfigured={!!(trabajoParadaId || casaDireccion)}
        color={theme.accent}
        theme={theme}
      />
      <ButtonCard
        icon={Briefcase}
        label="Ir al Trabajo"
        subtitle={getSubtituloIrAlTrabajo()}
        onClick={handleIrAlTrabajo}
        isConfigured={!!(casaParadaId || trabajoDireccion)}
        color="#10b981"
        theme={theme}
      />
    </div>
  );
});

CommuteWidget.displayName = 'CommuteWidget';

export default CommuteWidget;
