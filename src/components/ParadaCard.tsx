import { memo } from 'react';
import { Navigation, Heart, Home, Briefcase } from 'lucide-react';
import type { Parada, Theme, Favorito } from '../types';
import { formatDistance } from '../utils/formatters';
import LINEAS from '../data/lineas.json';

interface ParadaCardProps {
  parada: Parada;
  theme: Theme;
  favoritos: Favorito[];
  casaParadaId: number | null;
  trabajoParadaId: number | null;
  showHomeWorkButtons?: boolean;
  onParadaClick: (parada: Parada) => void;
  onToggleFavorito: (id: number) => void;
  onToggleCasa?: (id: number) => void;
  onToggleTrabajo?: (id: number) => void;
}

const ParadaCard = memo(({
  parada,
  theme,
  favoritos,
  casaParadaId,
  trabajoParadaId,
  showHomeWorkButtons = false,
  onParadaClick,
  onToggleFavorito,
  onToggleCasa,
  onToggleTrabajo
}: ParadaCardProps) => {
  const getLinea = (id: number) => LINEAS.find(l => l.id === id);

  return (
    <div
      onClick={() => onParadaClick(parada)}
      style={{
        background: theme.bgCard,
        borderRadius: 16,
        padding: '16px 20px',
        cursor: 'pointer',
        border: `1px solid ${theme.border}`,
        display: 'flex',
        alignItems: 'center',
        gap: 14
      }}
    >
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: theme.gradient,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        <span style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
          {parada.id}
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          color: theme.text,
          fontWeight: 600,
          fontSize: 15,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {parada.nombre}
        </div>

        <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
          {parada.lineas.slice(0, 5).map(l => {
            const linea = getLinea(l);
            return linea && (
              <span
                key={l}
                style={{
                  background: linea.color,
                  color: '#fff',
                  padding: '2px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700
                }}
              >
                L{l}
              </span>
            );
          })}
          {parada.lineas.length > 5 && (
            <span style={{ color: theme.textMuted, fontSize: 11 }}>
              +{parada.lineas.length - 5}
            </span>
          )}
        </div>

        {parada.distancia !== undefined && (
          <div style={{
            color: theme.accent,
            fontSize: 12,
            marginTop: 6,
            display: 'flex',
            alignItems: 'center',
            gap: 4
          }}>
            <Navigation size={12} />
            {formatDistance(parada.distancia)}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        {showHomeWorkButtons && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleCasa?.(parada.id);
              }}
              style={{
                background: casaParadaId === parada.id ? theme.accent : 'transparent',
                border: `1px solid ${casaParadaId === parada.id ? theme.accent : theme.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Parada cerca de casa (para ir al trabajo)"
            >
              <Home size={18} color={casaParadaId === parada.id ? '#fff' : theme.textMuted} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleTrabajo?.(parada.id);
              }}
              style={{
                background: trabajoParadaId === parada.id ? theme.accent : 'transparent',
                border: `1px solid ${trabajoParadaId === parada.id ? theme.accent : theme.border}`,
                borderRadius: 8,
                cursor: 'pointer',
                padding: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Parada cerca del trabajo (para volver a casa)"
            >
              <Briefcase size={18} color={trabajoParadaId === parada.id ? '#fff' : theme.textMuted} />
            </button>
          </>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorito(parada.id);
          }}
          style={{
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: 8
          }}
        >
          <Heart
            size={22}
            fill={favoritos.some(f => f.id === parada.id) ? '#ef4444' : 'transparent'}
            color={favoritos.some(f => f.id === parada.id) ? '#ef4444' : theme.textMuted}
          />
        </button>
      </div>
    </div>
  );
});

ParadaCard.displayName = 'ParadaCard';

export default ParadaCard;
