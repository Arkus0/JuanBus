import { useState, useMemo, useDeferredValue, lazy, Suspense } from 'react';
import { AlertTriangle, Locate, Heart, MapIcon, Wifi, WifiOff, ChevronDown, Settings } from 'lucide-react';
import type { Parada, TabId, ViewMode, Ubicacion } from './types';

// Data
import PARADAS from './data/paradas.json';
import LINEAS from './data/lineas.json';

// Hooks
import { useTheme } from './hooks/useTheme';
import { useGeolocation } from './hooks/useGeolocation';
import { usePWA } from './hooks/usePWA';
import { useBusSearch } from './hooks/useBusSearch';
import { useFavoritos } from './hooks/useFavoritos';
import { useTiempos } from './hooks/useTiempos';

// Components (eager load - críticos)
import Header from './components/Header';
import TabNavigation from './components/TabNavigation';
import ParadaCard from './components/ParadaCard';

// Components (lazy load - no críticos)
const CommuteWidget = lazy(() => import('./components/CommuteWidget'));
const GeneralMapView = lazy(() => import('./components/GeneralMapView'));
const ParadaDetail = lazy(() => import('./components/ParadaDetail'));
const LineasView = lazy(() => import('./components/LineasView'));
const RoutePlannerView = lazy(() => import('./components/RoutePlannerView'));

// Utils
import { haversineDistance } from './utils/distance';
import { shareWaitTimeViaWhatsApp } from './utils/shareUtils';

// Configurar Leaflet
import './utils/leafletConfig';

// Loading fallback component
const LoadingFallback = ({ theme }: { theme: any }) => (
  <div style={{ textAlign: 'center', padding: 20, color: theme.textMuted }}>
    <div style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</div>
  </div>
);

