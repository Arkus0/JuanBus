import { memo } from 'react';
import { Bus, Check, WifiOff, Download, Sun, Moon, Search, X } from 'lucide-react';
import type { Theme } from '../types';

interface HeaderProps {
  theme: Theme;
  darkMode: boolean;
  isInstalled: boolean;
  isOnline: boolean;
  canInstall: boolean;
  searchTerm: string;
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
  onToggleTheme,
  onInstall,
  onSearchChange
}: HeaderProps) => {
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

        <div style={{ position: 'relative' }}>
          <Search
            size={18}
            color={theme.textMuted}
            style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }}
          />
          <input
            type="text"
            placeholder="Buscar parada, número o línea..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
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
              onClick={() => onSearchChange('')}
              aria-label="Limpiar búsqueda"
              style={{
                position: 'absolute',
                right: 14,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <X size={18} color={theme.textMuted} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
});

Header.displayName = 'Header';

export default Header;
