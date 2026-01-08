import { useState, useEffect, useMemo, memo } from 'react';
import { Locate, MapPin } from 'lucide-react';
import type { Theme, Ubicacion } from '../types';
import PARADAS from '../data/paradas.json';

interface LocationSelectorProps {
  label: string;
  value: Ubicacion | null;
  onChange: (value: Ubicacion | null) => void;
  placeholder?: string;
  theme: Theme;
  userLocation: { lat: number; lng: number } | null;
}

const LocationSelector = memo(({
  label,
  value,
  onChange,
  placeholder,
  theme,
  userLocation
}: LocationSelectorProps) => {
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
      <label style={{
        display: 'block',
        color: theme.text,
        fontSize: 13,
        fontWeight: 600,
        marginBottom: 6
      }}>
        {label}
      </label>

      {/* Campo de texto para buscar lugar */}
      <input
        type="text"
        placeholder={placeholder || "Escribe un lugar (ej: Universidad de Almería)"}
        value={lugarTexto}
        onChange={(e) => {
          setLugarTexto(e.target.value);
          if (e.target.value) {
            onChange({ nombre: e.target.value, tipo: 'lugar', lat: 0, lng: 0 });
          } else {
            onChange(null);
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
              onChange({
                lat: userLocation.lat,
                lng: userLocation.lng,
                nombre: 'Mi ubicación',
                tipo: 'ubicacion'
              });
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
          <div style={{
            padding: 10,
            borderBottom: `1px solid ${theme.border}`,
            position: 'sticky',
            top: 0,
            background: theme.bgCard
          }}>
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
                  onChange({
                    lat: p.lat,
                    lng: p.lng,
                    nombre: p.nombre,
                    tipo: 'parada'
                  });
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
                <div style={{ color: theme.text, fontSize: 13, fontWeight: 600 }}>
                  {p.nombre}
                </div>
                <div style={{ color: theme.textMuted, fontSize: 11, marginTop: 2 }}>
                  ID: {p.id} • Líneas: {p.lineas.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

LocationSelector.displayName = 'LocationSelector';

export default LocationSelector;
