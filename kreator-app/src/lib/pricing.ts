// src/lib/pricing.ts v0.001 Algorytm wyceny paneli tapicerowanych

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

  // 2. Bardzo maly panel (< 0.05 m2)
  if (area < 0.05) {
    return 25;
  }

  // 3. Maly panel (0.05-0.1 m2, boki 10-50cm)
  if (area >= 0.05 && area <= 0.1 && width <= 50 && height <= 50) {
    return 30;
  }

  // 4. Waski panel (pionowy: szer 10-20, wys > 50)
  if (width >= 10 && width <= 20 && height > 50) {
    const effectiveArea = calculateArea(20, height);
    return Math.round(effectiveArea * FALLBACK_PRICE_PER_M2);
  }

  // 4b. Waski panel (poziomy: wys 10-20, szer > 50)
  if (height >= 10 && height <= 20 && width > 50) {
    const effectiveArea = calculateArea(width, 20);
    return Math.round(effectiveArea * FALLBACK_PRICE_PER_M2);
  }

  // 5. Nietypowy - cena za m2
  return Math.round(area * FALLBACK_PRICE_PER_M2);
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
