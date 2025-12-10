// src/components/canvas/Canvas.tsx v0.010 Oba widoki jednoczesnie (frontalny + rzut z gory ponizej)
'use client';

import { useRef, useState, useCallback, useEffect, useMemo } from 'react';
import { useKreatorStore, usePanels, usePreview, useWall, useZoom, usePan, useCanvasLocked, useToolMode, useActiveColor, useToolbarHint, useCanvasColor } from '@/store/useKreatorStore';
import { findSnapPosition, checkCollisions, checkPanelFits, calculatePanelClipPath } from '@/lib/geometry';
import WallComponent from './Wall';
import PanelComponent from './Panel';
import TopView from './TopView';
import { cn } from '@/lib/utils';
import type { PanelStatus, ClipPathResult } from '@/types';

const SCALE = 2; // 1cm = 2px
const PADDING = 50; // px padding wokol sciany

export default function Canvas() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Store
  const wall = useWall();
  const panels = usePanels();
  const preview = usePreview();
  const zoom = useZoom();
  const pan = usePan();
  const canvasLocked = useCanvasLocked();
  const toolMode = useToolMode();
  const activeColorId = useActiveColor();
  const toolbarHint = useToolbarHint();
  const canvasColor = useCanvasColor();

  const {
    setPreview,
    lockPreview,
    unlockPreview,
    startDragging,
    stopDragging,
    addPanel,
    removePanel,
    updatePanel,
    activePanelSize,
    setZoom,
    setPan,
    zoomIn,
    zoomOut,
  } = useKreatorStore();

  // Oblicz wymiary sciany
  const totalWidth = wall.segments.reduce((sum, seg) => sum + seg.width, 0);
  const maxHeight = Math.max(
    ...wall.segments.flatMap((seg) => [seg.startHeight, seg.endHeight])
  );

  // SVG viewBox - dodatkowe miejsce na widok z gory
  const TOP_VIEW_HEIGHT = 150; // wysokosc na widok z gory
  const viewBoxWidth = totalWidth * SCALE + PADDING * 2;
  const viewBoxHeight = maxHeight * SCALE + PADDING * 2 + TOP_VIEW_HEIGHT;

  // Oblicz clip paths dla wszystkich paneli (dla skosow)
  const panelClipPaths = useMemo(() => {
    const clipMap: Record<string, ClipPathResult> = {};
    for (const panel of panels) {
      clipMap[panel.id] = calculatePanelClipPath(panel, wall);
    }
    return clipMap;
  }, [panels, wall]);

  // Oblicz clip path dla preview
  const previewClipPath = useMemo(() => {
    if (!preview.visible || !activePanelSize) return null;
    return calculatePanelClipPath(
      { x: preview.x, y: preview.y, width: preview.width, height: preview.height },
      wall
    );
  }, [preview.visible, preview.x, preview.y, preview.width, preview.height, activePanelSize, wall]);

  // Konwertuj pozycje myszy na koordynaty sciany
  const getWallCoords = useCallback(
    (clientX: number, clientY: number) => {
      if (!svgRef.current) return { x: 0, y: 0 };

      const rect = svgRef.current.getBoundingClientRect();
      const svgX = (clientX - rect.left) * (viewBoxWidth / rect.width);
      const svgY = (clientY - rect.top) * (viewBoxHeight / rect.height);

      // Przeksztalc na koordynaty sciany (cm) z uwzglednieniem pan
      const wallX = (svgX - PADDING - pan.x) / SCALE;
      const wallY = (svgY - PADDING - pan.y) / SCALE;

      return { x: wallX, y: wallY };
    },
    [viewBoxWidth, viewBoxHeight, pan]
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

  // Aktualizuj pozycje preview
  const updatePreviewPosition = useCallback(
    (clientX: number, clientY: number) => {
      if (!activePanelSize) return;

      const coords = getWallCoords(clientX, clientY);

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
    [activePanelSize, preview.width, preview.height, panels, wall, getWallCoords, getPreviewStatus, setPreview]
  );

  // ========== MOUSE EVENTS ==========

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Prawy przycisk lub srodkowy = pan
      if (e.button === 1 || e.button === 2) {
        if (!canvasLocked) {
          e.preventDefault();
          setIsPanning(true);
          setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
        }
        return;
      }

      // Lewy przycisk
      if (e.button === 0) {
        // Tryb gumki - nic nie robimy (obslugiwane przez panel)
        if (toolMode === 'erase') return;

        // Jesli jest aktywny rozmiar panelu i preview widoczny
        if (activePanelSize && preview.visible) {
          // Jesli preview jest zablokowany (upuszczony) i klikamy POZA nim
          if (preview.locked) {
            // Sprawdz czy klik jest na preview
            const coords = getWallCoords(e.clientX, e.clientY);
            const isOnPreview =
              coords.x >= preview.x &&
              coords.x <= preview.x + preview.width &&
              coords.y >= preview.y &&
              coords.y <= preview.y + preview.height;

            if (isOnPreview) {
              // Klik NA preview = zacznij przeciagac
              startDragging();
            } else {
              // Klik POZA preview = dodaj panel (jesli valid/warning)
              if (preview.status !== 'error') {
                addPanel({
                  x: preview.x,
                  y: preview.y,
                  width: preview.width,
                  height: preview.height,
                  colorId: activeColorId,
                });
              }
              unlockPreview();
            }
          } else if (preview.isDragging) {
            // Pusc podczas przeciagania = zablokuj
            stopDragging();
          } else {
            // Pierwszy klik = zacznij przeciagac (od razu)
            if (preview.status !== 'error') {
              startDragging();
            }
          }
        }
      }
    },
    [canvasLocked, toolMode, activePanelSize, preview, activeColorId, pan, getWallCoords, startDragging, stopDragging, addPanel, unlockPreview]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      // Pan
      if (isPanning && !canvasLocked) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
        return;
      }

      // Aktualizuj preview tylko gdy przeciagamy lub nie jest zablokowany
      if (activePanelSize && (preview.isDragging || !preview.locked)) {
        updatePreviewPosition(e.clientX, e.clientY);
      }
    },
    [isPanning, canvasLocked, panStart, activePanelSize, preview.isDragging, preview.locked, setPan, updatePreviewPosition]
  );

  const handleMouseUp = useCallback(
    (e: React.MouseEvent) => {
      // Koniec pan
      if (isPanning) {
        setIsPanning(false);
        return;
      }

      // Jesli przeciagamy preview, upusc go
      if (preview.isDragging) {
        stopDragging();
      }
    },
    [isPanning, preview.isDragging, stopDragging]
  );

  // ========== TOUCH EVENTS ==========

  const handleTouchStart = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2 && !canvasLocked) {
        // Dwa palce = rozpocznij pan
        const touch = e.touches[0];
        setIsPanning(true);
        setPanStart({ x: touch.clientX - pan.x, y: touch.clientY - pan.y });
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];

        // Tryb gumki - obslugiwane przez panel
        if (toolMode === 'erase') return;

        // Logika analogiczna do mouseDown
        if (activePanelSize && preview.visible) {
          if (preview.locked) {
            const coords = getWallCoords(touch.clientX, touch.clientY);
            const isOnPreview =
              coords.x >= preview.x &&
              coords.x <= preview.x + preview.width &&
              coords.y >= preview.y &&
              coords.y <= preview.y + preview.height;

            if (isOnPreview) {
              startDragging();
            } else {
              if (preview.status !== 'error') {
                addPanel({
                  x: preview.x,
                  y: preview.y,
                  width: preview.width,
                  height: preview.height,
                  colorId: activeColorId,
                });
              }
              unlockPreview();
            }
          } else if (!preview.isDragging) {
            if (preview.status !== 'error') {
              startDragging();
            }
          }
        }
      }
    },
    [canvasLocked, toolMode, activePanelSize, preview, activeColorId, pan, getWallCoords, startDragging, addPanel, unlockPreview]
  );

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (e.touches.length === 2 && isPanning && !canvasLocked) {
        const touch = e.touches[0];
        setPan({
          x: touch.clientX - panStart.x,
          y: touch.clientY - panStart.y,
        });
        return;
      }

      if (e.touches.length === 1) {
        const touch = e.touches[0];

        if (isPanning && !canvasLocked) {
          setPan({
            x: touch.clientX - panStart.x,
            y: touch.clientY - panStart.y,
          });
          return;
        }

        // Aktualizuj preview
        if (activePanelSize && (preview.isDragging || !preview.locked)) {
          updatePreviewPosition(touch.clientX, touch.clientY);
        }
      }
    },
    [isPanning, canvasLocked, panStart, activePanelSize, preview.isDragging, preview.locked, setPan, updatePreviewPosition]
  );

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      e.preventDefault();

      if (isPanning) {
        setIsPanning(false);
        return;
      }

      // Jesli przeciagamy preview, upusc go
      if (preview.isDragging) {
        stopDragging();
      }
    },
    [isPanning, preview.isDragging, stopDragging]
  );

  // ========== WHEEL (ZOOM) ==========

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (canvasLocked) return;

      e.preventDefault();

      // Ctrl + wheel = zoom
      if (e.ctrlKey || e.metaKey) {
        if (e.deltaY < 0) {
          zoomIn();
        } else {
          zoomOut();
        }
      } else {
        // Wheel bez ctrl = pan
        setPan({
          x: pan.x - e.deltaX,
          y: pan.y - e.deltaY,
        });
      }
    },
    [canvasLocked, pan, setPan, zoomIn, zoomOut]
  );

  // ========== KEYBOARD ==========

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (preview.isDragging || preview.locked) {
          unlockPreview();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [preview.isDragging, preview.locked, unlockPreview]);

  // ========== PANEL CLICK (GUMKA/PAINT) ==========

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

  // Disable context menu on canvas
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  // ========== RENDER ==========

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-xl"
      style={{ backgroundColor: canvasColor }}
      onContextMenu={handleContextMenu}
      data-onboarding="canvas"
    >
      <svg
        ref={svgRef}
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full h-full min-h-[400px] touch-canvas"
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: 'center',
          cursor: isPanning ? 'grabbing' : (activePanelSize ? 'crosshair' : 'default'),
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onWheel={handleWheel}
      >
        {/* Tlo */}
        <rect
          x={0}
          y={0}
          width={viewBoxWidth}
          height={viewBoxHeight}
          fill="transparent"
        />

        {/* Grupa z transformacja (padding + pan) */}
        <g transform={`translate(${PADDING + pan.x}, ${PADDING + pan.y})`}>
          {/* Widok frontalny */}
          <WallComponent wall={wall} scale={SCALE} />

          {/* Panele */}
          {panels.map((panel) => {
            const clipData = panelClipPaths[panel.id];
            return (
              <PanelComponent
                key={panel.id}
                panel={panel}
                scale={SCALE}
                onClick={() => handlePanelClick(panel.id)}
                onTouchEnd={() => handlePanelClick(panel.id)}
                clipPoints={clipData?.clipPoints}
                wastePoints={clipData?.wastePoints}
                showWaste={clipData?.hasClip}
              />
            );
          })}

          {/* Preview */}
          {preview.visible && activePanelSize && (
            <PanelComponent
              panel={{
                id: 'preview',
                ...preview,
              }}
              scale={SCALE}
              isPreview={true}
              isDragging={preview.isDragging}
              clipPoints={previewClipPath?.clipPoints}
              wastePoints={previewClipPath?.wastePoints}
              showWaste={previewClipPath?.hasClip}
            />
          )}

          {/* Widok z gory - ponizej widoku frontalnego */}
          <g transform={`translate(0, ${maxHeight * SCALE + 50})`}>
            <TopView
              wall={wall}
              scale={SCALE}
              totalWidth={totalWidth}
              alignToFrontal={true}
            />
          </g>
        </g>
      </svg>

      {/* Wskazowki dla uzytkownika */}
      {activePanelSize && !preview.locked && !preview.isDragging && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
          Dotknij aby umiescic panel {preview.width}x{preview.height}
        </div>
      )}

      {activePanelSize && preview.isDragging && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-cyan-600/90 text-white px-4 py-2 rounded-full text-sm">
          Przesun panel i pusc
        </div>
      )}

      {activePanelSize && preview.locked && !preview.isDragging && preview.status !== 'error' && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-emerald-600/90 text-white px-4 py-2 rounded-full text-sm">
          Dotknij panel aby przesunac lub dotknij poza nim aby dodac
        </div>
      )}

      {preview.status === 'error' && preview.visible && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-4 py-2 rounded-full text-sm">
          Nie mozna umiescic panelu w tym miejscu
        </div>
      )}

      {preview.status === 'warning' && preview.visible && !preview.isDragging && preview.locked && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-amber-600/90 text-white px-4 py-2 rounded-full text-sm">
          Panel czesciowo poza obszarem - dotknij poza nim aby dodac
        </div>
      )}

      {toolMode === 'erase' && !toolbarHint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-600/90 text-white px-4 py-2 rounded-full text-sm">
          Tryb gumki - dotknij panel aby go usunac
        </div>
      )}

      {toolbarHint && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-700/95 text-white px-4 py-2 rounded-full text-sm border border-slate-500 shadow-lg">
          {toolbarHint}
        </div>
      )}
    </div>
  );
}
