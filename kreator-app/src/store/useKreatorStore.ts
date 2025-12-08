// src/store/useKreatorStore.ts v0.004 Dodano pan, canvasLocked, isDragging

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  KreatorState,
  KreatorActions,
  WallSegment,
  Panel,
  PanelPreview,
  Dimensions,
  Position,
  ToolMode,
  ViewMode,
  Addons,
  PriceSummary,
} from '@/types';
import { generateId } from '@/lib/utils';
import { calculatePriceSummary } from '@/lib/pricing';

// Domyslne rozmiary paneli
const DEFAULT_SIZES: Dimensions[] = [
  { width: 30, height: 100 },
  { width: 20, height: 100 },
  { width: 30, height: 60 },
  { width: 40, height: 60 },
  { width: 20, height: 140 },
  { width: 15, height: 100 },
];

// Stan poczatkowy
const initialState: KreatorState = {
  wall: {
    segments: [
      {
        id: 'seg-1',
        width: 200,
        startHeight: 250,
        endHeight: 250,
        angle: 180,
        alignment: 'bottom',
      },
    ],
    masterSegmentId: 'seg-1',
  },

  panels: [],
  selectedPanelId: null,

  preview: {
    x: 0,
    y: 0,
    width: 30,
    height: 100,
    colorId: 'color-gray',
    status: 'valid',
    visible: false,
    locked: false,
    isDragging: false,
  },
  activePanelSize: null,
  recentSizes: DEFAULT_SIZES,

  toolMode: 'select',
  activeColorId: 'color-gray',

  viewMode: 'frontal',
  zoom: 1,
  pan: { x: 0, y: 0 },
  canvasLocked: false,

  addons: {
    doubleFoam: false,
    velcro: true,
    socketHoles: 0,
    glueCount: 0,
  },
  colorToFabricMapping: {},

  priceSummary: null,
};

// Store
type KreatorStore = KreatorState & KreatorActions;

