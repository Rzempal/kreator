// src/components/canvas/Wall.tsx v0.002 Komponent sciany SVG
'use client';

import { memo, useMemo, type ReactNode } from 'react';
import type { Wall as WallType } from '@/types';

interface WallProps {
  wall: WallType;
  scale: number;
}

function WallComponent({ wall, scale }: WallProps) {
  // Generuj sciezke SVG dla ksztaltu sciany
  const wallPath = useMemo(() => {
    if (wall.segments.length === 0) return '';

    let path = '';
    let currentX = 0;

    // Gorna krawedz (od lewej do prawej)
    path += `M 0 0`;

    for (const segment of wall.segments) {
      const nextX = currentX + segment.width * scale;
      // Linia gorna (zakres wysokosci nie ma znaczenia - rysujemy od Y=0)
      path += ` L ${nextX} 0`;
      currentX = nextX;
    }

    // Prawa krawedz (w dol)
    const lastSegment = wall.segments[wall.segments.length - 1];
    path += ` L ${currentX} ${lastSegment.endHeight * scale}`;

    // Dolna krawedz (od prawej do lewej) - uwzgledniaj skosy
    currentX = wall.segments.reduce((sum, seg) => sum + seg.width, 0) * scale;

    for (let i = wall.segments.length - 1; i >= 0; i--) {
      const segment = wall.segments[i];
      const segmentStartX = currentX - segment.width * scale;

      // Interpolacja dla skosow
      path += ` L ${segmentStartX} ${segment.startHeight * scale}`;
      currentX = segmentStartX;
    }

    path += ' Z';
    return path;
  }, [wall.segments, scale]);

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

  const gridSpacing = 50; // 50cm
  const lines: ReactNode[] = [];

  // Linie pionowe
  for (let x = 0; x <= totalWidth; x += gridSpacing) {
    lines.push(
      <line
        key={`v-${x}`}
        x1={x * scale}
        y1={0}
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
