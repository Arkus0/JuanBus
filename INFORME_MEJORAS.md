# Informe de posibles mejoras (funcionalidad, UI y UX)

## 1) Funcionalidad y datos
- **Modo offline más robusto**: cachear últimas consultas de tiempos por parada/línea y mostrar fecha/hora de validez.
- **Alertas de servicio**: panel para incidencias por línea (desvíos, huelgas, cortes temporales).
- **Favoritos inteligentes**: ordenar favoritos por franja horaria y uso frecuente.
- **Búsqueda por voz**: atajo opcional para introducir paradas o líneas en movilidad.

## 2) UI / UX
- **Tour de primera visita**: explicar rápidamente pestañas, búsqueda, favoritos y casa/trabajo.
- **Filtros rápidos en resultados**: chips para "solo accesibles", "menos transbordos", "más cercanas".
- **Feedback de acciones**: toast al guardar favorito, compartir o actualizar tiempos.
- **Mejoras de legibilidad**: tamaño de fuente configurable y mayor contraste para accesibilidad.

## 3) Rendimiento
- **Virtualización en listados largos**: renderizar solo elementos visibles en lista de paradas.
- **Memoización de cálculos**: reducir recomputaciones en búsquedas complejas y scoring fuzzy.
- **Precarga selectiva**: prefetch de vistas más usadas según comportamiento del usuario.

## 4) Accesibilidad
- **Navegación completa por teclado** en todas las tarjetas y botones contextuales.
- **Anuncios ARIA en cambios de estado** (ej. "3 resultados encontrados").
- **Preferencias persistentes** de contraste y tamaño de texto.

## 5) Calidad técnica
- **Suite de pruebas**:
  - Unitarias para hooks (`useBusSearch`, `useTiempos`, `useGeolocation`).
  - Integración para flujo búsqueda → parada → tiempos.
  - E2E para escenarios críticos en móvil.
- **Observabilidad**:
  - Métricas de tiempo de búsqueda y carga de mapas.
  - Registro de errores no críticos (con muestreo).

## 6) Hoja de ruta sugerida (rápida)
1. Añadir tests mínimos + toasts + ARIA announcements.
2. Virtualización de listas + optimización de búsqueda.
3. Alertas de servicio y mejoras offline.
4. Personalización de accesibilidad y onboarding.
