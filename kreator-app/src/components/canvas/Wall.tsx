// src/components/canvas/Wall.tsx v0.003 Komponent sciany SVG z obsluga wyrownania
'use client';

import { memo, useMemo, type ReactNode } from 'react';
import type { Wall as WallType } from '@/types';

interface WallProps {
  wall: WallType;
  scale: number;
}

function WallComponent({ wall, scale }: WallProps) {
  // Oblicz maksymalna wysokosc dla wyrownania
  const maxHeight = useMemo(() => {
    return Math.max(
      ...wall.segments.flatMap((seg) => [seg.startHeight, seg.endHeight])
    );
  }, [wall.segments]);

  // Generuj sciezke SVG dla ksztaltu sciany
  const wallPath = useMemo(() => {
    if (wall.segments.length === 0) return '';

    let path = '';
    let currentX = 0;

    // Sprawdz wyrownanie pierwszego segmentu (zakladamy ze wszystkie maja to samo)
    const alignment = wall.segments[0]?.alignment ?? 'bottom';

    if (alignment === 'top') {
      // Wyrownanie do gory - skos na dole (obecne zachowanie)
      path += `M 0 0`;

      for (const segment of wall.segments) {
        const nextX = currentX + segment.width * scale;
        path += ` L ${nextX} 0`;
        currentX = nextX;
      }

      const lastSegment = wall.segments[wall.segments.length - 1];
      path += ` L ${currentX} ${lastSegment.endHeight * scale}`;

      currentX = wall.segments.reduce((sum, seg) => sum + seg.width, 0) * scale;

      for (let i = wall.segments.length - 1; i >= 0; i--) {
        const segment = wall.segments[i];
        const segmentStartX = currentX - segment.width * scale;
        path += ` L ${segmentStartX} ${segment.startHeight * scale}`;
        currentX = segmentStartX;
      }
    } else {
      // Wyrownanie do dolu (default) - skos na gorze
      // Gorna krawedz ze skosem
      const firstSeg = wall.segments[0];
      const topYStart = (maxHeight - firstSeg.startHeight) * scale;
      path += `M 0 ${topYStart}`;

      for (const segment of wall.segments) {
        const nextX = currentX + segment.width * scale;
        const topYEnd = (maxHeight - segment.endHeight) * scale;
        path += ` L ${nextX} ${topYEnd}`;
        currentX = nextX;
      }

      // Prawa krawedz w dol do maxHeight
      path += ` L ${currentX} ${maxHeight * scale}`;

      // Dolna krawedz (prosta linia)
      path += ` L 0 ${maxHeight * scale}`;
    }

    path += ' Z';
    return path;
  }, [wall.segments, scale, maxHeight]);

  // Wymiary zewnetrzne
  const dimensions = useMemo(() => {
    let currentX = 0;
    const result: Array<{ x: number; width: number; height: number }> = [];

    for (const segment of wall.segments) {
      result.push({
        x: currentX * scale,
        width: segment.width * scale,
        height: Math.max(segment.startHeight, segment.endHeight) * scale,
      });
      currentX += segment.width;
    }

    return result;
  }, [wall.segments, scale]);

  return (
    <g>
      {/* Tlo sciany */}
      <path
        d={wallPath}
        fill="rgba(255, 255, 255, 0.05)"
        stroke="rgba(255, 255, 255, 0.3)"
        strokeWidth={2}
      />

      {/* Siatka pomocnicza */}
      <WallGrid wall={wall} scale={scale} />

      {/* Wymiary zewnetrzne - szerokosc segmentow */}
      {dimensions.map((dim, i) => (
        <g key={`dim-${i}`}>
          {/* Linia wymiarowa */}
          <line
            x1={dim.x}
            y1={-15}
            x2={dim.x + dim.width}
            y2={-15}
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth={1}
          />
          {/* Znaczniki koncow */}
          <line
            x1={dim.x}
            y1={-20}
            x2={dim.x}
            y2={-10}
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth={1}
          />
          <line
            x1={dim.x + dim.width}
            y1={-20}
            x2={dim.x + dim.width}
            y2={-10}
            stroke="rgba(255, 255, 255, 0.5)"
            strokeWidth={1}
          />
          {/* Tekst wymiaru */}
          <text
            x={dim.x + dim.width / 2}
            y={-25}
            textAnchor="middle"
            fill="rgba(255, 255, 255, 0.7)"
            fontSize={11}
            fontFamily="sans-serif"
          >
            {Math.round(wall.segments[i].width)} cm
          </text>
        </g>
      ))}
    </g>
  );
}

// Siatka pomocnicza
function WallGrid({ wall, scale }: WallProps) {
  const totalWidth = wall.segments.reduce((sum, seg) => sum + seg.width, 0);
  const maxHeight = Math.max(
    ...wall.segments.flatMap((seg) => [seg.startHeight, seg.endHeight])
  );
  const alignment = wall.segments[0]?.alignment ?? 'bottom';

  const gridSpacing = 50; // 50cm
  const lines: ReactNode[] = [];

  // Oblicz offsetY dla wyrownania
  const offsetY = alignment === 'top' ? 0 : 0; // Siatka zaczyna sie od 0

  // Linie pionowe
  for (let x = 0; x <= totalWidth; x += gridSpacing) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x * scale}
        y1={offsetY}
        x2={x * scale}
        y2={maxHeight * scale}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={1}
        strokeDasharray="2,4"
      />
    );
  }

  // Linie poziome
  for (let y = 0; y <= maxHeight; y += gridSpacing) {
    lines.push(
      <line
        key={`h-${y}`}
        x1={0}
        y1={y * scale}
        x2={totalWidth * scale}
        y2={y * scale}
        stroke="rgba(255, 255, 255, 0.1)"
        strokeWidth={1}
        strokeDasharray="2,4"
      />
    );
  }

  return <g className="wall-grid">{lines}</g>;
}

export default memo(WallComponent);
