import { memo } from 'react';
import { Locate, Star, Bus, MapIcon as Map, List, MapIcon } from 'lucide-react';
import type { Theme, TabId, ViewMode } from '../types';

interface TabNavigationProps {
  theme: Theme;
  activeTab: TabId;
  viewMode: ViewMode;
  favoritosCount: number;
  onTabChange: (tabId: TabId) => void;
  onViewModeChange: (mode: ViewMode) => void;
}

const tabs = [
  { id: 'cercanas' as TabId, icon: Locate, label: 'Cercanas' },
  { id: 'favoritos' as TabId, icon: Star, label: 'Favoritos' },
  { id: 'lineas' as TabId, icon: Bus, label: 'Líneas' },
  { id: 'rutas' as TabId, icon: Map, label: 'Rutas' },
];

const TabNavigation = memo(({
  theme,
  activeTab,
  viewMode,
  favoritosCount,
  onTabChange,
  onViewModeChange
}: TabNavigationProps) => {
  return (
    <div style={{
      position: 'sticky',
      top: 80,
      zIndex: 40,
      background: `${theme.bg}f0`,
      backdropFilter: 'blur(20px)',
      marginLeft: -20,
      marginRight: -20,
      paddingLeft: 20,
      paddingRight: 20,
      paddingTop: 8,
      paddingBottom: 8,
      marginBottom: 8
    }}>
      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        marginBottom: 12,
        overflowX: 'auto',
        paddingBottom: 4
      }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '10px 14px',
              borderRadius: 11,
              border: 'none',
              background: activeTab === tab.id ? theme.accent : theme.bgCard,
              color: activeTab === tab.id ? '#fff' : theme.textMuted,
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <tab.icon size={16} />
            {tab.label}
            {tab.id === 'favoritos' && favoritosCount > 0 && (
              <span style={{
                background: activeTab === tab.id ? 'rgba(255,255,255,0.3)' : theme.danger,
                color: '#fff',
                padding: '2px 6px',
                borderRadius: 6,
                fontSize: 11
              }}>
                {favoritosCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Toggle Vista Lista/Mapa */}
      {activeTab !== 'rutas' && (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <button
            onClick={() => onViewModeChange('list')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: viewMode === 'list' ? theme.accent : theme.bgCard,
              color: viewMode === 'list' ? '#fff' : theme.textMuted,
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            <List size={16} />
            Lista
          </button>
          <button
            onClick={() => onViewModeChange('map')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 12px',
              borderRadius: 10,
              border: `1px solid ${theme.border}`,
              background: viewMode === 'map' ? theme.accent : theme.bgCard,
              color: viewMode === 'map' ? '#fff' : theme.textMuted,
              fontWeight: 600,
              fontSize: 12,
              cursor: 'pointer'
            }}
          >
            <MapIcon size={16} />
            Mapa
          </button>
        </div>
      )}
    </div>
  );
});

TabNavigation.displayName = 'TabNavigation';

export default TabNavigation;
