// src/components/canvas/Panel.tsx v0.003 Dodano onTouchEnd i isDragging dla mobile
'use client';

import { memo, useMemo } from 'react';
import type { Panel as PanelType, PanelStatus } from '@/types';
import { isLightColor } from '@/lib/utils';
import fabricsData from '@/data/fabrics.json';

interface PanelProps {
  panel: PanelType;
  scale: number;
  isSelected?: boolean;
  isPreview?: boolean;
  isDragging?: boolean;
  onClick?: () => void;
  onTouchEnd?: () => void;
}

// Kolory statusu
const statusColors: Record<PanelStatus, string> = {
  valid: 'stroke-emerald-500',
  warning: 'stroke-amber-500',
  error: 'stroke-red-500',
};

interface FabricColor {
  id: string;
  name: string;
  image: string | null;
}

interface FabricCollection {
  category: string;
  colors: FabricColor[];
}

interface DefaultPaletteColor {
  id: string;
  name: string;
  hex: string;
}

type ColorInfo = {
  type: 'hex' | 'image';
  value: string; // hex color lub image URL
  name: string;
};

// Znajdz informacje o kolorze/tkaninie
function getColorInfo(colorId: string): ColorInfo {
  // 1. Sprawdz defaultPalette (kolory hex)
  const paletteColor = (fabricsData.defaultPalette as DefaultPaletteColor[]).find(
    (c) => c.id === colorId
  );
  if (paletteColor) {
    return { type: 'hex', value: paletteColor.hex, name: paletteColor.name };
  }

  // 2. Sprawdz kolekcje tkanin (obrazki)
  const collections = fabricsData.collections as Record<string, FabricCollection>;
  for (const [, collection] of Object.entries(collections)) {
    const fabricColor = collection.colors.find((c) => c.id === colorId);
    if (fabricColor) {
      if (fabricColor.image) {
        return { type: 'image', value: fabricColor.image, name: fabricColor.name };
      }
      // Tkanina bez obrazka - szary fallback
      return { type: 'hex', value: '#808080', name: fabricColor.name };
    }
  }

  // 3. Fallback - szary
  return { type: 'hex', value: '#808080', name: 'Brak koloru' };
}

function PanelComponent({
  panel,
  scale,
  isSelected = false,
  isPreview = false,
  isDragging = false,
  onClick,
  onTouchEnd,
}: PanelProps) {
  const colorInfo = useMemo(() => getColorInfo(panel.colorId), [panel.colorId]);

  // Dla obrazkow tekst zawsze bialy z cieniem, dla hex - dynamiczny
  const textColor = colorInfo.type === 'image'
    ? '#ffffff'
    : isLightColor(colorInfo.value) ? '#1a1a1a' : '#ffffff';
  const textShadow = colorInfo.type === 'image' ? '0 1px 2px rgba(0,0,0,0.8)' : 'none';

  const opacity = isPreview ? 0.7 : 1;

  // Wymiary w jednostkach SVG (skalowane)
  const x = panel.x * scale;
  const y = panel.y * scale;
  const width = panel.width * scale;
  const height = panel.height * scale;

  // Wymiary do wyswietlenia
  const dimensionText = `${panel.width}x${panel.height}`;
  const fontSize = Math.min(width, height) * 0.15;

  // Unikalny ID dla patternu obrazka
  const patternId = `fabric-${panel.id}`;

  // Obsługa touch end (dla gumki na mobile)
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (onTouchEnd) {
      e.stopPropagation();
      onTouchEnd();
    }
  };

  return (
    <g
      onClick={onClick}
      onTouchEnd={handleTouchEnd}
      className={`cursor-pointer transition-opacity ${onClick ? 'hover:opacity-90' : ''}`}
      style={{
        opacity,
        filter: isDragging ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))' : 'none',
      }}
    >
      {/* Definicja patternu dla obrazka tkaniny */}
      {colorInfo.type === 'image' && (
        <defs>
          <pattern
            id={patternId}
            patternUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <image
              href={colorInfo.value}
              width={width}
              height={height}
              preserveAspectRatio="xMidYMid slice"
            />
          </pattern>
        </defs>
      )}

      {/* Wypelnienie panelu */}
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={colorInfo.type === 'image' ? `url(#${patternId})` : colorInfo.value}
        stroke={isSelected ? '#3b82f6' : isDragging ? '#06b6d4' : isPreview ? '#10b981' : '#000'}
        strokeWidth={isSelected ? 3 : isDragging ? 3 : isPreview ? 2 : 1}
        strokeDasharray={isPreview && !isDragging ? '5,5' : undefined}
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
          fontWeight="600"
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
            textShadow,
          }}
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
