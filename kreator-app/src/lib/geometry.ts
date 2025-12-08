// src/lib/geometry.ts v0.005 Dodano calculatePanelClipPath dla skosów

import type {
  Panel,
  WallSegment,
  Wall,
  Position,
  Rectangle,
  SnapResult,
  CollisionResult,
  FitResult,
  ClipPathResult,
} from '@/types';
import { isClose } from './utils';

// ============================================
// KOLIZJE
// ============================================

/**
 * Sprawdza czy dwa prostokaty nachodza na siebie
 */
function rectanglesOverlap(a: Rectangle, b: Rectangle): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

/**
 * Sprawdza kolizje panelu z innymi panelami
 */
export function checkCollisions(
  panel: Rectangle,
  panels: Panel[],
  excludeId?: string
): CollisionResult {
  const collidingPanelIds: string[] = [];

  for (const other of panels) {
    if (other.id === excludeId) continue;

    if (rectanglesOverlap(panel, other)) {
      collidingPanelIds.push(other.id);
    }
  }

  return {
    collides: collidingPanelIds.length > 0,
    collidingPanelIds,
  };
}

// ============================================
// INTERPOLACJA WYSOKOSCI SCIANY
// ============================================

/**
 * Oblicza wysokosc sciany w danym punkcie X
 * Uwzglednia skosy (rozna wysokosc poczatkowa/koncowa)
 */
export function getWallHeightAtX(wall: Wall, x: number): number {
  let currentX = 0;

  for (const segment of wall.segments) {
    const segmentEnd = currentX + segment.width;

    if (x >= currentX && x <= segmentEnd) {
      // Interpolacja liniowa dla skosow
      const ratio = (x - currentX) / segment.width;
      return segment.startHeight + ratio * (segment.endHeight - segment.startHeight);
    }

    currentX = segmentEnd;
  }

  // Poza sciana - zwroc ostatnia wysokosc
  const lastSegment = wall.segments[wall.segments.length - 1];
  return lastSegment?.endHeight ?? 0;
}

/**
 * Oblicza granice Y sciany w danym punkcie X (z uwzglednieniem wyrownania)
 * Zwraca { top, bottom } - pozycje Y gornej i dolnej krawedzi sciany
 */
export function getWallBoundsAtX(wall: Wall, x: number): { top: number; bottom: number } {
  const maxHeight = getMaxWallHeight(wall);
  const heightAtX = getWallHeightAtX(wall, x);
  const alignment = wall.segments[0]?.alignment ?? 'bottom';

  if (alignment === 'top') {
    // Wyrownanie do gory: top=0, bottom=heightAtX
    return { top: 0, bottom: heightAtX };
  } else {
    // Wyrownanie do dolu: top=maxHeight-heightAtX, bottom=maxHeight
    return { top: maxHeight - heightAtX, bottom: maxHeight };
  }
}

/**
 * Oblicza calkowita szerokosc sciany
 */
export function getTotalWallWidth(wall: Wall): number {
  return wall.segments.reduce((sum, seg) => sum + seg.width, 0);
}

/**
 * Oblicza maksymalna wysokosc sciany
 */
export function getMaxWallHeight(wall: Wall): number {
  return Math.max(
    ...wall.segments.flatMap((seg) => [seg.startHeight, seg.endHeight])
  );
}

// ============================================
// FIT CHECK
// ============================================

/**
 * Sprawdza czy panel miesci sie w obszarze sciany
 * Zwraca informacje o czesciowym wychodzeniu poza obszar
 * Uwzglednia wyrownanie sciany (top/bottom)
 * UWAGA: Wyjscie poza obszar to tylko warning, nie error (error tylko dla kolizji)
 */
export function checkPanelFits(
  panel: Rectangle,
  wall: Wall
): FitResult {
  const totalWidth = getTotalWallWidth(wall);

  // Panel calkowicie poza sciana (X) - warning, nie error
  if (panel.x + panel.width <= 0 || panel.x >= totalWidth) {
    return { fits: true, partiallyOutside: true, outsideArea: 100 };
  }

  // Sprawdz 5 punktow na kazdej krawedzi panelu
  const samplePoints = 5;
  let outsideCount = 0;

  for (let i = 0; i <= samplePoints; i++) {
    const sampleX = panel.x + (panel.width * i) / samplePoints;
    const bounds = getWallBoundsAtX(wall, sampleX);
    const panelTop = panel.y;
    const panelBottom = panel.y + panel.height;

    // Sprawdz czy punkt jest poza granicami sciany
    if (
      sampleX < 0 ||
      sampleX > totalWidth ||
      panelTop < bounds.top ||
      panelBottom > bounds.bottom
    ) {
      outsideCount++;
    }
  }

  const outsideRatio = outsideCount / (samplePoints + 1);

  if (outsideRatio === 0) {
    return { fits: true, partiallyOutside: false, outsideArea: 0 };
  }

  // Kazde wyjscie poza obszar to warning (fits: true, partiallyOutside: true)
  return {
    fits: true,
    partiallyOutside: true,
    outsideArea: Math.round(outsideRatio * 100),
  };
}

