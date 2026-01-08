import { memo } from 'react';
import { X, RefreshCw, Heart, Share2, Navigation, CloudOff } from 'lucide-react';
import type { Parada, Theme, TiemposMap, Favorito } from '../types';
import { formatDistance } from '../utils/formatters';
import LINEAS from '../data/lineas.json';

interface ParadaDetailProps {
  parada: Parada | null;
  theme: Theme;
  tiempos: TiemposMap;
  favoritos: Favorito[];
  loading: boolean;
  isOnline: boolean;
  lastUpdate: Date | null;
  selectedLinea: number | null;
  commuteFilterLineas: number[] | null;
  showShareModal: boolean;
  onClose: () => void;
  onRefresh: (parada: Parada) => void;
  onToggleFavorito: (id: number) => void;
  onShare: (lineaId?: number) => void;
  onSetShowShareModal: (show: boolean) => void;
}

const ParadaDetail = memo(({
  parada,
  theme,
  tiempos,
  favoritos,
  loading,
  isOnline,
  lastUpdate,
  selectedLinea,
  commuteFilterLineas,
  showShareModal,
  onClose,
  onRefresh,
  onToggleFavorito,
  onShare,
  onSetShowShareModal
}: ParadaDetailProps) => {
  if (!parada) return null;

  const getLinea = (id: number) => LINEAS.find(l => l.id === id);

  const formatTiempo = (tiempo: any) => {
    if (!tiempo?.success) return { text: 'Sin datos', color: theme.textMuted };
    if (!tiempo.waitTimeString) return { text: tiempo.waitTimeType === 3 ? 'Sin servicio' : '...', color: theme.textMuted };
    const mins = parseInt(tiempo.waitTimeString);
    if (isNaN(mins)) return { text: tiempo.waitTimeString, color: theme.accent };
    if (mins <= 3) return { text: `${mins} min`, color: theme.success };
    if (mins <= 10) return { text: `${mins} min`, color: theme.warning };
    return { text: `${mins} min`, color: theme.danger };
  };

  // Determinar qué líneas mostrar
  const lineasAMostrar = commuteFilterLineas || parada.lineas;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: theme.bg,
          borderRadius: '24px 24px 0 0',
          width: '100%',
          maxWidth: 500,
          maxHeight: '90vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: theme.bg,
          padding: '20px 24px',
          borderBottom: `1px solid ${theme.border}`,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          zIndex: 10
        }}>
          <div style={{
            width: 56,
            height: 56,
            borderRadius: 14,
            background: theme.gradient,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
              {parada.id}
            </span>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ color: theme.text, margin: 0, fontSize: 17, fontWeight: 700 }}>
              {parada.nombre}
            </h2>
            <p style={{ color: theme.textMuted, margin: '4px 0 0', fontSize: 13 }}>
              {commuteFilterLineas
                ? `${lineasAMostrar.length} ${lineasAMostrar.length === 1 ? 'línea útil' : 'líneas útiles'}`
                : `${parada.lineas.length} líneas`}
              {parada.distancia !== undefined && ` • ${formatDistance(parada.distancia)}`}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: theme.bgCard,
              border: 'none',
              borderRadius: 12,
              padding: 10,
              cursor: 'pointer'
            }}
          >
            <X size={20} color={theme.text} />
          </button>
        </div>

        {/* Sin conexión */}
        {!isOnline && (
          <div style={{
            margin: '16px 24px 0',
            padding: '12px 16px',
            background: `${theme.warning}20`,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10
          }}>
            <CloudOff size={18} color={theme.warning} />
            <span style={{ color: theme.text, fontSize: 13 }}>Sin conexión</span>
          </div>
        )}

        {/* Botones de acción */}
        <div style={{ padding: '16px 24px', display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            onClick={() => onRefresh(parada)}
            disabled={loading || !isOnline}
            style={{
              flex: '1 1 auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: isOnline ? theme.accent : theme.textMuted,
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '12px 16px',
              fontWeight: 600,
              fontSize: 14,
              cursor: loading || !isOnline ? 'not-allowed' : 'pointer'
            }}
          >
            <RefreshCw size={18} style={{ animation: loading ? 'spin 1s linear infinite' : 'none' }} />
            {loading ? 'Actualizando...' : 'Actualizar'}
          </button>
          <button
            onClick={() => onToggleFavorito(parada.id)}
            style={{
              background: favoritos.some(f => f.id === parada.id) ? theme.danger : theme.bgCard,
              color: favoritos.some(f => f.id === parada.id) ? '#fff' : theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: 12,
              cursor: 'pointer'
            }}
          >
            <Heart size={18} fill={favoritos.some(f => f.id === parada.id) ? '#fff' : 'transparent'} />
          </button>
          <button
            onClick={() => {
              if (selectedLinea) {
                onShare(selectedLinea);
              } else {
                onSetShowShareModal(true);
              }
            }}
            style={{
              background: theme.bgCard,
              color: theme.text,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: 12,
              cursor: 'pointer'
            }}
          >
            <Share2 size={18} />
          </button>
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${parada.lat},${parada.lng}&travelmode=walking`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              padding: 12
            }}
          >
            <Navigation size={18} color={theme.text} />
          </a>
        </div>

        {/* Lista de líneas */}
        <div style={{ padding: '0 24px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <h3 style={{ color: theme.text, margin: 0, fontSize: 16, fontWeight: 600 }}>
              Próximos buses
            </h3>
            {lastUpdate && (
              <span style={{ color: theme.textMuted, fontSize: 12 }}>
                {lastUpdate.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lineasAMostrar
              .filter(lineaId => !selectedLinea || lineaId === selectedLinea)
              .map(lineaId => {
                const linea = getLinea(lineaId);
                const tiempo = tiempos[`${parada.id}-${lineaId}`];
                const fmt = formatTiempo(tiempo);
                return linea && (
                  <div
                    key={lineaId}
                    style={{
                      background: theme.bgCard,
                      borderRadius: 14,
                      padding: '14px 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      border: `1px solid ${theme.border}`
                    }}
                  >
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 11,
                      background: linea.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>
                        L{lineaId}
                      </span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: theme.text,
                        fontWeight: 600,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}>
                        {linea.nombre}
                      </div>
                      <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                        {linea.descripcion}
                      </div>
                    </div>
                    <div style={{
                      background: `${fmt.color}20`,
                      borderRadius: 10,
                      padding: '8px 14px',
                      minWidth: 70,
                      textAlign: 'center'
                    }}>
                      <span style={{ color: fmt.color, fontWeight: 700, fontSize: 14 }}>
                        {fmt.text}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Modal de selección de línea para compartir */}
        {showShareModal && !selectedLinea && (
          <div
            onClick={() => onSetShowShareModal(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              zIndex: 1002,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: theme.bg,
                borderRadius: 16,
                width: '100%',
                maxWidth: 400,
                maxHeight: '80vh',
                overflow: 'auto',
                padding: 24
              }}
            >
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20
              }}>
                <h3 style={{ color: theme.text, margin: 0, fontSize: 18, fontWeight: 700 }}>
                  Compartir tiempo de espera
                </h3>
                <button
                  onClick={() => onSetShowShareModal(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 4
                  }}
                >
                  <X size={20} color={theme.text} />
                </button>
              </div>
              <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 20 }}>
                Selecciona la línea que deseas compartir:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {lineasAMostrar.map(lineaId => {
                  const linea = getLinea(lineaId);
                  const tiempo = tiempos[`${parada.id}-${lineaId}`];
                  const fmt = formatTiempo(tiempo);
                  return linea && (
                    <button
                      key={lineaId}
                      onClick={() => onShare(lineaId)}
                      style={{
                        background: theme.bgCard,
                        border: `1px solid ${theme.border}`,
                        borderRadius: 12,
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{
                        width: 44,
                        height: 44,
                        borderRadius: 11,
                        background: linea.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <span style={{ color: '#fff', fontWeight: 800, fontSize: 14 }}>
                          L{lineaId}
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                        <div style={{ color: theme.text, fontWeight: 600, fontSize: 14 }}>
                          {linea.nombre}
                        </div>
                        <div style={{ color: theme.textMuted, fontSize: 12, marginTop: 2 }}>
                          {linea.descripcion}
                        </div>
                      </div>
                      <div style={{
                        background: `${fmt.color}20`,
                        borderRadius: 10,
                        padding: '8px 14px',
                        minWidth: 70,
                        textAlign: 'center'
                      }}>
                        <span style={{ color: fmt.color, fontWeight: 700, fontSize: 14 }}>
                          {fmt.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

ParadaDetail.displayName = 'ParadaDetail';

export default ParadaDetail;
