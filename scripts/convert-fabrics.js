// scripts/convert-fabrics.js v0.001 Skrypt konwersji fabricImages.js do fabrics.json
const fs = require('fs');
const path = require('path');

// Kategorie tkanin zgodnie z analiza_cenowa.md
const CATEGORIES = {
  standard: ['DIANA', 'LUNA', 'SWEET', 'TANGO', 'TRINITY', 'IVA', 'EKO_SKÓRA', 'TREND'],
  premium: ['OLIMP', 'RIVIERA', 'JASMINE_PIK', 'PRESTON', 'GEMMA', 'MONOLITH', 'MATT_VELVET',
            'RIO', 'COLIN', 'RODOS', 'KRONOS', 'FOREST', 'CROWN', 'NUBUK', 'LARY', 'FRESH', 'EVO'],
  exclusive: ['NOW_OR_NEVER']
};

// Wczytaj fabricImages.js
const fabricImagesPath = path.join(__dirname, '../references/fabricImages.js');
const fabricImagesContent = fs.readFileSync(fabricImagesPath, 'utf8');

// Wyciągnij obiekt fabricImages (usuwając deklarację zmiennej)
const match = fabricImagesContent.match(/const fabricImages\s*=\s*(\{[\s\S]*\});/);
if (!match) {
  console.error('Nie udało się sparsować fabricImages.js');
  process.exit(1);
}

// Bezpieczna ewaluacja obiektu
let fabricImages;
try {
  fabricImages = eval('(' + match[1] + ')');
} catch (e) {
  console.error('Błąd parsowania:', e);
  process.exit(1);
}

// Funkcja do określenia kategorii
function getCategory(collectionName) {
  const normalized = collectionName.replace('_', '_');
  for (const [category, collections] of Object.entries(CATEGORIES)) {
    if (collections.includes(normalized)) {
      return category;
    }
  }
  // Domyślnie premium dla nieznanych
  return 'premium';
}

// Funkcja do generowania ID z nazwy
function generateId(colorName) {
  return colorName
    .toLowerCase()
    .replace(/[ąàáâãäå]/g, 'a')
    .replace(/[ćçč]/g, 'c')
    .replace(/[ęèéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[łľ]/g, 'l')
    .replace(/[ńñň]/g, 'n')
    .replace(/[óòôõö]/g, 'o')
    .replace(/[śšş]/g, 's')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ýÿ]/g, 'y')
    .replace(/[źżž]/g, 'z')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// Konwertuj do nowego formatu
const collections = {};
const categoryLists = {
  standard: [],
  premium: [],
  exclusive: []
};

for (const [collectionName, colors] of Object.entries(fabricImages)) {
  const category = getCategory(collectionName);
  categoryLists[category].push(collectionName);

  const colorArray = [];
  for (const [colorName, imageUrl] of Object.entries(colors)) {
    colorArray.push({
      id: generateId(colorName),
      name: colorName,
      image: imageUrl
    });
  }

  collections[collectionName] = {
    category: category,
    colors: colorArray
  };
}

// Utwórz finalny obiekt
const output = {
  _meta: {
    file: 'fabrics.json',
    version: 'v0.002',
    description: 'Kolekcje tkanin z kategoriami cenowymi - wygenerowano automatycznie z fabricImages.js',
    generatedAt: new Date().toISOString()
  },
  categories: {
    standard: categoryLists.standard.sort(),
    premium: categoryLists.premium.sort(),
    exclusive: categoryLists.exclusive.sort()
  },
  collections: collections,
  defaultPalette: [
    { id: 'color-white', name: 'Bialy', hex: '#FFFFFF' },
    { id: 'color-cream', name: 'Kremowy', hex: '#F5F5DC' },
    { id: 'color-beige', name: 'Bezowy', hex: '#D4C4A8' },
    { id: 'color-gray-light', name: 'Jasny szary', hex: '#C0C0C0' },
    { id: 'color-gray', name: 'Szary', hex: '#808080' },
    { id: 'color-gray-dark', name: 'Grafitowy', hex: '#4A4A4A' },
    { id: 'color-black', name: 'Czarny', hex: '#1A1A1A' },
    { id: 'color-navy', name: 'Granatowy', hex: '#1E3A5F' },
    { id: 'color-green', name: 'Butelkowa zielen', hex: '#2D5A3D' },
    { id: 'color-burgundy', name: 'Bordowy', hex: '#722F37' }
  ]
};

// Zapisz plik
const outputPath = path.join(__dirname, '../kreator-app/src/data/fabrics.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

// Statystyki
let totalColors = 0;
for (const collection of Object.values(collections)) {
  totalColors += collection.colors.length;
}

console.log('✅ Wygenerowano fabrics.json');
console.log(`   Kolekcje: ${Object.keys(collections).length}`);
console.log(`   Kolory: ${totalColors}`);
console.log(`   Standard: ${categoryLists.standard.length} kolekcji`);
console.log(`   Premium: ${categoryLists.premium.length} kolekcji`);
console.log(`   Exclusive: ${categoryLists.exclusive.length} kolekcji`);