// ============================================
// SNAP ALGORITHM
// ============================================

const SNAP_THRESHOLD = 15; // cm

/**
 * Glowny algorytm snap - przyciaga panel do najblizszych krawedzi
 * Uwzglednia wyrownanie sciany (top/bottom)
 */
export function findSnapPosition(
  mouseX: number,
  mouseY: number,
  panelWidth: number,
  panelHeight: number,
  panels: Panel[],
  wall: Wall
): SnapResult {
  // Pozycja srodka panelu wzgledem myszy
  let targetX = mouseX - panelWidth / 2;
  let targetY = mouseY - panelHeight / 2;

  let snappedTo: SnapResult['snappedTo'] = 'none';

  // 1. Pionowa projekcja - szukaj paneli bezposrednio pod kursorem
  const verticalSnap = findVerticalSnapTarget(mouseX, mouseY, panelWidth, panelHeight, panels);
  if (verticalSnap) {
    targetX = verticalSnap.x;
    targetY = verticalSnap.y;
    snappedTo = 'panel';
  } else {
    // 2. Fallback snap do najblizszych krawedzi
    const edgeSnap = findEdgeSnapTarget(targetX, targetY, panelWidth, panelHeight, panels, wall);
    targetX = edgeSnap.x;
    targetY = edgeSnap.y;
    snappedTo = edgeSnap.snappedTo;
  }

  // Soft clamp - pozwala panelowi wyjsc czesciowo poza obszar sciany
  // Przy skosach uzytkownik moze chciec umiescic panel wystajacy poza krawedz
  // Pozwalamy na wyjscie do 50% rozmiaru panelu poza granice
  const OVERFLOW_MARGIN = 0.5; // 50% panelu moze wyjsc poza

  if (snappedTo !== 'none') {
    const totalWidth = getTotalWallWidth(wall);
    const bounds = getWallBoundsAtX(wall, targetX + panelWidth / 2);

    // Liberalne ograniczenie - pozwala na czesciowe wyjscie
    const maxOverflowX = panelWidth * OVERFLOW_MARGIN;
    const maxOverflowY = panelHeight * OVERFLOW_MARGIN;

    if (targetX < -maxOverflowX) targetX = -maxOverflowX;
    if (targetX > totalWidth - panelWidth + maxOverflowX) targetX = totalWidth - panelWidth + maxOverflowX;
    if (targetY < bounds.top - maxOverflowY) targetY = bounds.top - maxOverflowY;
    if (targetY > bounds.bottom - panelHeight + maxOverflowY) targetY = bounds.bottom - panelHeight + maxOverflowY;
  }

  return { x: targetX, y: targetY, snappedTo };
}

/**
 * Szuka panelu do przyciagniecia w pionie (nad/pod kursorem)
 */
function findVerticalSnapTarget(
  mouseX: number,
  mouseY: number,
  panelWidth: number,
  panelHeight: number,
  panels: Panel[]
): Position | null {
  // Filtruj panele ktore sa "pod" kursorem (w zakresie X)
  const candidates = panels.filter(
    (p) => mouseX >= p.x && mouseX <= p.x + p.width
  );

  if (candidates.length === 0) return null;

  // Znajdz najblizszy panel powyzej kursora
  let bestPanel: Panel | null = null;
  let bestDistance = Infinity;

  for (const panel of candidates) {
    const panelBottom = panel.y + panel.height;
    const distance = mouseY - panelBottom;

    if (distance > 0 && distance < bestDistance) {
      bestDistance = distance;
      bestPanel = panel;
    }
  }

  if (bestPanel) {
    // Snap pod znaleziony panel, wyrownaj X do jego lewej krawedzi
    return {
      x: bestPanel.x,
      y: bestPanel.y + bestPanel.height,
    };
  }

  return null;
}

/**
 * Szuka najblizszych krawedzi do snap (lewa/dolna sciana lub panele)
 * Uwzglednia wyrownanie sciany (top/bottom)
 */
