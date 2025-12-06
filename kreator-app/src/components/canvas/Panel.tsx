// src/components/canvas/Panel.tsx v0.001 Komponent pojedynczego panelu SVG
'use client';

import { memo } from 'react';
import type { Panel as PanelType, PanelStatus } from '@/types';
import { isLightColor } from '@/lib/utils';
import fabricsData from '@/data/fabrics.json';

interface PanelProps {
  panel: PanelType;
  scale: number;
  isSelected?: boolean;
  isPreview?: boolean;
  onClick?: () => void;
}

// Kolory statusu
const statusColors: Record<PanelStatus, string> = {
  valid: 'stroke-emerald-500',
  warning: 'stroke-amber-500',
  error: 'stroke-red-500',
};

// Znajdz kolor hex dla colorId
function getColorHex(colorId: string): string {
  const paletteColor = fabricsData.defaultPalette.find((c) => c.id === colorId);
  return paletteColor?.hex ?? '#808080';
}

function PanelComponent({
  panel,
  scale,
  isSelected = false,
  isPreview = false,
  onClick,
}: PanelProps) {
  const colorHex = getColorHex(panel.colorId);
  const textColor = isLightColor(colorHex) ? '#1a1a1a' : '#ffffff';
  const opacity = isPreview ? 0.7 : 1;

  // Wymiary w jednostkach SVG (skalowane)
  const x = panel.x * scale;
  const y = panel.y * scale;
  const width = panel.width * scale;
  const height = panel.height * scale;

  // Wymiary do wyswietlenia
  const dimensionText = `${panel.width}x${panel.height}`;
  const fontSize = Math.min(width, height) * 0.15;

  return (
    <g
      onClick={onClick}
      className={`cursor-pointer transition-opacity ${onClick ? 'hover:opacity-90' : ''}`}
      style={{ opacity }}
    >
      {/* Wypelnienie panelu */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={colorHex}
        stroke={isSelected ? '#3b82f6' : isPreview ? '#10b981' : '#000'}
        strokeWidth={isSelected ? 3 : isPreview ? 2 : 1}
        strokeDasharray={isPreview ? '5,5' : undefined}
        rx={2}
        ry={2}
      />

      {/* Wymiary wewnatrz panelu */}
      {width > 30 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill={textColor}
          fontSize={fontSize}
          fontFamily="sans-serif"
          fontWeight="500"
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {dimensionText}
        </text>
      )}

      {/* Ramka statusu dla preview */}
      {isPreview && panel.status !== 'valid' && (
        <rect
          x={x - 2}
          y={y - 2}
          width={width + 4}
          height={height + 4}
          fill="none"
          className={statusColors[panel.status]}
          strokeWidth={3}
          rx={4}
          ry={4}
        />
      )}
    </g>
  );
}

export default memo(PanelComponent);