export const useKreatorStore = create<KreatorStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========== SCIANA ==========

      addSegment: (segment) => {
        const newSegment: WallSegment = {
          ...segment,
          id: generateId('seg'),
        };
        set((state) => ({
          wall: {
            ...state.wall,
            segments: [...state.wall.segments, newSegment],
          },
        }));
        console.log('[Store] Dodano segment:', newSegment.id);
      },

      removeSegment: (id) => {
        set((state) => {
          const newSegments = state.wall.segments.filter((s) => s.id !== id);
          const newMasterId =
            state.wall.masterSegmentId === id
              ? newSegments[0]?.id ?? null
              : state.wall.masterSegmentId;
          return {
            wall: {
              ...state.wall,
              segments: newSegments,
              masterSegmentId: newMasterId,
            },
          };
        });
        console.log('[Store] Usunieto segment:', id);
      },

      updateSegment: (id, updates) => {
        console.log('[Store] updateSegment:', id, updates);
        set((state) => {
          // Jesli zmieniane jest alignment, zastosuj do wszystkich segmentow
          if ('alignment' in updates && updates.alignment) {
            const newAlignment = updates.alignment;
            return {
              wall: {
                ...state.wall,
                segments: state.wall.segments.map((s) => ({
                  ...s,
                  ...(s.id === id ? updates : {}),
                  alignment: newAlignment, // Zastosuj alignment do wszystkich
                })),
              },
            };
          }
          // Standardowa aktualizacja pojedynczego segmentu
          return {
            wall: {
              ...state.wall,
              segments: state.wall.segments.map((s) =>
                s.id === id ? { ...s, ...updates } : s
              ),
            },
          };
        });
      },

      setMasterSegment: (id) => {
        set((state) => ({
          wall: { ...state.wall, masterSegmentId: id },
        }));
        console.log('[Store] Master segment:', id);
      },

      // ========== PANELE ==========

      addPanel: (panel) => {
        const newPanel: Panel = {
          ...panel,
          id: generateId('panel'),
          status: 'valid',
        };
        set((state) => ({
          panels: [...state.panels, newPanel],
          preview: { ...state.preview, visible: false, locked: false },
        }));
        get().recalculatePrice();
        console.log('[Store] Dodano panel:', newPanel.id);
      },

      removePanel: (id) => {
        set((state) => ({
          panels: state.panels.filter((p) => p.id !== id),
          selectedPanelId:
            state.selectedPanelId === id ? null : state.selectedPanelId,
        }));
        get().recalculatePrice();
        console.log('[Store] Usunieto panel:', id);
      },

      updatePanel: (id, updates) => {
        set((state) => ({
          panels: state.panels.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
        }));
        get().recalculatePrice();
      },

      clearPanels: () => {
        set({ panels: [], selectedPanelId: null });
        get().recalculatePrice();
        console.log('[Store] Wyczyszczono wszystkie panele');
      },

      undoLastPanel: () => {
        set((state) => ({
          panels: state.panels.slice(0, -1),
        }));
        get().recalculatePrice();
        console.log('[Store] Cofnieto ostatni panel');
      },

      // ========== PREVIEW ==========

      setPreview: (preview) => {
        set((state) => ({
          preview: { ...state.preview, ...preview },
        }));
      },

      setActivePanelSize: (size) => {
        set((state) => {
          // Dodaj do historii (jesli nowy rozmiar)
          let newRecentSizes = state.recentSizes;
          if (size) {
            const exists = state.recentSizes.some(
              (s) => s.width === size.width && s.height === size.height
            );
            if (!exists) {
              // Dodaj na poczatek, ogranicz do 6
              newRecentSizes = [size, ...state.recentSizes.slice(0, 5)];
            } else {
              // Przesun na poczatek
              newRecentSizes = [
                size,
                ...state.recentSizes.filter(
                  (s) => !(s.width === size.width && s.height === size.height)
                ),
              ].slice(0, 6);
            }
          }

          return {
            activePanelSize: size,
            recentSizes: newRecentSizes,
            preview: size
              ? {
                  ...state.preview,
                  width: size.width,
                  height: size.height,
                  visible: true,
                  locked: false,
                }
              : { ...state.preview, visible: false },
          };
        });
      },

      lockPreview: () => {
        set((state) => ({
          preview: { ...state.preview, locked: true, isDragging: false },
        }));
      },

      unlockPreview: () => {
        set((state) => ({
          preview: { ...state.preview, locked: false, isDragging: false },
        }));
      },

      startDragging: () => {
        set((state) => ({
          preview: { ...state.preview, isDragging: true, locked: false },
        }));
      },

      stopDragging: () => {
        set((state) => ({
          preview: { ...state.preview, isDragging: false, locked: true },
        }));
      },

      // ========== NARZEDZIA ==========

      setToolMode: (mode) => {
        set({ toolMode: mode });
        console.log('[Store] Tryb narzedzia:', mode);
      },

      setActiveColor: (colorId) => {
        set((state) => ({
          activeColorId: colorId,
          preview: { ...state.preview, colorId },
        }));
      },

      // ========== WIDOK ==========

      setViewMode: (mode) => {
        set({ viewMode: mode });
      },

      setZoom: (zoom) => {
        set({ zoom: Math.max(0.5, Math.min(2, zoom)) });
      },

      zoomIn: () => {
        set((state) => ({ zoom: Math.min(2, state.zoom + 0.1) }));
      },

      zoomOut: () => {
        set((state) => ({ zoom: Math.max(0.5, state.zoom - 0.1) }));
      },

      setPan: (pan) => {
        set({ pan });
      },

      resetPan: () => {
        set({ pan: { x: 0, y: 0 } });
      },

      setCanvasLocked: (locked) => {
        set({ canvasLocked: locked });
        console.log('[Store] Canvas locked:', locked);
      },

      // ========== KONFIGURACJA ==========

      setAddons: (addons) => {
        set((state) => ({
          addons: { ...state.addons, ...addons },
        }));
        get().recalculatePrice();
      },

      mapColorToFabric: (colorId, fabricId) => {
        set((state) => ({
          colorToFabricMapping: {
            ...state.colorToFabricMapping,
            [colorId]: fabricId,
          },
        }));
        get().recalculatePrice();
      },

      // ========== WYCENA ==========

      recalculatePrice: () => {
        const state = get();
        const summary = calculatePriceSummary(
          state.panels,
          state.addons,
          state.colorToFabricMapping
        );
        set({ priceSummary: summary });
      },

      // ========== PROJEKT ==========

      saveProject: () => {
        const state = get();
        const projectData = {
          wall: state.wall,
          panels: state.panels,
          addons: state.addons,
          colorToFabricMapping: state.colorToFabricMapping,
          savedAt: new Date().toISOString(),
        };
        // Persist automatycznie zapisuje do localStorage
        console.log('[Store] Projekt zapisany');
      },

      loadProject: (projectId) => {
        // TODO: Implementacja wczytywania z localStorage
        console.log('[Store] Wczytywanie projektu:', projectId);
      },

      resetProject: () => {
        set(initialState);
        console.log('[Store] Projekt zresetowany');
      },
    }),
    {
      name: 'kreator-storage',
      partialize: (state) => ({
        wall: state.wall,
        panels: state.panels,
        addons: state.addons,
        colorToFabricMapping: state.colorToFabricMapping,
        recentSizes: state.recentSizes,
      }),
      // Migracja: dodaj alignment do segmentow jesli brakuje
      onRehydrateStorage: () => (state) => {
        if (state?.wall?.segments) {
          state.wall.segments = state.wall.segments.map((seg) => ({
            ...seg,
            alignment: seg.alignment ?? 'bottom',
          }));
        }
      },
    }
  )
);

// Selektory dla wydajnosci
export const useWall = () => useKreatorStore((state) => state.wall);
export const usePanels = () => useKreatorStore((state) => state.panels);
export const usePreview = () => useKreatorStore((state) => state.preview);
export const useToolMode = () => useKreatorStore((state) => state.toolMode);
export const useActiveColor = () => useKreatorStore((state) => state.activeColorId);
export const useZoom = () => useKreatorStore((state) => state.zoom);
export const usePan = () => useKreatorStore((state) => state.pan);
export const useCanvasLocked = () => useKreatorStore((state) => state.canvasLocked);
export const usePriceSummary = () => useKreatorStore((state) => state.priceSummary);
export const useAddons = () => useKreatorStore((state) => state.addons);
export const useRecentSizes = () => useKreatorStore((state) => state.recentSizes);
