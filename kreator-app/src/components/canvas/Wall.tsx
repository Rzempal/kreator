// src/components/canvas/Wall.tsx v0.004 Fix renderowania startHeight/endHeight dla kazdego segmentu
'use client';

import { memo, useMemo, type ReactNode } from 'react';
import type { Wall as WallType } from '@/types';

interface WallProps {
  wall: WallType;
  scale: number;
}

function WallComponent({ wall, scale }: WallProps) {
  // Normalizuj segmenty - upewnij sie ze alignment jest zdefiniowany
  const normalizedSegments = useMemo(() => {
    return wall.segments.map(seg => ({
      ...seg,
      alignment: seg.alignment ?? 'bottom' as const,
    }));
  }, [wall.segments]);

  // Debug - sprawdz alignment
  console.log('[Wall] segments alignment:', normalizedSegments.map(s => s.alignment));

  // Oblicz maksymalna wysokosc dla wyrownania
  const maxHeight = useMemo(() => {
    return Math.max(
      ...normalizedSegments.flatMap((seg) => [seg.startHeight, seg.endHeight])
    );
  }, [normalizedSegments]);

  // Generuj sciezke SVG dla ksztaltu sciany
  const wallPath = useMemo(() => {
    if (normalizedSegments.length === 0) return '';

    let path = '';
    let currentX = 0;

    // Sprawdz wyrownanie pierwszego segmentu (zakladamy ze wszystkie maja to samo)
    const alignment = normalizedSegments[0].alignment;

    console.log('[Wall] Drawing with alignment:', alignment);

    if (alignment === 'top') {
      // Wyrownanie do gory - gorna krawedz na Y=0, skos na dole
      // Gorna krawedz (prosta linia na Y=0)
      path += `M 0 0`;
      const totalWidth = normalizedSegments.reduce((sum, seg) => sum + seg.width, 0);
      path += ` L ${totalWidth * scale} 0`;

      // Prawa krawedz w dol
      const lastSeg = normalizedSegments[normalizedSegments.length - 1];
      path += ` L ${totalWidth * scale} ${lastSeg.endHeight * scale}`;

      // Dolna krawedz ze skosami (od prawej do lewej)
      currentX = totalWidth * scale;
      for (let i = normalizedSegments.length - 1; i >= 0; i--) {
        const segment = normalizedSegments[i];
        const segStartX = currentX - segment.width * scale;

        // Najpierw punkt endHeight (prawa krawedz segmentu)
        path += ` L ${currentX} ${segment.endHeight * scale}`;
        // Potem punkt startHeight (lewa krawedz segmentu)
        path += ` L ${segStartX} ${segment.startHeight * scale}`;

        currentX = segStartX;
      }
    } else {
      // Wyrownanie do dolu (default) - dolna krawedz na Y=maxHeight, skos na gorze
      // Gorna krawedz ze skosami (od lewej do prawej)
      const firstSeg = normalizedSegments[0];
      path += `M 0 ${(maxHeight - firstSeg.startHeight) * scale}`;

      for (const segment of normalizedSegments) {
        const segStartX = currentX;
        const segEndX = currentX + segment.width * scale;

        // Najpierw punkt startHeight (lewa krawedz segmentu)
        path += ` L ${segStartX} ${(maxHeight - segment.startHeight) * scale}`;
        // Potem punkt endHeight (prawa krawedz segmentu)
        path += ` L ${segEndX} ${(maxHeight - segment.endHeight) * scale}`;

        currentX = segEndX;
      }

      // Prawa krawedz w dol do maxHeight
      path += ` L ${currentX} ${maxHeight * scale}`;

      // Dolna krawedz (prosta linia)
      path += ` L 0 ${maxHeight * scale}`;
    }

    path += ' Z';
    return path;
  }, [normalizedSegments, scale, maxHeight]);

  // Wymiary zewnetrzne
  const dimensions = useMemo(() => {
    let currentX = 0;
    const result: Array<{ x: number; width: number; height: number }> = [];

    for (const segment of normalizedSegments) {
      result.push({
        x: currentX * scale,
        width: segment.width * scale,
        height: Math.max(segment.startHeight, segment.endHeight) * scale,
      });
      currentX += segment.width;
    }

    return result;
  }, [normalizedSegments, scale]);

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
            {Math.round(normalizedSegments[i].width)} cm
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

// Tymczasowo bez memo dla debugowania
export default WallComponent;
