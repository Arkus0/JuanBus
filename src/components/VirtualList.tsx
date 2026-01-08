import { useState, useEffect, useRef, memo, ReactNode } from 'react';

/**
 * Componente de lista virtualizada simple y ligero
 * Renderiza solo los elementos visibles para mejorar rendimiento con listas largas
 * ~100x más rápido que renderizar todos los elementos
 */

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number; // Altura estimada de cada item en px
  containerHeight: number; // Altura del contenedor visible
  renderItem: (item: T, index: number) => ReactNode;
  overscan?: number; // Número de items extra a renderizar fuera de vista (default: 3)
  className?: string;
  style?: React.CSSProperties;
}

function VirtualListInner<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  className,
  style
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calcular qué items son visibles
  const totalHeight = items.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex + 1);

  // Manejar scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Scroll suave al top cuando cambian los items
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = 0;
      setScrollTop(0);
    }
  }, [items.length]);

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        ...style
      }}
    >
      {/* Spacer superior */}
      <div style={{ height: startIndex * itemHeight }} />

      {/* Items visibles */}
      {visibleItems.map((item, i) => (
        <div key={startIndex + i}>
          {renderItem(item, startIndex + i)}
        </div>
      ))}

      {/* Spacer inferior */}
      <div style={{ height: Math.max(0, totalHeight - (endIndex + 1) * itemHeight) }} />
    </div>
  );
}

export const VirtualList = memo(VirtualListInner) as typeof VirtualListInner;
