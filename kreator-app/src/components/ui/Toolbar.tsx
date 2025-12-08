// src/components/ui/Toolbar.tsx v0.005 Usunieto przycisk Projekty (przeniesiony do Sidebar)
'use client';

import { useKreatorStore, useRecentSizes, useToolMode, useZoom, useCanvasLocked } from '@/store/useKreatorStore';
import { cn } from '@/lib/utils';

export default function Toolbar() {
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
  } = useKreatorStore();
  const recentSizes = useRecentSizes();
  const toolMode = useToolMode();
  const zoom = useZoom();
  const canvasLocked = useCanvasLocked();

  const handleSizeClick = (width: number, height: number) => {
    // Toggle - jesli ten sam rozmiar, wylacz
    if (activePanelSize?.width === width && activePanelSize?.height === height) {
      setActivePanelSize(null);
    } else {
      setActivePanelSize({ width, height });
    }
  };

  const handleEraserClick = () => {
    setToolMode(toolMode === 'erase' ? 'select' : 'erase');
  };

  const handleLockToggle = () => {
    setCanvasLocked(!canvasLocked);
  };

  const handleResetView = () => {
    setZoom(1);
    resetPan();
  };

  return (
    <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-800/80 backdrop-blur-md rounded-xl border border-slate-700">
      {/* Historia rozmiarow paneli */}
      <div className="flex flex-wrap gap-2">
        {recentSizes.map((size, index) => {
          const isActive =
            activePanelSize?.width === size.width &&
            activePanelSize?.height === size.height;
          const label = `${size.width}x${size.height}`;

          return (
            <button
              key={`${label}-${index}`}
              onClick={() => handleSizeClick(size.width, size.height)}
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
          onClick={zoomOut}
          disabled={canvasLocked}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-cyan-500',
            canvasLocked
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
          title="Pomniejsz (Ctrl + scroll)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>

        <span className="px-2 py-1 text-xs text-slate-300 min-w-[50px] text-center">
          {Math.round(zoom * 100)}%
        </span>

        <button
          onClick={zoomIn}
          disabled={canvasLocked}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-cyan-500',
            canvasLocked
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
          title="Powieksz (Ctrl + scroll)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          onClick={handleResetView}
          disabled={canvasLocked}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-cyan-500',
            canvasLocked
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
          title="Resetuj widok"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
        </button>

        {/* Blokada canvas */}
        <button
          onClick={handleLockToggle}
          className={cn(
            'p-2 rounded-lg transition-all border',
            canvasLocked
              ? 'bg-amber-600 border-amber-500 text-white'
              : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-amber-500'
          )}
          title={canvasLocked ? 'Odblokuj zoom/pan' : 'Zablokuj zoom/pan'}
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
        {/* Gumka - nowa ikona */}
        <button
          onClick={handleEraserClick}
          className={cn(
            'p-2 rounded-lg transition-all border',
            toolMode === 'erase'
              ? 'bg-red-600 border-red-500 text-white'
              : 'bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:border-red-500'
          )}
          title="Gumka - dotknij panel aby go usunac"
        >
          {/* Ikona gumki (eraser) */}
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"
            />
          </svg>
        </button>

        {/* Cofnij */}
        <button
          onClick={undoLastPanel}
          disabled={panels.length === 0}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-amber-500',
            panels.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
          )}
          title="Cofnij ostatni panel"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
        </button>

        {/* Wyczysc */}
        <button
          onClick={() => {
            if (panels.length > 0 && confirm('Czy na pewno chcesz usunac wszystkie panele?')) {
              clearPanels();
            }
          }}
          disabled={panels.length === 0}
          className={cn(
            'p-2 rounded-lg transition-all',
            'border border-slate-600 hover:border-red-500',
            panels.length === 0
              ? 'opacity-50 cursor-not-allowed'
              : 'bg-slate-700 text-slate-200 hover:bg-red-900/50'
          )}
          title="Wyczysc wszystkie panele"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {/* Licznik paneli */}
      {panels.length > 0 && (
        <div className="ml-auto px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300">
          {panels.length} {panels.length === 1 ? 'panel' : 'paneli'}
        </div>
      )}
    </div>
  );
}
