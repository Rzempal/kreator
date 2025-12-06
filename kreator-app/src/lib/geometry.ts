// src/lib/geometry.ts v0.001 Algorytmy geometryczne (snap, kolizje, fit)

import type {
  Panel,
  WallSegment,
  Wall,
  Position,
  Rectangle,
  SnapResult,
  CollisionResult,
  FitResult,
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
 */
export function checkPanelFits(
  panel: Rectangle,
  wall: Wall
): FitResult {
  const totalWidth = getTotalWallWidth(wall);

  // Panel calkowicie poza sciana (X)
  if (panel.x + panel.width <= 0 || panel.x >= totalWidth) {
    return { fits: false, partiallyOutside: false, outsideArea: 100 };
  }

  // Panel powyzej sciany (Y < 0)
  if (panel.y < 0) {
    return { fits: false, partiallyOutside: true, outsideArea: 50 };
  }

  // Sprawdz 5 punktow na dolnej krawedzi panelu
  const samplePoints = 5;
  let outsideCount = 0;

  for (let i = 0; i <= samplePoints; i++) {
    const sampleX = panel.x + (panel.width * i) / samplePoints;
    const wallHeight = getWallHeightAtX(wall, sampleX);
    const panelBottom = panel.y + panel.height;

    if (panelBottom > wallHeight || sampleX < 0 || sampleX > totalWidth) {
      outsideCount++;
    }
  }

  const outsideRatio = outsideCount / (samplePoints + 1);

  if (outsideRatio === 0) {
    return { fits: true, partiallyOutside: false, outsideArea: 0 };
  }

  if (outsideRatio < 1) {
    return {
      fits: true,
      partiallyOutside: true,
      outsideArea: Math.round(outsideRatio * 100),
    };
  }

  return { fits: false, partiallyOutside: false, outsideArea: 100 };
}

// ============================================
// SNAP ALGORITHM
// ============================================

const SNAP_THRESHOLD = 15; // cm

/**
 * Glowny algorytm snap - przyciaga panel do najblizszych krawedzi
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

  // Ogranicz do granic sciany
  const totalWidth = getTotalWallWidth(wall);
  targetX = Math.max(0, Math.min(totalWidth - panelWidth, targetX));
  targetY = Math.max(0, targetY);

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

  // Snap do lewej krawedzi sciany
  if (x < SNAP_THRESHOLD) {
    snapX = 0;
    snappedTo = 'wall';
  }

  // Snap do dolnej krawedzi sciany (Y = 0)
  if (y < SNAP_THRESHOLD) {
    snapY = 0;
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
          if (testY < 0) continue;

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