function findEdgeSnapTarget(
  x: number,
  y: number,
  panelWidth: number,
  panelHeight: number,
  panels: Panel[],
  wall: Wall
): SnapResult {
  let snapX = x;
  let snapY = y;
  let snappedTo: SnapResult['snappedTo'] = 'none';

  // Pobierz granice sciany w punkcie X
  const bounds = getWallBoundsAtX(wall, x + panelWidth / 2);

  // Snap do lewej krawedzi sciany
  if (x < SNAP_THRESHOLD) {
    snapX = 0;
    snappedTo = 'wall';
  }

  // Snap do gornej krawedzi sciany
  if (Math.abs(y - bounds.top) < SNAP_THRESHOLD) {
    snapY = bounds.top;
    snappedTo = 'wall';
  }

  // Snap do dolnej krawedzi sciany
  if (Math.abs(y + panelHeight - bounds.bottom) < SNAP_THRESHOLD) {
    snapY = bounds.bottom - panelHeight;
    snappedTo = 'wall';
  }

  // Snap do istniejacych paneli
  for (const panel of panels) {
    // Snap X: prawa krawedz panelu -> lewa krawedz nowego
    if (Math.abs(panel.x + panel.width - x) < SNAP_THRESHOLD) {
      snapX = panel.x + panel.width;
      snappedTo = 'panel';
    }

    // Snap X: lewa krawedz panelu -> prawa krawedz nowego
    if (Math.abs(panel.x - (x + panelWidth)) < SNAP_THRESHOLD) {
      snapX = panel.x - panelWidth;
      snappedTo = 'panel';
    }

    // Snap Y: gorna krawedz panelu -> dolna krawedz nowego
    if (Math.abs(panel.y - (y + panelHeight)) < SNAP_THRESHOLD) {
      snapY = panel.y - panelHeight;
      snappedTo = 'panel';
    }

    // Snap Y: dolna krawedz panelu -> gorna krawedz nowego
    if (Math.abs(panel.y + panel.height - y) < SNAP_THRESHOLD) {
      snapY = panel.y + panel.height;
      snappedTo = 'panel';
    }
  }

  return { x: snapX, y: snapY, snappedTo };
}

/**
 * Znajduje alternatywna pozycje bez kolizji
 * Priorytet: Y wazniejsze niz X (waga 3x)
 * Uwzglednia wyrownanie sciany (top/bottom)
 */
export function findNonCollidingPosition(
  x: number,
  y: number,
  panelWidth: number,
  panelHeight: number,
  panels: Panel[],
  wall: Wall
): Position {
  const totalWidth = getTotalWallWidth(wall);
  const maxHeight = getMaxWallHeight(wall);

  // Sprawdz czy obecna pozycja jest OK
  const collision = checkCollisions(
    { x, y, width: panelWidth, height: panelHeight },
    panels
  );

  if (!collision.collides) {
    return { x, y };
  }

  // Szukaj alternatywnej pozycji
  const step = 10; // cm
  let bestX = x;
  let bestY = y;
  let minCost = Infinity;

  for (let dy = 0; dy <= maxHeight; dy += step) {
    for (let dx = 0; dx <= totalWidth; dx += step) {
      for (const testX of [x + dx, x - dx]) {
        for (const testY of [y + dy, y - dy]) {
          if (testX < 0 || testX + panelWidth > totalWidth) continue;

          // Sprawdz granice sciany w tym punkcie
          const bounds = getWallBoundsAtX(wall, testX + panelWidth / 2);
          if (testY < bounds.top || testY + panelHeight > bounds.bottom) continue;

          const testCollision = checkCollisions(
            { x: testX, y: testY, width: panelWidth, height: panelHeight },
            panels
          );

          if (!testCollision.collides) {
            // Koszt: odleglosc od oryginalnej pozycji (Y ma wage 3x)
            const cost = Math.abs(testX - x) + Math.abs(testY - y) * 3;
            if (cost < minCost) {
              minCost = cost;
              bestX = testX;
              bestY = testY;
            }
          }
        }
      }
    }
  }

  return { x: bestX, y: bestY };
}

// ============================================
// CLIP PATH DLA SKOSÓW
// ============================================

/**
 * Oblicza clip path dla panelu przecinającego skos ściany
 * Zwraca punkty poligonu (względem panelu, nie canvas)
 *
 * @param panel - prostokąt panelu (x, y, width, height w cm)
 * @param wall - definicja ściany z segmentami
 * @returns ClipPathResult z punktami clip path i waste
 */
