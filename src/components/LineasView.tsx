import { memo } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Parada, Theme } from '../types';
import LINEAS from '../data/lineas.json';
import PARADAS from '../data/paradas.json';

interface LineasViewProps {
  theme: Theme;
  selectedLinea: number | null;
  setSelectedLinea: (lineaId: number | null) => void;
  setSelectedParada: (parada: Parada) => void;
}

const LineasView = memo(({
  theme,
  selectedLinea,
  setSelectedLinea,
  setSelectedParada
}: LineasViewProps) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {LINEAS.map(linea => {
        const paradasLinea = PARADAS.filter(p => p.lineas.includes(linea.id));
        const isExp = selectedLinea === linea.id;
        return (
          <div
            key={linea.id}
            style={{
              background: theme.bgCard,
              borderRadius: 16,
              overflow: 'hidden',
              border: `1px solid ${isExp ? linea.color : theme.border}`
            }}
          >
            <div
              onClick={() => setSelectedLinea(isExp ? null : linea.id)}
              style={{
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                cursor: 'pointer'
              }}
            >
              <div style={{
                width: 52,
                height: 52,
                borderRadius: 14,
                background: linea.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ color: '#fff', fontWeight: 800, fontSize: 18 }}>
                  L{linea.id}
                </span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: theme.text, fontWeight: 600, fontSize: 15 }}>
                  {linea.nombre}
                </div>
                <div style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>
                  {paradasLinea.length} paradas
                </div>
              </div>
              <ChevronDown
                size={20}
                color={theme.textMuted}
                style={{
                  transform: isExp ? 'rotate(180deg)' : 'rotate(0)',
                  transition: 'transform 0.2s'
                }}
              />
            </div>
            {isExp && (
              <div style={{
                padding: '0 20px 16px',
                borderTop: `1px solid ${theme.border}`,
                paddingTop: 16,
                maxHeight: 300,
                overflowY: 'auto'
              }}>
                {paradasLinea.map((p, i) => (
                  <div
                    key={p.id}
                    onClick={() => setSelectedParada(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      padding: '10px 12px',
                      background: theme.bgHover,
                      borderRadius: 10,
                      cursor: 'pointer',
                      marginBottom: 8
                    }}
                  >
                    <div style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: linea.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 11,
                      fontWeight: 700,
                      color: '#fff'
                    }}>
                      {i + 1}
                    </div>
                    <span style={{ color: theme.text, fontSize: 13, flex: 1 }}>
                      {p.nombre}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

LineasView.displayName = 'LineasView';

export default LineasView;
