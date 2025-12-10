// src/components/ui/Toolbar.tsx v0.008 Dwa przyciski gumki: panel i tkanina
'use client';

import { useRef, useCallback } from 'react';
import { useKreatorStore, useRecentSizes, useToolMode, useZoom, useCanvasLocked } from '@/store/useKreatorStore';
import { cn } from '@/lib/utils';

// Podpowiedzi dla przyciskow
const HINTS = {
  zoomOut: 'Pomniejsz widok (Ctrl + scroll w dół)',
  zoomIn: 'Powiększ widok (Ctrl + scroll w górę)',
  resetView: 'Resetuj widok do 100% i wyśrodkuj',
  lock: 'Zablokuj zoom i przesuwanie canvas',
  unlock: 'Odblokuj zoom i przesuwanie canvas',
  erasePanel: 'Gumka paneli - kliknij panel aby go usunąć',
  erasePanelOff: 'Wyłącz gumkę paneli',
  eraseFabric: 'Gumka tkanin - kliknij panel aby usunąć tkaninę',
  eraseFabricOff: 'Wyłącz gumkę tkanin',
  undo: 'Cofnij ostatnio dodany panel',
  clear: 'Usuń wszystkie panele z canvas',
  size: (w: number, h: number) => `Wybierz panel ${w}×${h} cm - kliknij na canvas aby umieścić`,
  help: 'Pokaż przewodnik po aplikacji',
};