export function calculatePanelClipPath(
  panel: Rectangle,
  wall: Wall
): ClipPathResult {
  const alignment = wall.segments[0]?.alignment ?? 'bottom';
  const maxHeight = getMaxWallHeight(wall);

  // Sprawdź czy panel w ogóle przecina skos
  // Zbierz punkty przecięcia skosu z krawędziami panelu
  const panelLeft = panel.x;
  const panelRight = panel.x + panel.width;
  const panelTop = panel.y;
  const panelBottom = panel.y + panel.height;

  // Pobierz wysokość ściany na lewej i prawej krawędzi panelu
  const heightAtLeft = getWallHeightAtX(wall, panelLeft);
  const heightAtRight = getWallHeightAtX(wall, panelRight);

  // Oblicz granice ściany w pikselach (zgodnie z wyrównaniem)
  let wallTopAtLeft: number, wallTopAtRight: number;
  let wallBottomAtLeft: number, wallBottomAtRight: number;

  if (alignment === 'top') {
    // Wyrównanie do góry: góra = 0, dół = heightAtX
    wallTopAtLeft = 0;
    wallTopAtRight = 0;
    wallBottomAtLeft = heightAtLeft;
    wallBottomAtRight = heightAtRight;
  } else {
    // Wyrównanie do dołu: góra = maxHeight - heightAtX, dół = maxHeight
    wallTopAtLeft = maxHeight - heightAtLeft;
    wallTopAtRight = maxHeight - heightAtRight;
    wallBottomAtLeft = maxHeight;
    wallBottomAtRight = maxHeight;
  }

  // Sprawdź czy panel wymaga przycinania
  // Panel wymaga przycinania gdy wychodzi poza skośną krawędź
  let needsClipTop = false;
  let needsClipBottom = false;

  if (alignment === 'bottom') {
    // Skos na górze - sprawdź czy góra panelu wychodzi ponad skos
    if (panelTop < wallTopAtLeft || panelTop < wallTopAtRight) {
      needsClipTop = true;
    }
  } else {
    // Skos na dole - sprawdź czy dół panelu wychodzi poniżej skosu
    if (panelBottom > wallBottomAtLeft || panelBottom > wallBottomAtRight) {
      needsClipBottom = true;
    }
  }

  // Jeśli nie trzeba przycinać, zwróć pusty wynik
  if (!needsClipTop && !needsClipBottom) {
    return {
      hasClip: false,
      clipPoints: [],
      wastePoints: [],
    };
  }

  // Oblicz punkty clip path (względem panelu, czyli x=0, y=0 to lewy górny róg panelu)
  const clipPoints: Position[] = [];
  const wastePoints: Position[] = [];

  if (needsClipTop && alignment === 'bottom') {
    // Skos na górze - przycinamy górną część panelu
    // Linia skosu przechodzi od wallTopAtLeft do wallTopAtRight

    // Oblicz gdzie skos przecina panel
    const slopeYAtPanelLeft = Math.max(0, wallTopAtLeft - panelTop);
    const slopeYAtPanelRight = Math.max(0, wallTopAtRight - panelTop);

    // Clip path: kształt który zostaje (widoczna część)
    // Zaczynamy od lewego dolnego rogu i idziemy zgodnie z ruchem wskazówek zegara
    clipPoints.push({ x: 0, y: panel.height });                          // lewy dolny
    clipPoints.push({ x: panel.width, y: panel.height });                // prawy dolny
    clipPoints.push({ x: panel.width, y: slopeYAtPanelRight });         // prawy na linii skosu
    clipPoints.push({ x: 0, y: slopeYAtPanelLeft });                    // lewy na linii skosu

    // Waste: część która jest odpadem (górna część)
    if (slopeYAtPanelLeft > 0 || slopeYAtPanelRight > 0) {
      wastePoints.push({ x: 0, y: 0 });                                   // lewy górny
      wastePoints.push({ x: panel.width, y: 0 });                         // prawy górny
      wastePoints.push({ x: panel.width, y: slopeYAtPanelRight });       // prawy na linii skosu
      wastePoints.push({ x: 0, y: slopeYAtPanelLeft });                  // lewy na linii skosu
    }
  } else if (needsClipBottom && alignment === 'top') {
    // Skos na dole - przycinamy dolną część panelu
    // Linia skosu przechodzi od wallBottomAtLeft do wallBottomAtRight

    // Oblicz gdzie skos przecina panel (względem panelu)
    const slopeYAtPanelLeft = Math.min(panel.height, wallBottomAtLeft - panelTop);
    const slopeYAtPanelRight = Math.min(panel.height, wallBottomAtRight - panelTop);

    // Clip path: kształt który zostaje (widoczna część - góra)
    clipPoints.push({ x: 0, y: 0 });                                     // lewy górny
    clipPoints.push({ x: panel.width, y: 0 });                           // prawy górny
    clipPoints.push({ x: panel.width, y: slopeYAtPanelRight });         // prawy na linii skosu
    clipPoints.push({ x: 0, y: slopeYAtPanelLeft });                    // lewy na linii skosu

    // Waste: część która jest odpadem (dolna część)
    if (slopeYAtPanelLeft < panel.height || slopeYAtPanelRight < panel.height) {
      wastePoints.push({ x: 0, y: slopeYAtPanelLeft });                  // lewy na linii skosu
      wastePoints.push({ x: panel.width, y: slopeYAtPanelRight });       // prawy na linii skosu
      wastePoints.push({ x: panel.width, y: panel.height });             // prawy dolny
      wastePoints.push({ x: 0, y: panel.height });                       // lewy dolny
    }
  }

  return {
    hasClip: clipPoints.length > 0,
    clipPoints,
    wastePoints,
  };
}
