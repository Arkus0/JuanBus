/**
 * Utilidades para exportar/importar configuración de usuario
 * Permite respaldar favoritos, preferencias y configuraciones
 */

export interface BackupData {
  version: string;
  timestamp: string;
  favoritos: any[];
  casaParadaId: number | null;
  trabajoParadaId: number | null;
  casaDireccion: string;
  trabajoDireccion: string;
  searchHistory: string[];
  theme: 'light' | 'dark';
}

/**
 * Exporta toda la configuración del usuario a un archivo JSON
 */
export const exportConfig = (): void => {
  try {
    // Recolectar todos los datos de localStorage
    const backupData: BackupData = {
      version: '2.1.0',
      timestamp: new Date().toISOString(),
      favoritos: JSON.parse(localStorage.getItem('surbus_favoritos') || '[]'),
      casaParadaId: JSON.parse(localStorage.getItem('surbus_casa_parada_id') || 'null'),
      trabajoParadaId: JSON.parse(localStorage.getItem('surbus_trabajo_parada_id') || 'null'),
      casaDireccion: localStorage.getItem('surbus_casa_direccion') || '',
      trabajoDireccion: localStorage.getItem('surbus_trabajo_direccion') || '',
      searchHistory: JSON.parse(localStorage.getItem('surbus_search_history') || '[]'),
      theme: localStorage.getItem('surbus_theme') as 'light' | 'dark' || 'light'
    };

    // Crear blob y descargar
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `juanbus-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error al exportar configuración:', error);
    throw new Error('No se pudo exportar la configuración');
  }
};

/**
 * Importa configuración desde un archivo JSON
 */
export const importConfig = (file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const backupData: BackupData = JSON.parse(content);

        // Validar estructura básica
        if (!backupData.version || !backupData.timestamp) {
          throw new Error('Archivo de respaldo inválido');
        }

        // Restaurar datos en localStorage
        if (backupData.favoritos) {
          localStorage.setItem('surbus_favoritos', JSON.stringify(backupData.favoritos));
        }

        if (backupData.casaParadaId !== undefined) {
          localStorage.setItem('surbus_casa_parada_id', JSON.stringify(backupData.casaParadaId));
        }

        if (backupData.trabajoParadaId !== undefined) {
          localStorage.setItem('surbus_trabajo_parada_id', JSON.stringify(backupData.trabajoParadaId));
        }

        if (backupData.casaDireccion !== undefined) {
          localStorage.setItem('surbus_casa_direccion', backupData.casaDireccion);
        }

        if (backupData.trabajoDireccion !== undefined) {
          localStorage.setItem('surbus_trabajo_direccion', backupData.trabajoDireccion);
        }

        if (backupData.searchHistory) {
          localStorage.setItem('surbus_search_history', JSON.stringify(backupData.searchHistory));
        }

        if (backupData.theme) {
          localStorage.setItem('surbus_theme', backupData.theme);
        }

        resolve();
      } catch (error) {
        console.error('Error al importar configuración:', error);
        reject(new Error('No se pudo importar la configuración. Verifica que el archivo sea válido.'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsText(file);
  });
};

/**
 * Limpia toda la configuración del usuario (reset completo)
 */
export const clearAllConfig = (): void => {
  const keys = [
    'surbus_favoritos',
    'surbus_casa_parada_id',
    'surbus_trabajo_parada_id',
    'surbus_casa_direccion',
    'surbus_trabajo_direccion',
    'surbus_search_history',
    'surbus_tiempos_cache'
    // NO eliminar 'surbus_theme' para mantener preferencia de tema
  ];

  keys.forEach(key => localStorage.removeItem(key));
};

/**
 * Obtiene estadísticas de uso de localStorage
 */
export const getStorageStats = () => {
  try {
    let totalSize = 0;
    const items: Record<string, number> = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('surbus_')) {
        const value = localStorage.getItem(key) || '';
        const size = new Blob([value]).size;
        items[key] = size;
        totalSize += size;
      }
    }

    // Límite típico de localStorage es 5-10MB
    const limitEstimate = 5 * 1024 * 1024; // 5MB

    return {
      totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      usage: ((totalSize / limitEstimate) * 100).toFixed(1),
      items,
      itemCount: Object.keys(items).length
    };
  } catch {
    return null;
  }
};

/**
 * Comparte configuración como texto (para copiar/pegar)
 */
export const shareConfigAsText = (): string => {
  try {
    const backupData: BackupData = {
      version: '2.1.0',
      timestamp: new Date().toISOString(),
      favoritos: JSON.parse(localStorage.getItem('surbus_favoritos') || '[]'),
      casaParadaId: JSON.parse(localStorage.getItem('surbus_casa_parada_id') || 'null'),
      trabajoParadaId: JSON.parse(localStorage.getItem('surbus_trabajo_parada_id') || 'null'),
      casaDireccion: localStorage.getItem('surbus_casa_direccion') || '',
      trabajoDireccion: localStorage.getItem('surbus_trabajo_direccion') || '',
      searchHistory: JSON.parse(localStorage.getItem('surbus_search_history') || '[]'),
      theme: localStorage.getItem('surbus_theme') as 'light' | 'dark' || 'light'
    };

    return JSON.stringify(backupData, null, 2);
  } catch (error) {
    throw new Error('Error al generar texto de configuración');
  }
};

/**
 * Importa configuración desde texto (copiar/pegar)
 */
export const importConfigFromText = (text: string): void => {
  try {
    const backupData: BackupData = JSON.parse(text);

    // Validar estructura básica
    if (!backupData.version || !backupData.timestamp) {
      throw new Error('Datos de configuración inválidos');
    }

    // Restaurar (igual que importConfig pero sin FileReader)
    if (backupData.favoritos) {
      localStorage.setItem('surbus_favoritos', JSON.stringify(backupData.favoritos));
    }

    if (backupData.casaParadaId !== undefined) {
      localStorage.setItem('surbus_casa_parada_id', JSON.stringify(backupData.casaParadaId));
    }

    if (backupData.trabajoParadaId !== undefined) {
      localStorage.setItem('surbus_trabajo_parada_id', JSON.stringify(backupData.trabajoParadaId));
    }

    if (backupData.casaDireccion !== undefined) {
      localStorage.setItem('surbus_casa_direccion', backupData.casaDireccion);
    }

    if (backupData.trabajoDireccion !== undefined) {
      localStorage.setItem('surbus_trabajo_direccion', backupData.trabajoDireccion);
    }

    if (backupData.searchHistory) {
      localStorage.setItem('surbus_search_history', JSON.stringify(backupData.searchHistory));
    }

    if (backupData.theme) {
      localStorage.setItem('surbus_theme', backupData.theme);
    }
  } catch (error) {
    throw new Error('No se pudo importar la configuración. Verifica que el texto sea válido.');
  }
};
