// src/types/index.ts v0.001 Definicje typow dla Kreatora Paneli Tapicerowanych

// ============================================
// WYMIARY I POZYCJE
// ============================================

export interface Dimensions {
  width: number;  // cm
  height: number; // cm
}

export interface Position {
  x: number; // cm od lewej krawedzi
  y: number; // cm od gornej krawedzi
}

export interface Rectangle extends Position, Dimensions {}

// ============================================
// SEGMENT SCIANY
// ============================================

export interface WallSegment {
  id: string;
  width: number;       // cm - szerokosc segmentu
  startHeight: number; // cm - wysokosc na poczatku (lewa strona)
  endHeight: number;   // cm - wysokosc na koncu (prawa strona) - dla skosow
  angle: 90 | 180 | 270; // kat polaczenia z nastepnym segmentem
}

export interface Wall {
  segments: WallSegment[];
  masterSegmentId: string | null; // segment referencyjny dla widoku z gory
}

// ============================================
// PANEL
// ============================================

export type PanelStatus = 'valid' | 'warning' | 'error';

export interface Panel {
  id: string;
  x: number;          // pozycja X (cm)
  y: number;          // pozycja Y (cm)
  width: number;      // szerokosc (cm)
  height: number;     // wysokosc (cm)
  colorId: string;    // ID koloru z palety
  fabricId?: string;  // ID tkaniny (opcjonalne - do wyceny)
  status: PanelStatus;
}

export interface PanelPreview extends Omit<Panel, 'id' | 'fabricId'> {
  visible: boolean;
  locked: boolean; // czy preview jest zamrozony po kliknieciu
}

// ============================================
// KOLORY I TKANINY
// ============================================

export interface PaletteColor {
  id: string;
  name: string;
  hex: string;
}

export interface FabricColor {
  id: string;
  name: string;
  image: string | null;
}

export interface FabricCollection {
  category: PriceCategory;
  colors: FabricColor[];
}

// ============================================
// CENY
// ============================================

export type PriceCategory = 'standard' | 'premium' | 'exclusive';

export interface PriceTable {
  [dimension: string]: number; // np. "30x100": 50
}

export interface AddonPriceRange {
  maxArea: number | null; // null = bez limitu
  price: number;
}

export interface Addons {
  doubleFoam: boolean;     // podwojna pianka
  velcro: boolean;         // rzep montazowy
  socketHoles: number;     // ilosc otworow na kontakt
  glueCount: number;       // ilosc kleju montazowego
}

// ============================================
// WYCENA
// ============================================

export interface PanelPriceItem {
  dimension: string;      // np. "30x100"
  fabricName: string;
  category: PriceCategory;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface PriceSummary {
  panels: PanelPriceItem[];
  panelsTotal: number;
  panelsCount: number;
  totalArea: number;       // m2

  addons: {
    doubleFoam: number;
    velcro: number;
    socketHoles: number;
    glue: number;
  };
  addonsTotal: number;

  shipping: number;

  grandTotal: number;
}

// ============================================
// STAN APLIKACJI
// ============================================

export type ViewMode = 'frontal' | 'top';
export type ToolMode = 'select' | 'paint' | 'erase';

export interface KreatorState {
  // Sciana
  wall: Wall;

  // Panele
  panels: Panel[];
  selectedPanelId: string | null;

  // Preview
  preview: PanelPreview;
  activePanelSize: Dimensions | null;

  // Narzedzia
  toolMode: ToolMode;
  activeColorId: string;

  // Widok
  viewMode: ViewMode;
  zoom: number;

  // Konfiguracja
  addons: Addons;
  colorToFabricMapping: Record<string, string>; // colorId -> fabricId

  // Wycena (computed)
  priceSummary: PriceSummary | null;
}

// ============================================
// AKCJE STORE
// ============================================

export interface KreatorActions {
  // Sciana
  addSegment: (segment: Omit<WallSegment, 'id'>) => void;
  removeSegment: (id: string) => void;
  updateSegment: (id: string, updates: Partial<WallSegment>) => void;
  setMasterSegment: (id: string) => void;

  // Panele
  addPanel: (panel: Omit<Panel, 'id' | 'status'>) => void;
  removePanel: (id: string) => void;
  updatePanel: (id: string, updates: Partial<Panel>) => void;
  clearPanels: () => void;
  undoLastPanel: () => void;

  // Preview
  setPreview: (preview: Partial<PanelPreview>) => void;
  setActivePanelSize: (size: Dimensions | null) => void;
  lockPreview: () => void;
  unlockPreview: () => void;

  // Narzedzia
  setToolMode: (mode: ToolMode) => void;
  setActiveColor: (colorId: string) => void;

  // Widok
  setViewMode: (mode: ViewMode) => void;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;

  // Konfiguracja
  setAddons: (addons: Partial<Addons>) => void;
  mapColorToFabric: (colorId: string, fabricId: string) => void;

  // Wycena
  recalculatePrice: () => void;

  // Projekt
  saveProject: () => void;
  loadProject: (projectId: string) => void;
  resetProject: () => void;
}

// ============================================
// GEOMETRIA (dla algorytmow)
// ============================================

export interface SnapResult {
  x: number;
  y: number;
  snappedTo: 'panel' | 'wall' | 'none';
}

export interface CollisionResult {
  collides: boolean;
  collidingPanelIds: string[];
}

export interface FitResult {
  fits: boolean;
  partiallyOutside: boolean;
  outsideArea: number; // procent poza obszarem
}

// ============================================
// PDF EXPORT
// ============================================

export interface QuoteData {
  quoteId: string;
  date: string;
  wall: Wall;
  panels: Panel[];
  priceSummary: PriceSummary;
  addons: Addons;
}