export default function App() {
  const { isOnline, isInstalled, canInstall, install } = usePWA();
  const { theme: t, darkMode, toggleTheme } = useTheme();
  const { userLocation, locationError, loadingLocation, getUserLocation } = useGeolocation();

  // Estados de UI
  const [activeTab, setActiveTab] = useState<TabId>('cercanas');
  const [searchTerm, setSearchTerm] = useState('');
  const deferredSearchTerm = useDeferredValue(searchTerm);
  const [selectedParada, setSelectedParada] = useState<Parada | null>(null);
  const [selectedLinea, setSelectedLinea] = useState<number | null>(null);
  const [commuteFilterLineas, setCommuteFilterLineas] = useState<number[] | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [autoRefresh] = useState(true);

  // Estados del planificador de rutas
  const [origenCoords, setOrigenCoords] = useState<Ubicacion | null>(null);
  const [destinoCoords, setDestinoCoords] = useState<Ubicacion | null>(null);

  // Estado de expansión del panel de configuración Casa/Trabajo
  const [isConfigExpanded, setIsConfigExpanded] = useState(() => {
    const casaDir = localStorage.getItem('surbus_casa_direccion') || '';
    const trabajoDir = localStorage.getItem('surbus_trabajo_direccion') || '';
    return !casaDir && !trabajoDir;
  });

  // Hooks personalizados
  const {
    favoritos,
    casaParadaId,
    trabajoParadaId,
    casaDireccion,
    trabajoDireccion,
    setCasaDireccion,
    setTrabajoDireccion,
    toggleFavorito,
    toggleCasa,
    toggleTrabajo
  } = useFavoritos();

  const { tiempos, loading, lastUpdate, loadTiempos } = useTiempos(
    selectedParada,
    autoRefresh,
    isOnline
  );

  // Paradas ordenadas por distancia
  const paradasCercanas = useMemo(() => {
    if (!userLocation) return PARADAS;
    return [...PARADAS].map(p => ({
      ...p,
      distancia: haversineDistance(userLocation.lat, userLocation.lng, p.lat, p.lng)
    })).sort((a, b) => (a.distancia || 0) - (b.distancia || 0));
  }, [userLocation]);

  // Búsqueda con hook personalizado
  const { paradasFiltradas } = useBusSearch(
    deferredSearchTerm,
    activeTab === 'cercanas' ? paradasCercanas : PARADAS,
    userLocation,
    selectedLinea,
    activeTab
  );

  // Función para compartir tiempo de espera por WhatsApp
  const shareWaitTime = (lineaId?: number) => {
    if (!selectedParada) return;

    const id = lineaId || selectedLinea;
    if (!id) return;

    const linea = LINEAS.find(l => l.id === id);
    const tiempo = tiempos[`${selectedParada.id}-${id}`];

    shareWaitTimeViaWhatsApp(id, linea, selectedParada, tiempo);
    setShowShareModal(false);
  };

  const handleClose = () => {
    setSelectedParada(null);
    setCommuteFilterLineas(null);
  };

  const handleTabChange = (tabId: TabId) => {
    setActiveTab(tabId);
    if (tabId !== 'lineas') {
      setSelectedLinea(null);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: t.bg, paddingBottom: 100 }}>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>

      {/* Header */}
      <Header
        theme={t}
        darkMode={darkMode}
        isInstalled={isInstalled}
        isOnline={isOnline}
        canInstall={canInstall}
        searchTerm={searchTerm}
        onToggleTheme={toggleTheme}
        onInstall={install}
        onSearchChange={setSearchTerm}
      />

      {/* Main */}
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '16px 20px' }}>
        {/* Widget Casa-Trabajo */}
        <Suspense fallback={<LoadingFallback theme={t} />}>
          <CommuteWidget
          theme={t}
          casaParadaId={casaParadaId}
          trabajoParadaId={trabajoParadaId}
          casaDireccion={casaDireccion}
          trabajoDireccion={trabajoDireccion}
          userLocation={userLocation}
          getUserLocation={getUserLocation}
          loadingLocation={loadingLocation}
          setCommuteFilterLineas={setCommuteFilterLineas}
          setSelectedParada={setSelectedParada}
          />
        </Suspense>

        {/* Tabs y controles */}
        <TabNavigation
          theme={t}
          activeTab={activeTab}
          viewMode={viewMode}
          favoritosCount={favoritos.length}
          onTabChange={handleTabChange}
          onViewModeChange={setViewMode}
        />

        {/* Content */}
        {activeTab === 'cercanas' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {locationError ? (
              <div style={{
                background: `${t.warning}20`,
                borderRadius: 12,
                padding: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 10
              }}>
                <AlertTriangle size={20} color={t.warning} />
                <span style={{ color: t.text, fontSize: 13, flex: 1 }}>{locationError}</span>
                <button
                  onClick={getUserLocation}
                  style={{
                    background: t.warning,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '8px 12px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Reintentar
                </button>
              </div>
            ) : loadingLocation ? (
              <div style={{ textAlign: 'center', padding: 40, color: t.textMuted }}>
                <Locate size={32} style={{ animation: 'spin 2s linear infinite' }} />
                <p style={{ marginTop: 12 }}>Obteniendo ubicación...</p>
              </div>
            ) : viewMode === 'list' ? (
              <>
                <p style={{ color: t.textMuted, fontSize: 13, margin: '0 0 4px' }}>
                  {paradasFiltradas.length} paradas
                </p>
                {paradasFiltradas.slice(0, 50).map(p => (
                  <ParadaCard
                    key={p.id}
                    parada={p}
                    theme={t}
                    favoritos={favoritos}
                    casaParadaId={casaParadaId}
                    trabajoParadaId={trabajoParadaId}
                    onParadaClick={setSelectedParada}
                    onToggleFavorito={toggleFavorito}
                  />
                ))}
              </>
            ) : (
              <Suspense fallback={<LoadingFallback theme={t} />}>
                <GeneralMapView
                  paradas={paradasFiltradas.slice(0, 100)}
                  theme={t}
                  activeTab={activeTab}
                  userLocation={userLocation}
                  setSelectedParada={setSelectedParada}
                />
              </Suspense>
            )}
          </div>
        )}

        {activeTab === 'favoritos' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Configuración de dirección de casa */}
            <div style={{
              background: t.bgCard,
              borderRadius: 16,
              padding: 20,
              border: `1px solid ${t.border}`
            }}>
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
                  <h3 style={{ margin: 0, color: t.text, fontSize: 16, fontWeight: 700 }}>
                    Configuración Casa/Trabajo
                  </h3>
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
                    <label style={{
                      display: 'block',
                      color: t.text,
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6
                    }}>
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
                    <label style={{
                      display: 'block',
                      color: t.text,
                      fontSize: 13,
                      fontWeight: 600,
                      marginBottom: 6
                    }}>
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
                      • <strong>Direcciones</strong>: Si estás lejos (más de 400m), se abre Google Maps con la ruta
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
              PARADAS.filter(p => favoritos.some(f => f.id === p.id)).map(p => (
                <ParadaCard
                  key={p.id}
                  parada={p}
                  theme={t}
                  favoritos={favoritos}
                  casaParadaId={casaParadaId}
                  trabajoParadaId={trabajoParadaId}
                  showHomeWorkButtons={true}
                  onParadaClick={setSelectedParada}
                  onToggleFavorito={toggleFavorito}
                  onToggleCasa={toggleCasa}
                  onToggleTrabajo={toggleTrabajo}
                />
              ))
            ) : (
              <Suspense fallback={<LoadingFallback theme={t} />}>
                <GeneralMapView
                  paradas={PARADAS.filter(p => favoritos.some(f => f.id === p.id))}
                  theme={t}
                  activeTab={activeTab}
                  userLocation={userLocation}
                  setSelectedParada={setSelectedParada}
                />
              </Suspense>
            )}
          </div>
        )}

        {activeTab === 'lineas' && (
          viewMode === 'list' ? (
            <Suspense fallback={<LoadingFallback theme={t} />}>
              <LineasView
                theme={t}
                selectedLinea={selectedLinea}
                setSelectedLinea={setSelectedLinea}
                setSelectedParada={setSelectedParada}
              />
            </Suspense>
          ) : (
            selectedLinea ? (
              <Suspense fallback={<LoadingFallback theme={t} />}>
                <GeneralMapView
                  paradas={PARADAS.filter(p => p.lineas.includes(selectedLinea))}
                  lineaId={selectedLinea}
                  theme={t}
                  activeTab={activeTab}
                  userLocation={userLocation}
                  setSelectedParada={setSelectedParada}
                />
              </Suspense>
            ) : (
              <div style={{
                background: t.bgCard,
                borderRadius: 16,
                padding: 40,
                textAlign: 'center',
                border: `1px solid ${t.border}`
              }}>
                <MapIcon size={48} color={t.accent} style={{ opacity: 0.5 }} />
                <p style={{ color: t.text, marginTop: 16, fontSize: 15 }}>Selecciona una línea</p>
                <p style={{ color: t.textMuted, fontSize: 13, marginTop: 8 }}>
                  Cambia a vista de lista para seleccionar una línea y ver su recorrido en el mapa.
                </p>
                <button
                  onClick={() => setViewMode('list')}
                  style={{
                    marginTop: 16,
                    background: t.accent,
                    color: '#fff',
                    border: 'none',
                    borderRadius: 10,
                    padding: '10px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Ir a vista de lista
                </button>
              </div>
            )
          )
        )}

        {activeTab === 'rutas' && (
          <Suspense fallback={<LoadingFallback theme={t} />}>
            <RoutePlannerView
              theme={t}
              origenCoords={origenCoords}
              setOrigenCoords={setOrigenCoords}
              destinoCoords={destinoCoords}
              setDestinoCoords={setDestinoCoords}
              userLocation={userLocation}
            />
          </Suspense>
        )}
      </main>

      {/* ParadaDetail Modal */}
      {selectedParada && (
        <Suspense fallback={<LoadingFallback theme={t} />}>
          <ParadaDetail
            parada={selectedParada}
            theme={t}
            tiempos={tiempos}
            favoritos={favoritos}
            loading={loading}
            isOnline={isOnline}
            lastUpdate={lastUpdate}
            selectedLinea={selectedLinea}
            commuteFilterLineas={commuteFilterLineas}
            showShareModal={showShareModal}
            onClose={handleClose}
            onRefresh={loadTiempos}
            onToggleFavorito={toggleFavorito}
            onShare={shareWaitTime}
            onSetShowShareModal={setShowShareModal}
          />
        </Suspense>
      )}

      {/* Footer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: `${t.bg}f0`,
        backdropFilter: 'blur(20px)',
        borderTop: `1px solid ${t.border}`,
        padding: '10px 20px',
        paddingBottom: 'max(10px, env(safe-area-inset-bottom))'
      }}>
        <div style={{
          maxWidth: 600,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {isOnline ? <Wifi size={14} color={t.success} /> : <WifiOff size={14} color={t.danger} />}
            <span style={{ color: t.textMuted, fontSize: 11 }}>
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
          <span style={{ color: t.textMuted, fontSize: 11 }}>
            Juan Bus v2.0 {isInstalled && '✓'}
          </span>
        </div>
      </div>
    </div>
  );
}
