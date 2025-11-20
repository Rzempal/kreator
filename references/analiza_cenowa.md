# Raport Analizy Kalkulatora Paneli Tapicerowanych

(Źródło danych: plik „Analiza Cenowa.docx”) 

## 1. Algorytm Wyceny Podstawowej
System wyceny opiera się na priorytetowej kolejności sprawdzania warunków, aby ustalić cenę bazową panelu.

| Priorytet | Typ Wymiaru       | Warunek Logiczny                                               | Metoda Wyceny             | Stawka                         |
|-----------|--------------------|------------------------------------------------------------------|----------------------------|---------------------------------|
| 1         | Typowy             | Wymiar znajduje się w bazie typowych                            | Cena z tabeli              | 21–150 zł                       |
| 2         | Bardzo mały        | Powierzchnia < 0,05 m²                                           | Ryczałt                    | 25 zł                           |
| 3         | Mały               | Pow. 0,05–0,1 m², boki 10–50 cm                                 | Ryczałt                    | 30 zł                           |
| 4         | Wąski (pion)       | Szer. 10–20 cm, wys. > 50 cm                                    | Narzut technologiczny      | Jak 20 cm × 300 zł/m²           |
| 5         | Wąski (poziom)     | Wys. 10–20 cm, szer. > 50 cm                                    | Narzut technologiczny      | Jak 20 cm × 300 zł/m²           |
| 6         | Nietypowy          | Wszystkie inne                                                   | Stawka m²                  | 300 zł/m²                       |

## 2. Kategorie Tkanin

### STANDARD
DIANA, LUNA, SWEET, TANGO, TRINITY, IVA, EKO_SKÓRA, TREND, Własna tkanina / Brak wyboru

### PREMIUM
OLIMP, RIVIERA, JASMINE_PIK, PRESTON, GEMMA, MONOLITH, MATT_VELVET, RIO, COLIN, RODOS, KRONOS, FOREST, CROWN, NUBUK, LARY, FRESH

### EXCLUSIVE
NOW_OR_NEVER

## 3. Cennik Dodatków i Akcesoriów

### Podwójna Pianka
| Powierzchnia | Cena |
|--------------|------|
| < 0,4 m²     | 6 zł |
| 0,4–0,9 m²   | 15 zł |
| 0,9–1,5 m²   | 30 zł |
| 1,5–2,0 m²   | 60 zł |
| ≥ 2,0 m²     | 100 zł |

### Rzep Montażowy
| Powierzchnia | Cena |
|--------------|------|
| < 0,4 m²     | 8 zł |
| 0,4–0,9 m²   | 20 zł |
| 0,9–1,5 m²   | 40 zł |
| 1,5–2,0 m²   | 70 zł |
| ≥ 2,0 m²     | 120 zł |

### Inne
- **Otwór na kontakt:** 39 zł / szt.  
- **Klej montażowy:** 36 zł / szt.

## 4. Koszty Logistyczne

| Rodzaj przesyłki | Warunki | Cena |
|------------------|---------|------|
| Standard         | Suma boków + (ilość × 5) < 300 cm | 18 zł |
| Średnia paczka   | Bok ≥ 110 cm lub oba ≥ 90 cm       | 39 zł |
| Gabaryt          | Bok ≥ 140 cm lub (100 × 200 cm)    | 130 zł |

## 5. Tabela Wymiarów Typowych
Pełna lista wymiarów i cen znajduje się w dokumencie źródłowym.

