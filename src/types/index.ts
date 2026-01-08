// ═══════════════════════════════════════════════════════════════════════════
// TIPOS BASE - JuanBus
// ═══════════════════════════════════════════════════════════════════════════

export interface Parada {
  id: number;
  nombre: string;
  lat: number;
  lng: number;
  lineas: number[];
  distancia?: number;
}

export interface Linea {
  id: number;
  nombre: string;
  descripcion: string;
  color: string;
}

export interface TiempoEspera {
  success: boolean;
  waitTimeString: string;
  waitTimeType: number;
}

export interface Theme {
  bg: string;
  bgCard: string;
  bgHover: string;
  text: string;
  textMuted: string;
  border: string;
  accent: string;
  gradient: string;
  success: string;
  warning: string;
  danger: string;
}

export interface Favorito {
  id: number;
  casa?: boolean;
  trabajo?: boolean;
}

export interface Ubicacion {
  lat: number;
  lng: number;
  nombre: string;
  tipo: 'ubicacion' | 'parada' | 'lugar';
}

export type TiemposMap = Record<string, TiempoEspera>;

export type TabId = 'cercanas' | 'favoritos' | 'lineas' | 'rutas';

export type ViewMode = 'list' | 'map';
