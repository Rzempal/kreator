// src/lib/utils.ts v0.001 Funkcje pomocnicze

/**
 * Generuje unikalne ID z opcjonalnym prefixem
 */
export function generateId(prefix: string = 'id'): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Formatuje cene do wyswietlenia (PLN)
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
    minimumFractionDigits: 2,
  }).format(price);
}

/**
 * Oblicza powierzchnie w m2 z cm
 */
export function calculateArea(widthCm: number, heightCm: number): number {
  return (widthCm * heightCm) / 10000;
}

/**
 * Oblicza luminancje koloru (WCAG)
 * Zwraca true jesli kolor jest jasny (potrzebuje ciemnego tekstu)
 */
export function isLightColor(hex: string): boolean {
  const color = hex.replace('#', '');
  const r = parseInt(color.substring(0, 2), 16);
  const g = parseInt(color.substring(2, 4), 16);
  const b = parseInt(color.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
}

/**
 * Clamp wartosci do zakresu
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Sprawdza czy dwie liczby sa bliskie (floating point)
 */
export function isClose(a: number, b: number, epsilon: number = 0.001): boolean {
  return Math.abs(a - b) < epsilon;
}

/**
 * Tworzy klucz wymiaru z width i height
 */
export function dimensionKey(width: number, height: number): string {
  return `${width}x${height}`;
}

/**
 * Debounce funkcji
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Klasy CSS - laczy warunkowo
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