export default function Toolbar() {
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const hintTimeout = useRef<NodeJS.Timeout | null>(null);

  const {
    activePanelSize,
    setActivePanelSize,
    undoLastPanel,
    clearPanels,
    panels,
    setToolMode,
    zoomIn,
    zoomOut,
    setZoom,
    resetPan,
    setCanvasLocked,
    setToolbarHint,
    startOnboarding,
  } = useKreatorStore();
  const recentSizes = useRecentSizes();
  const toolMode = useToolMode();
  const zoom = useZoom();
  const canvasLocked = useCanvasLocked();

  // Pokaz podpowiedz na chwile po akcji
  const showHintBriefly = useCallback((hint: string) => {
    setToolbarHint(hint);
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    hintTimeout.current = setTimeout(() => setToolbarHint(null), 2000);
  }, [setToolbarHint]);

  // Handlery hover (desktop)
  const onHover = useCallback((hint: string) => {
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    setToolbarHint(hint);
  }, [setToolbarHint]);

  const onLeave = useCallback(() => {
    if (hintTimeout.current) clearTimeout(hintTimeout.current);
    setToolbarHint(null);
  }, [setToolbarHint]);

  // Handlery touch (mobile) - long press
  const onTouchStart = useCallback((hint: string) => {
    longPressTimer.current = setTimeout(() => {
      setToolbarHint(hint);
    }, 500); // 500ms dla long press
  }, [setToolbarHint]);

  const onTouchEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleSizeClick = (width: number, height: number) => {
    // Toggle - jesli ten sam rozmiar, wylacz
    if (activePanelSize?.width === width && activePanelSize?.height === height) {
      setActivePanelSize(null);
      onLeave();
    } else {
      setActivePanelSize({ width, height });
      showHintBriefly(HINTS.size(width, height));
    }
  };

  const handleErasePanelClick = () => {
    const newMode = toolMode === 'erasePanel' ? 'select' : 'erasePanel';
    setToolMode(newMode);
    showHintBriefly(newMode === 'erasePanel' ? HINTS.erasePanel : HINTS.erasePanelOff);
  };

  const handleEraseFabricClick = () => {
    const newMode = toolMode === 'eraseFabric' ? 'select' : 'eraseFabric';
    setToolMode(newMode);
    showHintBriefly(newMode === 'eraseFabric' ? HINTS.eraseFabric : HINTS.eraseFabricOff);
  };

  const handleLockToggle = () => {
    const newLocked = !canvasLocked;
    setCanvasLocked(newLocked);
    showHintBriefly(newLocked ? HINTS.lock : HINTS.unlock);
  };

  const handleResetView = () => {
    setZoom(1);
    resetPan();
    showHintBriefly(HINTS.resetView);
  };

  const handleZoomIn = () => {
    zoomIn();
    showHintBriefly(HINTS.zoomIn);
  };

  const handleZoomOut = () => {
    zoomOut();
    showHintBriefly(HINTS.zoomOut);
  };

  const handleUndo = () => {
    undoLastPanel();
    showHintBriefly(HINTS.undo);
  };

  const handleClear = () => {
    if (panels.length > 0 && confirm('Czy na pewno chcesz usunąć wszystkie panele?')) {
      clearPanels();
      showHintBriefly(HINTS.clear);
    }
  };

  const handleHelp = () => {
    startOnboarding();
    showHintBriefly(HINTS.help);
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700">
      {/* Historia rozmiarow paneli */}
      <div className="flex flex-wrap gap-2" data-onboarding="toolbar">
        {recentSizes.map((size, index) => {
          const isActive =
            activePanelSize?.width === size.width &&
            activePanelSize?.height === size.height;
          const label = `${size.width}x${size.height}`;
          const hint = HINTS.size(size.width, size.height);

          return (
            <button
              key={`${label}-${index}`}
              onClick={() => handleSizeClick(size.width, size.height)}
              onMouseEnter={() => onHover(hint)}
              onMouseLeave={onLeave}
              onTouchStart={() => onTouchStart(hint)}
              onTouchEnd={onTouchEnd}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                'border border-slate-600 hover:border-cyan-500',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white border-transparent'
                  : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
              )}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-slate-600 mx-2 hidden sm:block" />

      {/* Kontrolki Zoom */}
      <div className="flex items-center gap-1">
        <button
          onClick={handleZoomOut}
          onMouseEnter={() => onHover(HINTS.zoomOut)}
          onMouseLeave={onLeave}
          onTouchStart={() => onTouchStart(HINTS.zoomOut)}
          onTouchEnd={onTouchEnd}
          disabled={canvasLocked}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-cyan-500',
            canvasLocked
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <span className="px-2 py-1 text-xs text-slate-300 min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={handleZoomIn}
          onMouseEnter={() => onHover(HINTS.zoomIn)}
          onMouseLeave={onLeave}
          onTouchStart={() => onTouchStart(HINTS.zoomIn)}
          onTouchEnd={onTouchEnd}
          disabled={canvasLocked}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-cyan-500',
            canvasLocked
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          onClick={handleResetView}
          onMouseEnter={() => onHover(HINTS.resetView)}
          onMouseLeave={onLeave}
          onTouchStart={() => onTouchStart(HINTS.resetView)}
          onTouchEnd={onTouchEnd}
          disabled={canvasLocked}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-cyan-500',
            canvasLocked
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        {/* Blokada canvas */}
        <button
          onClick={handleLockToggle}
          onMouseEnter={() => onHover(canvasLocked ? HINTS.unlock : HINTS.lock)}
          onMouseLeave={onLeave}
          onTouchStart={() => onTouchStart(canvasLocked ? HINTS.unlock : HINTS.lock)}
          onTouchEnd={onTouchEnd}
          className={cn(
            'p-2 rounded-lg transition-all border',
            canvasLocked
              ? 'bg-amber-600 border-amber-500 text-white'
              : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-amber-500'
          )}
        >
          {canvasLocked ? (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          )}
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-slate-600 mx-2 hidden sm:block" />

      {/* Akcje */}
      <div className="flex gap-2">
        {/* Gumka paneli */}
        <button
          onClick={handleErasePanelClick}
          onMouseEnter={() => onHover(toolMode === 'erasePanel' ? HINTS.erasePanelOff : HINTS.erasePanel)}
          onMouseLeave={onLeave}
          onTouchStart={() => onTouchStart(toolMode === 'erasePanel' ? HINTS.erasePanelOff : HINTS.erasePanel)}
          onTouchEnd={onTouchEnd}
          className={cn(
            'p-2 rounded-lg transition-all border relative',
            toolMode === 'erasePanel'
              ? 'bg-red-600 border-red-500 text-white'
              : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-red-500'
          )}
          title="Gumka paneli"
        >
          {/* Ikona panelu z X */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} strokeLinecap="round" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9l6 6m0-6l-6 6" />
          </svg>
        </button>

        {/* Gumka tkanin */}
        <button
          onClick={handleEraseFabricClick}
          onMouseEnter={() => onHover(toolMode === 'eraseFabric' ? HINTS.eraseFabricOff : HINTS.eraseFabric)}
          onMouseLeave={onLeave}
          onTouchStart={() => onTouchStart(toolMode === 'eraseFabric' ? HINTS.eraseFabricOff : HINTS.eraseFabric)}
          onTouchEnd={onTouchEnd}
          className={cn(
            'p-2 rounded-lg transition-all border relative',
            toolMode === 'eraseFabric'
              ? 'bg-orange-600 border-orange-500 text-white'
              : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-orange-500'
          )}
          title="Gumka tkanin"
        >
          {/* Ikona palety z X */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 7l-4 4" />
          </svg>
        </button>
      </div>

      {/* Separator */}
      <div className="w-px h-8 bg-slate-600 mx-2 hidden sm:block" />

      {/* Cofnij i Wyczysc */}
      <div className="flex gap-2">
        <button
          onClick={handleUndo}
          onMouseEnter={() => onHover(HINTS.undo)}
          onMouseLeave={onLeave}
          onTouchStart={() => onTouchStart(HINTS.undo)}
          onTouchEnd={onTouchEnd}
          disabled={panels.length === 0}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-amber-500',
            panels.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        {/* Wyczysc */}
        <button
          onClick={handleClear}
          onMouseEnter={() => onHover(HINTS.clear)}
          onMouseLeave={onLeave}
          onTouchStart={() => onTouchStart(HINTS.clear)}
          onTouchEnd={onTouchEnd}
          disabled={panels.length === 0}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-red-500',
            panels.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-red-900/50'
          )}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Licznik paneli */}
      {panels.length > 0 && (
        <div className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300">
          {panels.length} {panels.length === 1 ? 'panel' : 'paneli'}
        </div>
      )}

      {/* Przycisk pomocy */}
      <button
        onClick={handleHelp}
        onMouseEnter={() => onHover(HINTS.help)}
        onMouseLeave={onLeave}
        onTouchStart={() => onTouchStart(HINTS.help)}
        onTouchEnd={onTouchEnd}
        className={cn(
          'ml-auto p-2 rounded-lg transition-all',
          'border border-slate-600 hover:border-cyan-500',
          'bg-slate-700 text-slate-200 hover:bg-slate-600'
        )}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </div>
  );
}
