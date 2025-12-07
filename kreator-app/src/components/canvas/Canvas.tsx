// src/components/canvas/Canvas.tsx v0.003 Naprawiono obsluge dotyku - preventDefault + touch-canvas
'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { useKreatorStore, usePanels, usePreview, useWall, useZoom, useToolMode, useActiveColor } from '@/store/useKreatorStore';
import { findSnapPosition, checkCollisions, checkPanelFits } from '@/lib/geometry';
import WallComponent from './Wall';
import PanelComponent from './Panel';
import type { PanelStatus } from '@/types';

const SCALE = 2; // 1cm = 2px
const PADDING = 50; // px padding wokol sciany

export default function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Store
  const wall = useWall();
  const panels = usePanels();
  const preview = usePreview();
  const zoom = useZoom();
  const toolMode = useToolMode();
  const activeColorId = useActiveColor();

  const {
    setPreview,
    lockPreview,
    unlockPreview,
    addPanel,
    removePanel,
    updatePanel,
    activePanelSize,
  } = useKreatorStore();

  // Oblicz wymiary sciany
  const totalWidth = wall.segments.reduce((sum, seg) => sum + seg.width, 0);
  const maxHeight = Math.max(
    ...wall.segments.flatMap((seg) => [seg.startHeight, seg.endHeight])
  );

  // SVG viewBox
  const viewBoxWidth = totalWidth * SCALE + PADDING * 2;
  const viewBoxHeight = maxHeight * SCALE + PADDING * 2;

  // Konwertuj pozycje myszy na koordynaty sciany
  const getWallCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };

      const rect = svgRef.current.getBoundingClientRect();
      const svgX = (clientX - rect.left) * (viewBoxWidth / rect.width);
      const svgY = (clientY - rect.top) * (viewBoxHeight / rect.height);

      // Przeksztalc na koordynaty sciany (cm)
      const wallX = (svgX - PADDING) / SCALE;
      const wallY = (svgY - PADDING) / SCALE;

      return { x: wallX, y: wallY };
    },
    [viewBoxWidth, viewBoxHeight]
  );

  // Oblicz status preview
  const getPreviewStatus = useCallback(
    (x: number, y: number, width: number, height: number): PanelStatus => {
      const collision = checkCollisions({ x, y, width, height }, panels);
      if (collision.collides) return 'error';

      const fit = checkPanelFits({ x, y, width, height }, wall);
      if (!fit.fits) return 'error';
      if (fit.partiallyOutside) return 'warning';

      return 'valid';
    },
    [panels, wall]
  );

  // Ruch myszy
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!activePanelSize || preview.locked) return;

      const coords = getWallCoords(e.clientX, e.clientY);
      setMousePos(coords);

      // Snap
      const snapped = findSnapPosition(
        coords.x,
        coords.y,
        preview.width,
        preview.height,
        panels,
        wall
      );

      // Status
      const status = getPreviewStatus(
        snapped.x,
        snapped.y,
        preview.width,
        preview.height
      );

      setPreview({
        x: snapped.x,
        y: snapped.y,
        status,
        visible: true,
      });
    },
    [activePanelSize, preview.locked, preview.width, preview.height, panels, wall, getWallCoords, getPreviewStatus, setPreview]
  );

  // Klik na canvas
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      // Tryb gumki - nie robimy nic (obslugiwane przez panel)
      if (toolMode === 'erase') return;

      // Jesli jest aktywny rozmiar panelu
      if (activePanelSize && preview.visible) {
        if (preview.locked) {
          if (preview.status === 'error') {
            // Klik gdy locked + error = odblokuj (anuluj)
            unlockPreview();
          } else {
            // Klik gdy locked + valid/warning = dodaj panel
            addPanel({
              x: preview.x,
              y: preview.y,
              width: preview.width,
              height: preview.height,
              colorId: activeColorId,
            });
            // Odblokuj po dodaniu zeby mozna bylo dodac nastepny
            unlockPreview();
          }
        } else {
          // Pierwszy klik = lock preview (tylko jesli nie error)
          if (preview.status !== 'error') {
            lockPreview();
          }
        }
      }
    },
    [toolMode, activePanelSize, preview, activeColorId, addPanel, lockPreview, unlockPreview]
  );

  // Escape = anuluj/odblokuj
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && preview.locked) {
        unlockPreview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [preview.locked, unlockPreview]);

  // Klik na panel
  const handlePanelClick = useCallback(
    (panelId: string) => {
      if (toolMode === 'erase') {
        removePanel(panelId);
      } else if (toolMode === 'paint') {
        updatePanel(panelId, { colorId: activeColorId });
      }
    },
    [toolMode, activeColorId, removePanel, updatePanel]
  );

  // Touch events
  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      // Zapobiegaj domyslnemu scrollowaniu strony
      e.preventDefault();
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      // Zapobiegaj domyslnemu scrollowaniu strony
      e.preventDefault();
      if (e.touches.length !== 1) return;
      const touch = e.touches[0];
      handleMouseMove({
        clientX: touch.clientX,
        clientY: touch.clientY,
      } as React.MouseEvent);
    },
    [handleMouseMove]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      // Zapobiegaj domyslnemu zachowaniu
      e.preventDefault();
      handleClick({} as React.MouseEvent);
    },
    [handleClick]
  );

  return (
    <div className="relative w-full h-full overflow-auto bg-slate-900 rounded-xl">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full min-h-[400px] touch-canvas"
        style={{ transform: `scale(${zoom})`, transformOrigin: 'center' }}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Tlo */}
        <rect
          x={0}
          y={0}
          width={viewBoxWidth}
          height={viewBoxHeight}
          fill="transparent"
        />

        {/* Grupa z transformacja (padding) */}
        <g transform={`translate(${PADDING}, ${PADDING})`}>
          {/* Sciana */}
          <WallComponent wall={wall} scale={SCALE} />

          {/* Panele */}
          {panels.map((panel) => (
            <PanelComponent
              key={panel.id}
              panel={panel}
              scale={SCALE}
              onClick={() => handlePanelClick(panel.id)}
            />
          ))}

          {/* Preview */}
          {preview.visible && activePanelSize && (
            <PanelComponent
              panel={{
                id: 'preview',
                ...preview,
              }}
              scale={SCALE}
              isPreview={true}
            />
          )}
        </g>
      </svg>

      {/* Wskazowka dla uzytkownika */}
      {activePanelSize && !preview.locked && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
          Kliknij aby umiescic panel {preview.width}x{preview.height}
        </div>
      )}

      {activePanelSize && preview.locked && preview.status !== 'error' && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-emerald-600/90 text-white px-4 py-2 rounded-full text-sm">
          Kliknij ponownie aby dodac panel
        </div>
      )}

      {preview.status === 'error' && preview.visible && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-4 py-2 rounded-full text-sm">
          Nie mozna umiescic panelu w tym miejscu
        </div>
      )}

      {preview.status === 'warning' && preview.visible && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-amber-600/90 text-white px-4 py-2 rounded-full text-sm">
          Panel czesciowo poza obszarem
        </div>
      )}
    </div>
  );
}
