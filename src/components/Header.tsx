import { memo, useState, useRef, useEffect } from 'react';
import { Bus, Check, WifiOff, Download, Sun, Moon, Search, X, Clock } from 'lucide-react';
import type { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  darkMode: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  searchTerm: string;
  suggestions?: string[];
  onToggleTheme: () => void;
  onInstall: () => void;
  onSearchChange: (value: string) => void;
}

const Header = memo(({
  theme,
  darkMode,
  isInstalled,
  isOnline,
  canInstall,
  searchTerm,
  suggestions = [],
  onToggleTheme,
  onInstall,
  onSearchChange
}: HeaderProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cerrar sugerencias al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: `${theme.bg}f0`,
      backdropFilter: 'blur(20px)',
      borderBottom: `1px solid ${theme.border}`
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto', padding: '14px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 46,
              height: 46,
              borderRadius: 13,
              background: theme.gradient,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Bus size={26} color="#fff" />
            </div>
            <div>
              <h1 style={{ color: theme.text, margin: 0, fontSize: 22, fontWeight: 800 }}>
                Juan <span style={{ color: theme.accent }}>Bus</span>
              </h1>
              <p style={{
                color: theme.textMuted,
                margin: 0,
                fontSize: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 6
              }}>
                Almería {isInstalled && <Check size={12} color={theme.success} />}
                {!isOnline && <WifiOff size={12} color={theme.warning} />}
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {canInstall && (
              <button
                onClick={onInstall}
                style={{
                  background: theme.accent,
                  border: 'none',
                  borderRadius: 11,
                  padding: 10,
                  cursor: 'pointer'
                }}
              >
                <Download size={20} color="#fff" />
              </button>
            )}
            <button
              onClick={onToggleTheme}
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              style={{
                background: theme.bgCard,
                border: `1px solid ${theme.border}`,
                borderRadius: 11,
                padding: 10,
                cursor: 'pointer'
              }}
            >
              {darkMode ? <Sun size={20} color={theme.text} /> : <Moon size={20} color={theme.text} />}
            </button>
          </div>
        </div>

        <div ref={searchRef} style={{ position: 'relative' }}>
          <Search
            size={18}
            color={theme.textMuted}
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', zIndex: 1, pointerEvents: 'none' }}
          />
          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar parada, número o línea..."
            value={searchTerm}
            onChange={(e) => {
              onSearchChange(e.target.value);
              if (e.target.value) {
                setShowSuggestions(true);
              }
            }}
            onFocus={handleInputFocus}
            aria-label="Buscar paradas de autobús"
            role="searchbox"
            style={{
              width: '100%',
              padding: '14px 44px',
              borderRadius: 14,
              border: `1px solid ${theme.border}`,
              background: theme.bgCard,
              color: theme.text,
              fontSize: 15,
              outline: 'none'
            }}
          />
          {searchTerm && (
            <button
              onClick={() => {
                onSearchChange('');
                setShowSuggestions(false);
              }}
              aria-label="Limpiar búsqueda"
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                zIndex: 1
              }}
            >
              <X size={18} color={theme.textMuted} />
            </button>
          )}

          {/* Sugerencias */}
          {showSuggestions && suggestions.length > 0 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 4px)',
              left: 0,
              right: 0,
              background: theme.bgCard,
              border: `1px solid ${theme.border}`,
              borderRadius: 12,
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              maxHeight: 200,
              overflowY: 'auto',
              zIndex: 100
            }}>
              {suggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSuggestionClick(suggestion)}
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    background: 'transparent',
                    border: 'none',
                    borderBottom: i < suggestions.length - 1 ? `1px solid ${theme.border}` : 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    color: theme.text,
                    fontSize: 14
                  }}
                >
                  <Clock size={14} color={theme.textMuted} />
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
