// src/lib/pricing.ts v0.002 Algorytm wyceny paneli tapicerowanych

import type {
  Panel,
  Addons,
  PriceSummary,
  PanelPriceItem,
  PriceCategory,
} from '@/types';
import { calculateArea, dimensionKey } from './utils';
import pricesData from '@/data/prices.json';
import fabricsData from '@/data/fabrics.json';

// Typy dla danych cenowych
type PriceTable = Record<string, number>;

const prices = {
  standard: pricesData.standard as PriceTable,
  premium: pricesData.premium as PriceTable,
  exclusive: pricesData.exclusive as PriceTable,
};

const FALLBACK_PRICE_PER_M2 = pricesData.fallbackPricePerM2;
const customPricing = pricesData.customPricing;

// Mnożniki cenowe dla kategorii (przy nietypowych wymiarach)
const CATEGORY_MULTIPLIERS: Record<PriceCategory, number> = {
  standard: 1.0,
  premium: 1.15,
  exclusive: 1.25,
};

/**
 * Pobiera kategorie cenowa dla tkaniny
 */
interface FabricColorData {
  id: string;
  name: string;
  image: string | null;
}

function getFabricCategory(fabricId: string): PriceCategory {
  for (const [, data] of Object.entries(fabricsData.collections)) {
    const collectionData = data as { category: PriceCategory; colors: FabricColorData[] };
    if (collectionData.colors.some((c) => c.id === fabricId)) {
      return collectionData.category;
    }
  }
  // Domyslnie standard
  return 'standard';
}

/**
 * Oblicza cene pojedynczego panelu
 * Priorytet: 1. Cena z tabeli, 2. Bardzo maly (<0.05m2), 3. Maly, 4. Waski, 5. Nietypowy
 * Dla nietypowych wymiarow stosuje mnozniki kategorii
 */
function calculatePanelPrice(
  width: number,
  height: number,
  category: PriceCategory
): number {
  const key = dimensionKey(width, height);
  const altKey = dimensionKey(height, width); // Sprawdz tez odwrocony wymiar
  const priceTable = prices[category];

  // 1. Cena z tabeli typowych wymiarow
  if (priceTable[key]) {
    return priceTable[key];
  }
  if (priceTable[altKey]) {
    return priceTable[altKey];
  }

  const area = calculateArea(width, height);
  const multiplier = CATEGORY_MULTIPLIERS[category];
  const { verySmall, small, narrowVertical, narrowHorizontal } = customPricing;

  // 2. Bardzo maly panel (< 0.05 m2)
  if (area < verySmall.maxAreaM2) {
    return Math.round(verySmall.price * multiplier);
  }

  // 3. Maly panel (0.05-0.1 m2, boki 10-50cm)
  if (
    area >= small.minAreaM2 &&
    area <= small.maxAreaM2 &&
    width >= small.minSideCm &&
    width <= small.maxSideCm &&
    height >= small.minSideCm &&
    height <= small.maxSideCm
  ) {
    return Math.round(small.price * multiplier);
  }

  // 4. Waski panel pionowy (szer 10-20, wys > 50)
  if (
    width >= narrowVertical.minWidth &&
    width <= narrowVertical.maxWidth &&
    height >= narrowVertical.minHeight
  ) {
    const effectiveArea = calculateArea(narrowVertical.useWidth, height);
    return Math.round(effectiveArea * narrowVertical.pricePerM2 * multiplier);
  }

  // 4b. Waski panel poziomy (wys 10-20, szer > 50)
  if (
    height >= narrowHorizontal.minHeight &&
    height <= narrowHorizontal.maxHeight &&
    width >= narrowHorizontal.minWidth
  ) {
    const effectiveArea = calculateArea(width, narrowHorizontal.useHeight);
    return Math.round(effectiveArea * narrowHorizontal.pricePerM2 * multiplier);
  }

  // 5. Nietypowy - cena za m2 z mnoznikiem kategorii
  return Math.round(area * FALLBACK_PRICE_PER_M2 * multiplier);
}

/**
 * Sprawdza czy wymiary sa typowe (istnieja w tabeli cenowej)
 */
export function isStandardDimension(width: number, height: number): boolean {
  const key = dimensionKey(width, height);
  const altKey = dimensionKey(height, width);
  return !!(prices.standard[key] || prices.standard[altKey]);
}

/**
 * Pobiera liste wszystkich typowych wymiarow
 */
export function getStandardDimensions(): string[] {
  return Object.keys(prices.standard);
}

/**
 * Oblicza cene dodatku na podstawie powierzchni
 */
function calculateAddonPrice(
  area: number,
  ranges: Array<{ maxArea: number | null; price: number }>
): number {
  for (const range of ranges) {
    if (range.maxArea === null || area < range.maxArea) {
      return range.price;
    }
  }
  return ranges[ranges.length - 1].price;
}

/**
 * Oblicza calosc wyceny
 */
export function calculatePriceSummary(
  panels: Panel[],
  addons: Addons,
  colorToFabricMapping: Record<string, string>
): PriceSummary {
  // Grupowanie paneli po wymiarach i tkaninie
  const panelGroups = new Map<string, PanelPriceItem>();

  let totalArea = 0;

  for (const panel of panels) {
    const fabricId = colorToFabricMapping[panel.colorId];
    const category = fabricId ? getFabricCategory(fabricId) : 'standard';
    const dimension = dimensionKey(panel.width, panel.height);
    const unitPrice = calculatePanelPrice(panel.width, panel.height, category);
    const area = calculateArea(panel.width, panel.height);

    totalArea += area;

    const groupKey = `${dimension}-${fabricId || 'default'}-${category}`;

    if (panelGroups.has(groupKey)) {
      const existing = panelGroups.get(groupKey)!;
      existing.quantity += 1;
      existing.totalPrice += unitPrice;
    } else {
      panelGroups.set(groupKey, {
        dimension,
        fabricName: fabricId || 'Brak wyboru',
        category,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
      });
    }
  }

  const panelItems = Array.from(panelGroups.values());
  const panelsTotal = panelItems.reduce((sum, item) => sum + item.totalPrice, 0);
  const panelsCount = panels.length;

  // Dodatki
  const addonsPrices = {
    doubleFoam: addons.doubleFoam
      ? calculateAddonPrice(totalArea, pricesData.addons.doubleFoam.ranges)
      : 0,
    velcro: addons.velcro
      ? calculateAddonPrice(totalArea, pricesData.addons.velcro.ranges)
      : 0,
    socketHoles: addons.socketHoles * pricesData.addons.socketHole,
    glue: addons.glueCount * pricesData.addons.glue,
  };

  const addonsTotal =
    addonsPrices.doubleFoam +
    addonsPrices.velcro +
    addonsPrices.socketHoles +
    addonsPrices.glue;

  // Wysylka (uproszczona - srednia paczka)
  const shipping = panelsCount > 0 ? pricesData.shipping.medium : 0;

  return {
    panels: panelItems,
    panelsTotal,
    panelsCount,
    totalArea: Math.round(totalArea * 100) / 100,
    addons: addonsPrices,
    addonsTotal,
    shipping,
    grandTotal: panelsTotal + addonsTotal + shipping,
  };
}
