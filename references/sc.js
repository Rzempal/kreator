// DYNAMICZNIE WYPEŁNIANA LISTA TKANIN SELECT
document.addEventListener('DOMContentLoaded', function() {
    const mainSelect = document.getElementById('mainSelect1');
    for (const fabricType in fabricImages) {
        const option = document.createElement('option');
        option.value = fabricType;
        option.textContent = fabricType;
        mainSelect.appendChild(option);
    }
});


function fetchToken() {
    return fetch('generateToken.php')
        .then(response => response.text());
}

function saveResultAsPDF() {
    calculateResult(); // Odśwież wyniki przed zapisaniem do PDF
    const { jsPDF } = window.jspdf;
    const resultContent = document.getElementById('result-content');

    html2canvas(resultContent, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 0.8);
        const doc = new jsPDF();
        const imgWidth = 190;
        const pageHeight = doc.internal.pageSize.height;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        const pageWidth = doc.internal.pageSize.width;
        const xOffset = (pageWidth - imgWidth) / 2;
        const yOffset = (pageHeight - imgHeight) / 6;
        let heightLeft = imgHeight;
        let position = yOffset;

        doc.addImage(imgData, 'JPEG', xOffset, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
            position = heightLeft - imgHeight + yOffset;
            doc.addPage();
            doc.addImage(imgData, 'JPEG', xOffset, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        // Pobierz aktualną datę i godzinę
        const today = new Date();
        const day = String(today.getDate()).padStart(2, '0');
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const year = today.getFullYear();
        const hours = String(today.getHours()).padStart(2, '0');
        const minutes = String(today.getMinutes()).padStart(2, '0');

        // Pobierz unikalny numer z serwera
        fetchToken().then(token => {
            fetch(`saveNumber.php?token=${token}`)
                .then(response => response.text())
                .then(uniqueNumber => {
                    const fileName = `WycenaNaWymiar_${day}_${month}_${year}_nr_${uniqueNumber}.pdf`;

// Dodaj datę i godzinę oraz nazwę pliku w jednej linii
doc.setFontSize(12);
doc.setFont(undefined, 'normal');
doc.setTextColor(64, 64, 64);

const dateTimeText = `Data utworzenia: ${day}.${month}.${year}, godz: ${hours}:${minutes}`;
doc.text(dateTimeText, 10, 10); // Lewa strona

const textWidth = doc.getTextWidth(fileName);
const xRight = pageWidth - textWidth - 10; // Prawa strona
doc.text(fileName, xRight, 10); // Prawa strona

                    // Dodaj "Wycena nr:" w kolorze #dd5f5f i numer w niebieskim
                    doc.setFontSize(24);
                    const label = 'Wycena nr:';
                    doc.setFont(undefined, 'normal');
                    doc.setTextColor(70, 139, 198);
                    doc.text(label, 10, 20);

                    const labelWidth = doc.getTextWidth(label);
                    doc.setFont(undefined, 'bold');
                    doc.text(uniqueNumber, 10 + labelWidth + 2, 20);

                    doc.save(fileName);
                })
                .catch(error => {
                    console.error('Błąd podczas pobierania unikalnego numeru:', error);
                });
        });
    });
}






function saveSzkicAsPDF() {
    const { jsPDF } = window.jspdf;
    const szicMainCon = document.getElementById('szicMainCon');
    const szkicCloseBtn = document.querySelector('.szkic-close-btn');
    const pdfProjektBtn = document.querySelector('.pdf-projekt-btn');
    const szkicFigure = document.getElementById('szkicFigure');
    const podsumowanieTextInput = szicMainCon.querySelector('.podsumowanie-text-input');
    const szkicTitle = szicMainCon.querySelector('.szkic-title');

    // Pobierz wymiary szkicFigure
    const szkicWidth = parseFloat(szkicFigure.style.width); // Szerokość w pikselach
    const szkicHeight = parseFloat(szkicFigure.style.height); // Wysokość w pikselach

    // Tymczasowo usuń obramowanie
    const originalBorder = szicMainCon.style.border;
    szicMainCon.style.border = 'none';

    // Tymczasowo ukryj przyciski "CloseBtn" i "projekt-btn"
    szkicCloseBtn.classList.add('hidden-for-pdf');
    pdfProjektBtn.classList.add('hidden-for-pdf');

    // Tymczasowo usuń box-shadow dla .szkic-figure i jego potomnych
    const elements = szkicFigure.querySelectorAll('*');
    const originalBoxShadows = [];

    // Zapisz oryginalne wartości box-shadow i usuń je
    elements.forEach(element => {
        originalBoxShadows.push(element.style.boxShadow); // Zapisz oryginalny box-shadow
        element.style.boxShadow = 'none'; // Usuń box-shadow
    });

    // Usuń box-shadow również dla samego .szkic-figure
    originalBoxShadows.push(szkicFigure.style.boxShadow);
    szkicFigure.style.boxShadow = 'none';

    // Sprawdź, czy pole .podsumowanie-text-input jest puste
    const isPodsumowanieEmpty = podsumowanieTextInput.value.trim() === '';
    const originalPodsumowanieDisplay = podsumowanieTextInput.style.display;

    if (isPodsumowanieEmpty) {
        // Ukryj pole, jeśli jest puste
        podsumowanieTextInput.style.display = 'none';
    }

    // Zapisz oryginalny rozmiar czcionki dla .szkic-title
    const originalFontSize = szkicTitle.style.fontSize;

    // Tymczasowo ustaw większy rozmiar czcionki dla .szkic-title
    szkicTitle.style.fontSize = 'xx-large';

    // Temporarily change the styles
    //document.querySelectorAll('.dimension-label').forEach(function(element) {
        //element.style.fontSize = 'x-large';
        //element.style.margin = '-30';
    //});

    html2canvas(szicMainCon, { scale: 3 }).then(canvas => {
        const imgData = canvas.toDataURL('image/jpeg', 0.8);

        // Ustaw orientację strony PDF na podstawie warunku: szerokość > 500px oraz szerokość > wysokość
        const orientation = szkicWidth > 500 && szkicWidth > szkicHeight ? 'l' : 'p'; // 'l' - pozioma, 'p' - pionowa

        // Utwórz dokument PDF z odpowiednią orientacją
        const doc = new jsPDF(orientation, 'mm', 'a4');

        // Wymiary strony A4 w mm (z uwzględnieniem orientacji)
        const pageWidth = doc.internal.pageSize.getWidth(); // Szerokość strony
        const pageHeight = doc.internal.pageSize.getHeight(); // Wysokość strony

        // Wymiary obrazu w mm (przeliczając z pikseli, przyjmując DPI 96)
        const imgWidth = (canvas.width * 25.4) / 96; // Szerokość w mm
        const imgHeight = (canvas.height * 25.4) / 96; // Wysokość w mm

        // Oblicz skalowanie, aby obraz zmieścił się na jednej stronie A4
        const scale = Math.min(pageWidth / imgWidth, pageHeight / imgHeight);
        const scaledWidth = imgWidth * scale;
        const scaledHeight = imgHeight * scale;

        // Oblicz pozycję, aby wyśrodkować obraz na stronie
        const xOffset = (pageWidth - scaledWidth) / 2;
        const yOffset = (pageHeight - scaledHeight) / 2;

        // Dodaj obrazek do PDF
        doc.addImage(imgData, 'JPEG', xOffset, yOffset, scaledWidth, scaledHeight);

        // Przywróć widoczność przycisków po zakończeniu zapisywania
        szkicCloseBtn.classList.remove('hidden-for-pdf');
        pdfProjektBtn.classList.remove('hidden-for-pdf');

        // Przywróć box-shadow dla .szkic-figure i jego potomnych
        elements.forEach((element, index) => {
            element.style.boxShadow = originalBoxShadows[index]; // Przywróć oryginalny box-shadow
        });

        // Przywróć box-shadow dla samego .szkic-figure
        szkicFigure.style.boxShadow = originalBoxShadows[originalBoxShadows.length - 1];

        // Przywróć obramowanie
        szicMainCon.style.border = originalBorder;

        // Przywróć widoczność pola .podsumowanie-text-input, jeśli było ukryte
        if (isPodsumowanieEmpty) {
            podsumowanieTextInput.style.display = originalPodsumowanieDisplay;
        }

        // Przywróć oryginalny rozmiar czcionki dla .szkic-title
        szkicTitle.style.fontSize = originalFontSize;

    // Revert the styles back to their original state
    //document.querySelectorAll('.dimension-label').forEach(function(element) {
        //element.style.fontSize = ''; // Reset to original or default value
        //element.style.margin = '';
    //});

        doc.save('Szkic.pdf');
    });
}
function adjustContainerSize() {
    const szicMainCon = document.getElementById('szicMainCon');
    const szkicContainer = document.getElementById('szkicContainer');

    if (szicMainCon && szkicContainer) {
        const containerWidth = szkicContainer.offsetWidth;
        const containerHeight = szkicContainer.offsetHeight;

        // Ustaw szerokość i wysokość kontenera na podstawie zawartości
        szicMainCon.style.width = `${containerWidth}px`;
        szicMainCon.style.height = `${containerHeight}px`;
    }
}
    let Cena400 = 400;
    let Cena300 = 300;
    let Cena30 = 30;
    let Cena25 = 25;
    let Pianka6 = 6;	// do <0,5
    let Pianka15 = 15;	// 0,5m2=<1m2
    let Pianka30 = 30;	// 1m2=<1,5m2
    let Pianka60 = 60;	// 1,5m2=<2m2
    let Pianka100 = 100;// >=2m2
    let Rzep8 = 8;
    let Rzep20 = 20;
    let Rzep40 = 40;
    let Rzep70 = 70;
    let Rzep120 = 120;
    let Kontakt1 = 39;
    let Wysylka18 = 18;
    let Wysylka39 = 39;
    let Wysylka130 = 130;
    let Klej1 = 36;
    let removedElements = [];


//NIESTANDARDOWE STRZAŁKI
document.addEventListener('DOMContentLoaded', function () {
  const numberInputs = document.querySelectorAll('.number-input-container');

  numberInputs.forEach(container => {
    const input = container.querySelector('input[type="number"]');
    const arrowUp = container.querySelector('.arrow-up');
    const arrowDown = container.querySelector('.arrow-down');

    arrowUp.addEventListener('click', function () {
      input.stepUp();
      input.dispatchEvent(new Event('input')); // Wywołaj zdarzenie input, aby zaktualizować wynik
    });

    arrowDown.addEventListener('click', function () {
      input.stepDown();
      input.dispatchEvent(new Event('input')); // Wywołaj zdarzenie input, aby zaktualizować wynik
    });
  });
});

    const dianaList = Object.keys(fabricImages.DIANA);
    const lunaList = Object.keys(fabricImages.LUNA);
    const sweetList = Object.keys(fabricImages.SWEET);
    const tangoList = Object.keys(fabricImages.TANGO);
    const nubukList = Object.keys(fabricImages.NUBUK);
    const trendList = Object.keys(fabricImages.TREND);
    const olimpList = Object.keys(fabricImages.OLIMP);
    const trinityList = Object.keys(fabricImages.TRINITY);
    const rioList = Object.keys(fabricImages.RIO);
    const laryList = Object.keys(fabricImages.LARY);
    const ivaList = Object.keys(fabricImages.IVA);
    const ekoskoraList = Object.keys(fabricImages.EKO_SKÓRA);
    const colinList = Object.keys(fabricImages.COLIN);
    const kronosList = Object.keys(fabricImages.KRONOS);
    const rodosList = Object.keys(fabricImages.RODOS);
    const forestList = Object.keys(fabricImages.FOREST);
    const crownList = Object.keys(fabricImages.CROWN);
    const monolithList = Object.keys(fabricImages.MONOLITH);
    const evoList = Object.keys(fabricImages.EVO);
    const freshList = Object.keys(fabricImages.FRESH);
    const prestonList = Object.keys(fabricImages.PRESTON);
    const mattvelvetList = Object.keys(fabricImages.MATT_VELVET);
    const jasmineList = Object.keys(fabricImages.JASMINE_PIK);
    const rivieraList = Object.keys(fabricImages.RIVIERA);
    const gemmaList = Object.keys(fabricImages.GEMMA);
    const noworneverList = Object.keys(fabricImages.NOW_OR_NEVER);
    let rowCounter = 1; // Licznik do generowania unikalnych ID


function moveResult() {
    const resultContainer = document.querySelector('.result');
    const inputContainer = document.getElementById('inputContainer');
    resultContainer.classList.toggle('result-moved');
    
    // Zmień flex-direction dla #inputContainer
    if (resultContainer.classList.contains('result-moved')) {
        inputContainer.style.flexDirection = 'column';
    } else {
        inputContainer.style.flexDirection = 'row';
    }
}

    // Funkcja do przeciągania kontenera szkicu
function makeDraggable(element) {
    let isDragging = false;
    let offsetX, offsetY;

    // Funkcja do rozpoczęcia przeciągania
    function startDrag(e) {
        // Sprawdź, czy kliknięto na pole textarea
        if (e.target.tagName.toLowerCase() === 'textarea') {
            return; // Jeśli tak, nie rozpoczynaj przeciągania
        }

        isDragging = true;

        // Pobierz aktualną pozycję obiektu, uwzględniając transformacje
        const rect = element.getBoundingClientRect();
        const style = window.getComputedStyle(element);
        const transform = style.transform;

        let translateX = 0, translateY = 0;

        // Jeśli obiekt ma transformację, wyodrębnij wartości translate
        if (transform && transform !== 'none') {
            const matrix = new DOMMatrix(transform);
            translateX = matrix.m41; // translateX
            translateY = matrix.m42; // translateY
        }

        // Oblicz offsetX i offsetY, uwzględniając transformacje
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        offsetX = clientX - (rect.left - translateX);
        offsetY = clientY - (rect.top - translateY);

        // Zmień kursor na "chwytający"
        element.style.cursor = 'grabbing';
    }

    // Funkcja do przeciągania
    function drag(e) {
        if (isDragging) {
            // Oblicz nową pozycję obiektu
            const clientX = e.touches ? e.touches[0].clientX : e.clientX;
            const clientY = e.touches ? e.touches[0].clientY : e.clientY;

            const x = clientX - offsetX;
            const y = clientY - offsetY;

            // Ustaw nową pozycję
            element.style.left = `${x}px`;
            element.style.top = `${y}px`;
        }
    }

    // Funkcja do zakończenia przeciągania
    function endDrag() {
        isDragging = false;

        // Zmień kursor z powrotem na "chwytający"
        element.style.cursor = 'grab';
    }

    // Dodaj nasłuchiwanie zdarzeń myszy
    element.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);

    // Dodaj nasłuchiwanie zdarzeń dotykowych
    element.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
}

    // Ustawienie przeciągania dla kontenera szkicu
    const szicMainCon = document.getElementById('szicMainCon');
    if (szicMainCon) {
        makeDraggable(szicMainCon);
    }


    // Funkcja do tworzenia linii przerywanej SVG
function createDashedLine(x1, y1, x2, y2, strokeWidth = "1.7", strokeDasharray = "10") {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("stroke", "red");
    line.setAttribute("stroke-width", strokeWidth);
    line.setAttribute("stroke-dasharray", strokeDasharray); // Kontrola długości kresek i przerw
    return line;
}


    // Funkcja do rysowania szkicu PROJEKTU
function drawSzkic(optionsContainer) {
    const szkicFigure = document.getElementById('szkicFigure');
    const szkicFigureM = document.getElementById('szkicFigureM');
    const szkicTitle = document.getElementById('szkicTitle');
    const szkicContainer = document.getElementById('szkicContainer');

    // Usuń poprzednie elementy
    const existingPoint = szkicFigure.querySelector('.szkic-point');
    const existingLines = szkicFigure.querySelectorAll('.dashed-line');
    const existingInnerSquare = szkicFigure.querySelector('.inner-square');
    const existingInnerSquare2 = szkicFigure.querySelector('.inner-square2');
    const existingInnerSquareCircle = szkicFigure.querySelector('.inner-square-circle');
    const existingInnerSquareCircle1 = szkicFigure.querySelector('.inner-square-circle1');
    const existingInnerSquareCircle2 = szkicFigure.querySelectorAll('.inner-square-circle2');
    const existingInnerSquareCircle3 = szkicFigure.querySelectorAll('.inner-square-circle2');

    const existingKontaktAll = szkicFigure.querySelectorAll('.KontaktAll');
    const existingSzkicOpisX = szkicFigure.querySelector('.szkic-opisX');
    const existingSzkicOpisY = szkicFigure.querySelector('.szkic-opisY');
    const existingDimensionLabels = szkicFigure.querySelectorAll('.dimension-label');
    //const existingBottomTitle = szkicContainer2.querySelector('.szkic-podsumowanie');

    if (existingPoint) existingPoint.remove();
    existingLines.forEach(line => line.remove());
    if (existingInnerSquare) existingInnerSquare.remove();
    if (existingInnerSquare2) existingInnerSquare2.remove();
    if (existingInnerSquareCircle) existingInnerSquareCircle.remove();
    if (existingInnerSquareCircle1) existingInnerSquareCircle1.remove();
    existingInnerSquareCircle2.forEach(circle => circle.remove());
    existingInnerSquareCircle3.forEach(circle => circle.remove());
    existingKontaktAll.forEach(kontakt => kontakt.remove());
    if (existingSzkicOpisX) existingSzkicOpisX.remove();
    if (existingSzkicOpisY) existingSzkicOpisY.remove();
    existingDimensionLabels.forEach(label => label.remove());
    //if (existingBottomTitle) existingBottomTitle.remove();

    // Pobierz wartość z3 (liczba paneli)
    const z3 = parseFloat(optionsContainer.querySelector('.z3').value) || 0;

    // Pobierz wartości z pól x1 i y2
    const x1Input = optionsContainer.querySelector('.x1');
    const y2Input = optionsContainer.querySelector('.y2');
    let x1 = parseFloat(x1Input.value) || 0;
    let y2 = parseFloat(y2Input.value) || 0;

// Obetnij wartości x1 i y2 do jednej cyfry po przecinku
x1 = Math.floor(x1 * 10) / 10;
y2 = Math.floor(y2 * 10) / 10;

    // SPRAWDZANIE ŻEBY TYLKO JEDEN WYMIAR BYŁ POWYŻEJ 130cm - Dodaj walidację dla x1 i y2
    if (x1 > 130 && y2 > 130) {
        alert('Ze względów technologicznych tylko jeden z wymiarów może mieć powyżej 130cm');
        return;
    }

    // USTAWIENIE BLOKADY RYSOWANIA WIEKSZEJ FIGURY NIZ LIMIT W POLU - Walidacja wartości x1 i y2
    if (x1 < 10) {
        x1 = 10;
        //alert('Min. szerokość wynosi: 10 cm.');
    } else if (x1 > 350) {
        x1 = 350;
    }

    if (y2 < 10) {
        y2 = 10;
    } else if (y2 > 350) {
        y2 = 350;
    }


    // Przelicz wymiary z cm na piksele (1 cm = 37.7952755906 pikseli) i podziel przez 6
    const widthPx = x1 * 6;
    const heightPx = y2 * 6;

    // Ustaw wymiary figury
    szkicFigure.style.width = `${widthPx}px`;
    szkicFigure.style.height = `${heightPx}px`;
    szkicFigureM.style.width = `${widthPx - 1}px`;
    szkicFigureM.style.height = `${heightPx - 1}px`;

    // Minimalny odstęp od ścian kontenera
    const minPadding = 190;
    const containerWidth = widthPx + 2 * minPadding;
    const containerHeight = heightPx + 1 * minPadding;

    szkicContainer.style.width = `${Math.max(containerWidth, 600)}px`;
    szkicContainer.style.height = `${Math.max(containerHeight, 300)}px`;
    szkicContainer.style.display = 'block';

    // Pobierz wartości z pól "do lewej" i "do dołu"
    const leftInput = optionsContainer.querySelector('.left-input');
    const bottomInput = optionsContainer.querySelector('.bottom-input');

    const puszkiValue = parseInt(optionsContainer.querySelector('.puszki-select').value) || 1;
    const orientacjaValue = optionsContainer.querySelector('.orientacja-select').value;

    // Przelicz wartości na piksele
    let leftValue = parseFloat(leftInput.value) || 0;
    let bottomValue = parseFloat(bottomInput.value) || 0;

    // Zaokrąglij wartości do jednego miejsca po przecinku za pomocą Math.floor
    leftValue = Math.floor(leftValue * 10) / 10;
    bottomValue = Math.floor(bottomValue * 10) / 10;

    // Ogranicz wartości do zakresu
    const maxLeftValue = x1 + 5.0;
    const maxBottomValue = y2 + 5.0;

    if (leftValue > maxLeftValue) {
        leftValue = maxLeftValue;
        leftInput.value = maxLeftValue;
    }
    if (leftValue < -5.0) {
        leftValue = -5.0;
        leftInput.value = -5.0;
    }
    if (bottomValue > maxBottomValue) {
        bottomValue = maxBottomValue;
        bottomInput.value = maxBottomValue;
    }
    if (bottomValue < -5.0) {
        bottomValue = -5.0;
        bottomInput.value = -5.0;
    }

    const leftPx = leftInput.value * 6;
    const bottomPx = bottomInput.value * 6;


    // Formatowanie wartości do wyświetlania
    const formattedLeftValue = (leftValue % 1 === 0) ? leftValue.toFixed(0) : leftValue.toFixed(1);
    const formattedBottomValue = (bottomValue % 1 === 0) ? bottomValue.toFixed(0) : bottomValue.toFixed(1);


    // Oblicz centerX i centerY
    const centerX = leftPx; // Środek w osi X
    const centerY = heightPx - bottomPx; // Środek w osi Y
    const spacing = 54; // Odstęp między puszkami

    // Pobierz element "Kontakt-box4"
    const kontaktBox4 = optionsContainer.querySelector('.Kontakt-box4');

    // Warunek: jeśli z3 <= 1 oraz Kontakt-box4 ma klasę "active", rysuj linie, punkty, opisy i KontaktAll
    if (z3 <= 1 && kontaktBox4 && kontaktBox4.classList.contains('active')) {
        // Utwórz punkt
        const point = document.createElement('div');
        point.className = 'szkic-point';
        point.style.left = `${centerX}px`;
        point.style.top = `${centerY}px`;
        szkicFigure.appendChild(point);

        // Utwórz element szkic-opisX
        const szkicOpisX = document.createElement('div');
        szkicOpisX.className = 'szkic-opisX';
        szkicOpisX.innerHTML = `Wymiar: oś X<br><span style="font-size: medium">◀︎ </span> ${formattedLeftValue} cm <span style="font-size: medium"> ▶︎</span>`;
        szkicOpisX.style.left = `${centerX - 100 - 48}px`;
        szkicOpisX.style.top = `${centerY - 60 - 27}px`;
        szkicFigure.appendChild(szkicOpisX);

        // Utwórz element szkic-opisY
        const szkicOpisY = document.createElement('div');
        szkicOpisY.className = 'szkic-opisY';
        szkicOpisY.innerHTML = `Wymiar: oś Y<br><span style="font-size: medium">▲</span> ${formattedBottomValue} cm <span style="font-size: medium">▼</span>`;
        szkicOpisY.style.left = `${centerX + 35}px`;
        szkicOpisY.style.top = `${centerY + 36}px`;
        szkicFigure.appendChild(szkicOpisY);

        // Rysuj linie
        drawHorizontalLine(heightPx, bottomPx, leftPx);
        drawVerticalLine(bottomPx, heightPx, leftPx);

        // Utwórz i umieść elementy KontaktAll
        for (let i = 0; i < puszkiValue; i++) {
            const kontaktAll = document.createElement('div');
            kontaktAll.className = 'KontaktAll';
            kontaktAll.style.position = 'absolute';

            if (orientacjaValue === "pionowo") {
                kontaktAll.style.left = `${centerX}px`;
                kontaktAll.style.top = `${centerY + (i - (puszkiValue - 1) / 2) * spacing}px`;
            } else if (orientacjaValue === "poziomo") {
                kontaktAll.style.left = `${centerX + (i - (puszkiValue - 1) / 2) * spacing}px`;
                kontaktAll.style.top = `${centerY}px`;
            } else {
                kontaktAll.style.left = `${centerX}px`;
                kontaktAll.style.top = `${centerY}px`;
            }

            szkicFigure.appendChild(kontaktAll);

            const innerSquare = document.createElement('div');
            innerSquare.className = 'inner-square';
            kontaktAll.appendChild(innerSquare);

            const innerSquare2 = document.createElement('div');
            innerSquare2.className = 'inner-square2';
            kontaktAll.appendChild(innerSquare2);

            const innerSquareCircle = document.createElement('div');
            innerSquareCircle.className = 'inner-square-circle';
            kontaktAll.appendChild(innerSquareCircle);

    const innerSquareCircle1 = document.createElement('div');
    innerSquareCircle1.className = 'inner-square-circle1';
    innerSquareCircle1.style.position = 'absolute';
    innerSquareCircle1.style.bottom = '2px'; // Ustaw na środek
    innerSquareCircle1.style.left = '50%'; // Ustaw na środek
    kontaktAll.appendChild(innerSquareCircle1);

            const innerSquareCircle2 = document.createElement('div');
            innerSquareCircle2.className = 'inner-square-circle2';
    innerSquareCircle2.style.position = 'absolute';
    innerSquareCircle2.style.left = '6px';
            kontaktAll.appendChild(innerSquareCircle2);

            const innerSquareCircle3 = document.createElement('div');
            innerSquareCircle3.className = 'inner-square-circle2';
    innerSquareCircle3.style.position = 'absolute';
    innerSquareCircle3.style.right = '2px';
            kontaktAll.appendChild(innerSquareCircle3);
        }
    }

    // Dodaj etykiety wymiarów boków
    const dimensionLabelTop = document.createElement('div');
    dimensionLabelTop.className = 'dimension-label';
    dimensionLabelTop.textContent = `${x1} cm`;
    dimensionLabelTop.style.position = 'absolute';
    dimensionLabelTop.style.top = `-30px`; // Pozycja nad górnym bokiem
    dimensionLabelTop.style.left = `50%`;
    dimensionLabelTop.style.transform = 'translateX(-50%)';
    szkicFigure.appendChild(dimensionLabelTop);

    const dimensionLabelBottom = document.createElement('div');
    dimensionLabelBottom.className = 'dimension-label';
    dimensionLabelBottom.textContent = `${x1} cm`;
    dimensionLabelBottom.style.position = 'absolute';
    dimensionLabelBottom.style.bottom = `-30px`; // Pozycja pod dolnym bokiem
    dimensionLabelBottom.style.left = `50%`;
    dimensionLabelBottom.style.transform = 'translateX(-50%)';
    szkicFigure.appendChild(dimensionLabelBottom);

    const dimensionLabelLeft = document.createElement('div');
    dimensionLabelLeft.className = 'dimension-label';
    dimensionLabelLeft.textContent = `${y2} cm`;
    dimensionLabelLeft.style.position = 'absolute';
    dimensionLabelLeft.style.left = `-45px`; // Pozycja na lewo od lewego boku
    dimensionLabelLeft.style.top = `50%`;
    dimensionLabelLeft.style.transform = 'translateY(-50%) rotate(-90deg)';
    szkicFigure.appendChild(dimensionLabelLeft);

    const dimensionLabelRight = document.createElement('div');
    dimensionLabelRight.className = 'dimension-label';
    dimensionLabelRight.textContent = `${y2} cm`;
    dimensionLabelRight.style.position = 'absolute';
    dimensionLabelRight.style.right = `-45px`; // Pozycja na prawo od prawego boku
    dimensionLabelRight.style.top = `50%`;
    dimensionLabelRight.style.transform = 'translateY(-50%) rotate(-90deg)';
    szkicFigure.appendChild(dimensionLabelRight);

    // Ustaw tytuł szkicu
    const variantLabel = optionsContainer.querySelector('.variant-label').textContent;
    szkicTitle.textContent = variantLabel;

    // Dodaj drugi napis jako dodatkową zawartość do szkicTitle
    //const secondTitle = document.createElement('div');
    //secondTitle.className = 'szkic-podsumowanie';
    //secondTitle.textContent = variantLabel;
    //szkicTitle.appendChild(secondTitle);

    updateButtonState(optionsContainer);

    // Ustaw nazwę zestawu i dane z pól w "szkic-container2"
    ustawNazweZestawu(optionsContainer);
}

// Funkcja do rysowania linii poziomej
function drawHorizontalLine(heightPx, bottomPx, leftPx) {
    const horizontalLine = document.createElement('div');
    horizontalLine.className = 'dashed-line horizontal-line';
    horizontalLine.style.top = `${heightPx - bottomPx - 1}px`;
    if (leftPx < 0) {
        horizontalLine.style.left = `${leftPx}px`;
        horizontalLine.style.width = `${Math.abs(leftPx)}px`;
    } else {
        horizontalLine.style.left = '0';
        horizontalLine.style.width = `${leftPx}px`;
    }
    szkicFigure.appendChild(horizontalLine);
}

// Funkcja do rysowania linii pionowej
function drawVerticalLine(bottomInputValue, heightPx, leftPx) {
    const verticalLine = document.createElement('div');
    verticalLine.className = 'dashed-line vertical-line';
    verticalLine.style.left = `${leftPx - 1}px`;
    if (bottomInputValue > 0) {
        verticalLine.style.height = `${bottomInputValue}px`;
        verticalLine.style.top = `${heightPx - bottomInputValue}px`;
    } else {
        verticalLine.style.height = `${Math.abs(bottomInputValue)}px`;
        verticalLine.style.top = `${heightPx}px`;
    }
    szkicFigure.appendChild(verticalLine);
}


    // Funkcja do otwierania szkicu
function openSzkic(event) {
    const szicMainCon = document.getElementById('szicMainCon');
    const button = event.target;

    if (button.classList.contains('active')) {
        // Jeśli przycisk jest już aktywny, zamknij szkic i odznacz przycisk
        closeSzkic();
    } else {
        // Usuń klasę 'active' z wszystkich przycisków "ZobaczProjek"
        const allButtons = document.querySelectorAll('button.ZobaczProjek, button.material-symbols-outlined');
        allButtons.forEach(btn => btn.classList.remove('active'));

        // Dodaj klasę 'active' do aktualnie naciśniętego przycisku
        button.classList.add('active');

        // Ustaw widoczność kontenera szkicu
        szicMainCon.style.display = 'block';

        // Rysuj szkic
        const optionsContainer = button.closest('.options');
        drawSzkic(optionsContainer);
    }
}

    // Funkcja do zamykania szkicu
function closeSzkic() {
    const szicMainCon = document.getElementById('szicMainCon');
    szicMainCon.style.display = 'none';
    szicMainCon.style.top = '50px';
    szicMainCon.style.left = '50px';

    // Usuń klasę 'active' z wszystkich przycisków "ZobaczProjek"
    const allButtons = document.querySelectorAll('button.ZobaczProjek, button.material-symbols-outlined');
    allButtons.forEach(button => button.classList.remove('active'));
}

    // Nasłuchiwanie zdarzenia click dla obrazka tkaniny
document.addEventListener('DOMContentLoaded', function () {
    const images = document.querySelectorAll('img.selected-image');
    images.forEach(image => {
        image.addEventListener('click', function (event) {
            event.stopPropagation();
            this.classList.toggle('zoomed');
            if (this.classList.contains('zoomed')) {
                addScrollButtons(this);
            } else {
                removeScrollButtons(this); // Przekazujemy konkretny obrazek
            }
        });
    });
});

//Sprawdzanie widoczności szicMainCon, po edycji pola row3
function updateButtonState(optionsContainer) {
    const szicMainCon = document.getElementById('szicMainCon');
    if (szicMainCon && szicMainCon.style.display === 'block') {
        // Usuń klasę 'active' z wszystkich przycisków "ZobaczProjek"
        const allButtons = document.querySelectorAll('button.ZobaczProjek');
        allButtons.forEach(btn => btn.classList.remove('active'));

        // Dodaj klasę 'active' do przycisku "ZobaczProjek" w odpowiednim zestawie
        const zobaczProjekBtn = optionsContainer.querySelector('.ZobaczProjek');
        if (zobaczProjekBtn) {
            zobaczProjekBtn.classList.add('active');
        }
    }
}


    // Dodaj nasłuchiwanie zdarzeń dla przycisku "ZOBACZ PROJEKT"
document.addEventListener('DOMContentLoaded', function () {
    // Dodaj nasłuchiwanie zdarzeń dla przycisku "ZOBACZ PROJEKT"
    const zobaczProjekBtn = document.querySelector('.ZobaczProjek');
    if (zobaczProjekBtn) {
        zobaczProjekBtn.addEventListener('click', function (event) {
            openSzkic(event);
        });
        //zobaczProjekBtn.addEventListener('click', openSzkic);
    }

    // Dodaj nasłuchiwanie zdarzeń dla przycisku "material-symbols-outlined"
    const ZobaczPanelBtn = document.querySelector('button.material-symbols-outlined');
    if (ZobaczPanelBtn) {
        ZobaczPanelBtn.addEventListener('click', function (event) {
            openSzkic(event);
        });
    }
});

    // Funkcja do przełączania stanu przycisków
    function toggleButtonState(button) {
        if (button.getAttribute('data-state') === 'off') {
            button.setAttribute('data-state', 'on');
        } else {
            button.setAttribute('data-state', 'off');
        }
        calculateResult(); // Przelicz wynik po zmianie stanu
    }


//Upewnij się, że wywołujesz tę funkcję również po załadowaniu strony, aby działała dla pierwszego zestawu

document.addEventListener('DOMContentLoaded', function () {
    addEventListenersToNewElements();
});

const szkicContainer2 = document.getElementById('szkicContainer2');

function ustawNazweZestawu(optionsContainer) {
    const szkicTitle = document.getElementById('szkicTitle');
    const szkicTitleText = szkicTitle.textContent;
    
    const x1 = parseFloat(optionsContainer.querySelector('.x1').value);
    const y2 = parseFloat(optionsContainer.querySelector('.y2').value);
    const z3 = parseFloat(optionsContainer.querySelector('.z3').value);
    const leftInput = optionsContainer.querySelector('.left-input').value;
    const bottomInput = optionsContainer.querySelector('.bottom-input').value;
    const kontaktBox = optionsContainer.querySelector('.Kontakt-box4');
    
    // Usuń poprzednie elementy z "szkic-container2"
    while (szkicContainer2.firstChild) {
        szkicContainer2.removeChild(szkicContainer2.firstChild);
    }
    
    // Utwórz nowy element z nazwą zestawu
    const zestawTitle = document.createElement('div');
    zestawTitle.className = 'szkic-podsumowanie';
    zestawTitle.innerHTML = `<p><b><span style="font-size: x-large;">${szkicTitleText}</span></b></p>`;
    
    // Dodaj dane panelu tylko wtedy, gdy pola x1, y2 i z3 są uzupełnione
    if (!isNaN(x1) && !isNaN(y2) && !isNaN(z3)) {
        const panelDetails = document.createElement('p');
        panelDetails.innerHTML = `PANEL: ${z3} szt x [szer: ${x1} cm x wys: ${y2} cm]`;
        zestawTitle.appendChild(panelDetails);
    }
    
    // Dodaj dane kontaktu tylko wtedy, gdy Kontakt-box4 jest aktywny i z3 <= 1
    if (kontaktBox && kontaktBox.classList.contains('active') && !isNaN(x1) && !isNaN(y2) && (!isNaN(z3) && z3 <= 1 || isNaN(z3))) {
        const kontaktDetails = document.createElement('p');
        kontaktDetails.innerHTML = `Wymiary do środka ramki kontaktu: od lewej (szer): ${leftInput} cm, od dołu (wys):  ${bottomInput} cm`;
        zestawTitle.appendChild(kontaktDetails);
    }
        // Dodaj pole do wprowadzenia tekstu z klasą i atrybutem maxlength
        const textArea = document.createElement('textarea');
        textArea.placeholder = 'Jeśli chcesz zapisać projekt (PDF) z dodatkowym opisem, wprowadź go tutaj - Max 50 znaków.';
        textArea.className = 'podsumowanie-text-input'; // Dodaj klasę
        textArea.maxLength = 50; // Ustaw maksymalną liczbę znaków na 500
        textArea.value = optionsContainer.dataset.text || ''; // Odczytaj zapisaną wartość
        textArea.addEventListener('input', function() {
            optionsContainer.dataset.text = textArea.value; // Zapisz wartość w atrybucie data
        });
        zestawTitle.appendChild(textArea);

    // Dodaj nowy element do "szkic-container2"
    szkicContainer2.appendChild(zestawTitle);
}
// Dodaj nasłuchiwanie dla opisu szkicu
function addDynamicUpdateListeners(optionsContainer) {
    const inputs = optionsContainer.querySelectorAll('.x1, .y2, .z3, .left-input, .bottom-input');
    inputs.forEach(input => {
        input.addEventListener('input', () => {
            ustawNazweZestawu(optionsContainer);
        });
    });
}
// Dodaj nasłuchiwanie zdarzeń dla pierwszego zestawu po załadowaniu strony
document.addEventListener('DOMContentLoaded', function () {
    const firstOptionsContainer = document.querySelector('.options');
    if (firstOptionsContainer) {
        addDynamicUpdateListeners(firstOptionsContainer);
    }
});


    // Dodaj nasłuchiwanie zdarzeń dla przycisków
    document.addEventListener('DOMContentLoaded', function () {
        // Dodaj nasłuchiwanie zdarzeń dla pierwszego zestawu
        const firstRow = document.querySelector('.options');
        if (firstRow) {

            const x1Input = firstRow.querySelector('.x1');
            const y2Input = firstRow.querySelector('.y2');
            const z3Input = firstRow.querySelector('.z3');

            if (x1Input) {
                x1Input.addEventListener('input', function () {
                    calculateResult();
                    if (szkicContainer.style.display === 'block') {
                        drawSzkic(firstRow);
                    }
                });
            }
            if (y2Input) {
                y2Input.addEventListener('input', function () {
                    calculateResult();
                    if (szkicContainer.style.display === 'block') {
                        drawSzkic(firstRow);
                    }
                });
            }
            if (z3Input) {
                z3Input.addEventListener('input', function () {
                    calculateResult();
                    if (szkicContainer.style.display === 'block') {
                        drawSzkic(firstRow);
                    }
                });
            }

            // Dodaj nasłuchiwanie zdarzeń dla pierwszej listy subList
            const firstSubList = document.querySelector('#subList1');
            if (firstSubList) {
                firstSubList.addEventListener('change', calculateResult);
            }

            // Dodaj nasłuchiwanie zdarzeń dla nowo dodanych list subList
            document.addEventListener('change', function (event) {
                if (event.target.classList.contains('subList')) {
                    calculateResult(); // Wywołaj funkcję po zmianie wyboru
                }
            });

            // Nasłuchiwanie dla piankaBox
            const piankaBox = firstRow.querySelector('.Pianka-box2');
            if (piankaBox) {
                piankaBox.addEventListener('click', function () {
                    this.classList.toggle('active');
                    calculateResult();
                });
            }

            // Nasłuchiwanie dla rzepBox
            const rzepBox = firstRow.querySelector('.Rzep-box3');
            if (rzepBox) {
                rzepBox.addEventListener('click', function () {
                    this.classList.toggle('active');
                    calculateResult();
                });
            }

            // Nasłuchiwanie dla kontaktBox
const kontaktBox = firstRow.querySelector('.Kontakt-box4');
if (kontaktBox) {
    kontaktBox.addEventListener('click', function () {
        this.classList.toggle('active');
        calculateResult();
        if (szkicContainer.style.display === 'block') {
            drawSzkic(firstRow);
        }

        // Pokaż/ukryj kontener row3 po kliknięciu na "Kontakt"
        const row3 = this.closest('.options').querySelector('.row3');
        if (row3) {
            if (this.classList.contains('active')) {
                row3.style.display = 'block'; // Pokaż row3

                // Sprawdź, czy "szicMainCon" jest widoczne
                const szicMainCon = document.getElementById('szicMainCon');
                if (!szicMainCon || szicMainCon.style.display === 'none') {
                    // Usuń klasę 'active' z przycisku "ZobaczProjek", tylko jeśli "szicMainCon" nie jest widoczne
                    const zobaczProjekBtn = this.closest('.options').querySelector('.ZobaczProjek');
                    if (zobaczProjekBtn) {
                        zobaczProjekBtn.classList.remove('active');
                    }
                }
            } else {
                row3.style.display = 'none'; // Ukryj row3
            }
        }
    });
}


            // Nasłuchiwanie dla danych z kontaktBox
            const leftInput = firstRow.querySelector('.left-input');
            const bottomInput = firstRow.querySelector('.bottom-input');
            const puszkiSelect = firstRow.querySelector('.puszki-select');
            const orientacjaSelect = firstRow.querySelector('.orientacja-select');

            if (leftInput) {
                leftInput.addEventListener('input', function () {
                    calculateResult();
                    if (szkicContainer.style.display === 'block') {
                        drawSzkic(firstRow);
                    }
                });
            }
            if (bottomInput) {
                bottomInput.addEventListener('input', function () {
                    calculateResult();
                    if (szkicContainer.style.display === 'block') {
                        drawSzkic(firstRow);
                    }
                });
            }
            if (puszkiSelect) {
                puszkiSelect.addEventListener('change', function () {
                    calculateResult();
                    if (szkicContainer.style.display === 'block') {
                        drawSzkic(firstRow);
                    }
                });
            }
            if (orientacjaSelect) {
                orientacjaSelect.addEventListener('change', function () {
                    calculateResult();
                    if (szkicContainer.style.display === 'block') {
                        drawSzkic(firstRow);
                    }
                });
            }

            // Nasłuchiwanie zdarzeń dla puszki-select
            const puszkiSelects = document.querySelectorAll('.puszki-select');
            puszkiSelects.forEach(puszkiSelect => {
                puszkiSelect.addEventListener('change', function () {
                    const row3_2b = this.closest('.row3').querySelector('.row3-2b');
                    if (this.value !== "1") {
                        row3_2b.style.display = 'block'; // Pokaż row3-2b
                    } else {
                        row3_2b.style.display = 'none'; // Ukryj row3-2b
                    }
                });
            });

            // Nasłuchiwanie dla pola z3 w pierwszym zestawie
            if (z3Input) {
                z3Input.addEventListener('input', function () {
                    const kontaktBox = this.closest('.options').querySelector('.Kontakt-box4');
                    const row3 = this.closest('.options').querySelector('.row3');
                    if (this.value > 1) {
                        kontaktBox.style.display = 'none';
                        row3.style.display = 'none'; // Ukryj row3
                    } else {
                        // Pokaż row3 tylko jeśli Kontakt-box4 jest aktywny
                        if (kontaktBox.classList.contains('active')) {
                            row3.style.display = 'block'; // Pokaż row3
                        } else {
                            row3.style.display = 'none'; // Ukryj row3
                        }
                        kontaktBox.style.display = 'flex'; // Pokaż Kontakt-box4
                    }
                });
            }
        }
    });


//Nasłuchiwania zdarzeń dla nowych zestawów i pól left-input i bottom-input żeby w drawszkic nie były wieksze wartości niz wpisane w pola. MOZLIWE ZE DZIAŁA BEZ TEJ FUNKCJI
document.addEventListener('DOMContentLoaded', function () {
    const leftInputs = document.querySelectorAll('.left-input');
    const bottomInputs = document.querySelectorAll('.bottom-input');

    leftInputs.forEach(input => {
        input.addEventListener('input', function () {
            const optionsContainer = input.closest('.options');
            if (szkicContainer.style.display === 'block') {
                drawSzkic(optionsContainer);
            }
        });
    });

    bottomInputs.forEach(input => {
        input.addEventListener('input', function () {
            const optionsContainer = input.closest('.options');
            if (szkicContainer.style.display === 'block') {
                drawSzkic(optionsContainer);
            }
        });
    });
});



    // Nasłuchiwanie zdarzeń dla checkboxów w sekcji "dodatki"
    const dodatkiCheckboxes = document.querySelectorAll('.dodatki input[type="checkbox"]');
    dodatkiCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', calculateResult);
    });

    // Nasłuchiwanie zdarzeń dla pola liczbowego "klej-ilosc"
    const klejIloscInput = document.querySelector('.klej-ilosc');
    if (klejIloscInput) {
        klejIloscInput.addEventListener('input', calculateResult);
    }

    // Inicjalizacja przycisków usuwania
    updateRemoveButtons();

    function copyResultToClipboard() {
        calculateResult(); // Odśwież wyniki przed kopiowaniem
        const resultElement = document.getElementById('result-content');
        const range = document.createRange();
        range.selectNode(resultElement);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        try {
            document.execCommand('copy');
            alert('Wynik skopiowany do schowka!');
        } catch (err) {
            console.error('Błąd podczas kopiowania do schowka:', err);
        }

        selection.removeAllRanges();
    }



// Funkcja do sprawdzania warunków i pokazywania/ukrywania przycisku
function updateZobaczProjekVisibility(optionsContainer) {
    const puszkiSelect = optionsContainer.querySelector('.puszki-select');
    const orientacjaSelect = optionsContainer.querySelector('.orientacja-select');
    const zobaczProjekBtn = optionsContainer.querySelector('.ZobaczProjek');
    const leftInput = optionsContainer.querySelector('.left-input');
    const bottomInput = optionsContainer.querySelector('.bottom-input');

    if (!puszkiSelect || !orientacjaSelect || !zobaczProjekBtn || !leftInput || !bottomInput) {
        return; // Jeśli brakuje któregoś z elementów, zakończ funkcję
    }

    const isPuszki1 = puszkiSelect.value === "1";
    const isOrientacjaValid = orientacjaSelect.value === "pionowo" || orientacjaSelect.value === "poziomo";
    const isPuszkiUnselected = puszkiSelect.value === ""; // Sprawdź, czy wartość jest pusta (domyślna opcja)
    const areInputsFilled = leftInput.value.trim() !== "" && bottomInput.value.trim() !== ""; // Sprawdź, czy pola są uzupełnione

    // Pokaż przycisk "ZobaczProjek" tylko jeśli:
    // - wybrano "1 puszka ⛒" LUB "PIONOWO ⭥" / "POZIOMO ⭤"
    // - ORAZ pola "left-input" i "bottom-input" są uzupełnione
    // - ALE NIE pokazuj, jeśli wybrano "Wybierz ilość"
    if ((isPuszki1 || isOrientacjaValid) && areInputsFilled && !isPuszkiUnselected) {
        zobaczProjekBtn.style.display = 'block';
    } else {
        zobaczProjekBtn.style.display = 'none';
    }
}

// Funkcja do dodania nasłuchiwania zdarzeń dla danego zestawu
function addEventListenersToOptions(optionsContainer) {
    const puszkiSelect = optionsContainer.querySelector('.puszki-select');
    const orientacjaSelect = optionsContainer.querySelector('.orientacja-select');
    const leftInput = optionsContainer.querySelector('.left-input');
    const bottomInput = optionsContainer.querySelector('.bottom-input');

    // Nasłuchiwanie zdarzeń dla puszki-select
    if (puszkiSelect) {
        puszkiSelect.addEventListener('change', () => updateZobaczProjekVisibility(optionsContainer));
    }

    // Nasłuchiwanie zdarzeń dla orientacja-select
    if (orientacjaSelect) {
        orientacjaSelect.addEventListener('change', () => updateZobaczProjekVisibility(optionsContainer));
    }

    // Nasłuchiwanie zdarzeń dla pól left-input i bottom-input
    if (leftInput) {
        leftInput.addEventListener('input', () => updateZobaczProjekVisibility(optionsContainer));
    }
    if (bottomInput) {
        bottomInput.addEventListener('input', () => updateZobaczProjekVisibility(optionsContainer));
    }

    // Inicjalizacja widoczności przycisku
    updateZobaczProjekVisibility(optionsContainer);
}

// Dodaj nasłuchiwanie zdarzeń dla pierwszego zestawu po załadowaniu strony
document.addEventListener('DOMContentLoaded', function () {
    const firstOptionsContainer = document.querySelector('.options');
    if (firstOptionsContainer) {
        addEventListenersToOptions(firstOptionsContainer);
    }
});

//ZMIANA KOLORU DOMYLSNEGO TESKTU W LISCIE ROW3
function updateSelectColor(selectElement) {
    if (selectElement.value === "" || selectElement.value === "Wybierz ilość") {
        selectElement.style.color = '#dc5e5e'; // Kolor zielony dla domyślnej opcji
    } else {
        selectElement.style.color = '#468bc6'; // Kolor domyślny dla innych opcji
    }
}

// Funkcja do dodania nasłuchiwania zdarzeń dla elementu .orientacja-select i .puszki-select
function addSelectListeners(selectElement) {
    if (selectElement) {
        selectElement.addEventListener('change', function() {
            updateSelectColor(selectElement);
        });
        updateSelectColor(selectElement); // Ustaw kolor na starcie
    }
}

// Dodaj nasłuchiwanie zdarzeń dla istniejących elementów .orientacja-select i .puszki-select
document.addEventListener('DOMContentLoaded', function () {
    const orientacjaSelects = document.querySelectorAll('.orientacja-select');
    const puszkiSelects = document.querySelectorAll('.puszki-select');
    
    orientacjaSelects.forEach(addSelectListeners);
    puszkiSelects.forEach(addSelectListeners);
});


function addRow() {
    rowCounter++;
    const container = document.getElementById('inputContainer');
    const newRow = document.createElement('div');
    newRow.className = 'options';
    
    // Ustaw flex-direction w zależności od pozycji wyniku
    if (container.style.flexDirection === 'column') {
        newRow.style.flexDirection = 'column'; // Ustaw układ kolumnowy
    } else {
        newRow.style.flexDirection = 'row'; // Ustaw układ wierszowy
    }

    newRow.innerHTML = `
        <div class="header-row">
            <div class="variant-label">Zestaw nr. ${rowCounter}</div>
            <div class="fabricContainer">
                <select id="mainSelect${rowCounter}" onchange="showSubList(this)" class="mainSelect">
                    <option value="tkanina" disabled selected>Wybierz tkaninę</option>
                    <option value="WLASNA">Własna tkanina</option>
                </select>
                <div id="subListContainer${rowCounter}" class="hidden">
                    <select id="subList${rowCounter}" onchange="showImage(this)" class="subList">
                        <option value="" disabled selected>Wybierz kolor tkaniny</option>
                        <!-- Opcje będą dodane dynamicznie -->
                    </select>
                    <div id="imageContainer${rowCounter}" class="image-container">
                        <img src="" alt="Wybrana grafika">
                    </div>
                </div>
            </div>
        </div>
        <div class="input-group">
            <div class="row">
                <label class="label">szerokość (cm)</label>
<div class="szer">
<div class="number-input-container">
                <input type="number" placeholder="0" class="x1" max="350" min="10" step="0.1">
  <div class="arrow-up">+</div>
  <div class="arrow-down">-</div>
</div>

  <span class="unit">cm</span>
</div>


            </div>
            <span class="x-sign">✖</span>
            <div class="row">
                <label class="label">wysokość (cm)</label>
<div class="wys">
<div class="number-input-container">
                <input type="number" placeholder="0" class="y2" max="350" min="10" step="0.1">
  <div class="arrow-up">+</div>
  <div class="arrow-down">-</div>
</div>
<span class="unit">cm</span>
                </div>
</div>
                <div class="rowZ">
                <label class="label">ilość paneli</label>

<div class="szt">
<div class="number-input-container">

                <input type="number" placeholder="0" class="z3" max="99" min="1" step="1">
  <div class="arrow-up">+</div>
  <div class="arrow-down">-</div>
</div>
<span class="unit">szt</span>
</div>
                </div>
            <button class="material-symbols-outlined">visibility</button>
            </div>
        <div class="row2">
            <div class="fototkanina">
                <div class="image-box1">Wybierz tkaninę<br>z listy powyżej</div>
            </div>
            <div class="opcje">
                <div class="Pianka-box2">
                    <img src="https://rasek.pl/public/upload/sellasist_cache/thumb_6e2ff697d2ec984db51988eb9d9936f0-jpg.webp" alt="Pianka"><p>Podwójna pianka</p>
                </div>
                <div class="Rzep-box3">
                    <img src="https://rasek.pl/public/upload/sellasist_cache/thumb_8e3b09957d21dea4ef69a0a26bccf103-jpg.webp" alt="Rzep"><p>Rzep montażowy</p>
                </div>
                <div class="Kontakt-box4">
                    <img src="https://rasek.pl/public/upload/sellasist_cache/thumb_08d474ce00366886fcb94554d229f2d0-jpg.webp" alt="Kontakt"><p>Otwór na kontakt</p>
                </div>
            </div>
        </div>
        <div class="row3 hidden">
            <div class="pomiar">Wprowadź <b>POŁOŻENIE ŚRODKA RAMKI KONTAKTU</b> do boków panelu</div>
            <div class="input-group">
                <div class="row3-1">
                    <label class="label">do lewego (cm)</label>
                    <input type="number" placeholder="0" class="left-input" max="367.5" min="-5.0" step="0.1">
                </div>
                <div class="row3-1">
                    <label class="label">do dolnego (cm)</label>
                    <input type="number" placeholder="0" class="bottom-input" max="367.5" min="-5.0" step="0.1">
                </div>
                <div class="row3-2a">
                    <label class="label">ilość puszek w ścianie</label>
                    <select class="puszki-select">
                        <option value="" disabled selected>Wybierz ilość</option>
                        <option value="1">1 puszka ⛒</option>
                        <option value="2">2 puszki ⛒⛒</option>
                        <option value="3">3 puszki ⛒⛒⛒</option>
                        <option value="4">4 puszki ⛒⛒⛒⛒</option>
                    </select>
                </div>
                <div class="row3-2b">
                    <label class="label">układ puszek</label>
                    <select class="orientacja-select">
                        <option value="" disabled selected>Ułożenie</option>
                        <option value="pionowo">PIONOWO ⭥</option>
                        <option value="poziomo">POZIOMO ⭤</option>
                    </select>
                </div>
                <div class="row3-2c">
                    <button class="ZobaczProjek">ZOBACZ<br>PROJEKT</button>
                </div>
            </div>
        </div>
        <button class="remove-btn" onclick="removeRow(this)">x</button>
    `;
    container.appendChild(newRow);


    // DYNAMICZNIE WYPEŁNIANA LISTA TKANIN SELECT DLA NOWYCH ZESTAWÓW
    const mainSelect = newRow.querySelector(`#mainSelect${rowCounter}`);
    for (const fabricType in fabricImages) {
        const option = document.createElement('option');
        option.value = fabricType;
        option.textContent = fabricType;
        mainSelect.appendChild(option);
    }

    // Dodaj nasłuchiwanie zdarzeń dla nowego wiersza
    addEventListenersToOptions(newRow);

    // Dodaj nasłuchiwanie zdarzeń dla nowych elementów .orientacja-select i .puszki-select
    const newOrientacjaSelect = newRow.querySelector('.orientacja-select');
    const newPuszkiSelect = newRow.querySelector('.puszki-select');

    addEventListenersToNewElements();
    addSelectListeners(newOrientacjaSelect);
    addSelectListeners(newPuszkiSelect);

    // Dodaj nasłuchiwanie zdarzeń dla nowych pól w row3
    const puszkiSelect = newRow.querySelector('.puszki-select');
    const orientacjaSelect = newRow.querySelector('.orientacja-select');
    const zobaczProjekBtn = newRow.querySelector('.ZobaczProjek');
    const ZobaczPanelBtn = newRow.querySelector('button.material-symbols-outlined');
    const leftInput = newRow.querySelector('.left-input');
    const bottomInput = newRow.querySelector('.bottom-input');

    // NASŁUCHIWANIE WARUNKOW DLA WIDOCZNOSCI PRZYCISKU DO PROJEKTU
    // usunąć po sprawdzenia że działa ok wszsytko
    /* function updateZobaczProjekVisibility() {
        const isPuszki1 = puszkiSelect.value === "1";
        const isOrientacjaValid = orientacjaSelect.value === "pionowo" || orientacjaSelect.value === "poziomo";
        const isPuszkiUnselected = puszkiSelect.value === ""; // Sprawdź, czy wartość jest pusta (domyślna opcja)
        const areInputsFilled = leftInput.value.trim() !== "" && bottomInput.value.trim() !== ""; // Sprawdź, czy pola są uzupełnione

        // Pokaż przycisk "ZobaczProjek" tylko jeśli:
        // - wybrano "1 puszka ⛒" LUB "PIONOWO ⭥" / "POZIOMO ⭤"
        // - ORAZ pola "left-input" i "bottom-input" są uzupełnione
        // - ALE NIE pokazuj, jeśli wybrano "Wybierz ilość"
        if ((isPuszki1 || isOrientacjaValid) && areInputsFilled && !isPuszkiUnselected) {
            zobaczProjekBtn.style.display = 'block';
        } else {
            zobaczProjekBtn.style.display = 'none';
        }
    }

    // Nasłuchiwanie zdarzeń dla puszki-select
    if (puszkiSelect) {
        puszkiSelect.addEventListener('change', updateZobaczProjekVisibility);
    }

    // Nasłuchiwanie zdarzeń dla orientacja-select
    if (orientacjaSelect) {
        orientacjaSelect.addEventListener('change', updateZobaczProjekVisibility);
    }

    // Nasłuchiwanie zdarzeń dla pól left-input i bottom-input
    if (leftInput) {
        leftInput.addEventListener('input', updateZobaczProjekVisibility);
    }
    if (bottomInput) {
        bottomInput.addEventListener('input', updateZobaczProjekVisibility);
    }

    // Inicjalizacja widoczności przycisku po dodaniu nowego wiersza
    updateZobaczProjekVisibility();*/
    // KONIEC - NASŁUCHIWANIE WARUNKOW DLA WIDOCZNOSCI PRZYCISKU DO PROJEKTU



  // Dodaj nasłuchiwanie zdarzeń dla nowych pól liczbowych
  const numberInputs = newRow.querySelectorAll('.number-input-container');
  numberInputs.forEach(container => {
    const input = container.querySelector('input[type="number"]');
    const arrowUp = container.querySelector('.arrow-up');
    const arrowDown = container.querySelector('.arrow-down');

    arrowUp.addEventListener('click', function () {
      input.stepUp();
      input.dispatchEvent(new Event('input')); // Wywołaj zdarzenie input, aby zaktualizować wynik
    });

    arrowDown.addEventListener('click', function () {
      input.stepDown();
      input.dispatchEvent(new Event('input')); // Wywołaj zdarzenie input, aby zaktualizować wynik
    });
  });





    // Dodaj nasłuchiwanie zdarzeń dla nowych pól w row3

    if (leftInput) {
        leftInput.addEventListener('input', function () {
            calculateResult();
            if (szkicContainer.style.display === 'block') {
                drawSzkic(newRow);
            }
        });
    }
    if (bottomInput) {
        bottomInput.addEventListener('input', function () {
            calculateResult();
            if (szkicContainer.style.display === 'block') {
                drawSzkic(newRow);
            }
        });
    }
    if (puszkiSelect) {
        puszkiSelect.addEventListener('change', function () {
            calculateResult();
            if (szkicContainer.style.display === 'block') {
                drawSzkic(newRow);
            }

            // Pokaż/ukryj orientacja-select w zależności od liczby puszek
            const row3_2b = this.closest('.row3').querySelector('.row3-2b');
            if (this.value !== "1") {
                row3_2b.style.display = 'block'; // Pokaż row3-2b
            } else {
                row3_2b.style.display = 'none'; // Ukryj row3-2b
            }


        });
    }
    if (orientacjaSelect) {
        orientacjaSelect.addEventListener('change', function () {
            calculateResult();
            if (szkicContainer.style.display === 'block') {
                drawSzkic(newRow);
            }

            // Nie aktywuj przycisku "ZobaczProjek" automatycznie
            //const zobaczProjekBtn = this.closest('.options').querySelector('.ZobaczProjek');
            //if (zobaczProjekBtn) {
                //zobaczProjekBtn.classList.remove('active'); // Upewnij się, że przycisk jest nieaktywny
            //}
        });
    }

    // Dodaj nasłuchiwanie zdarzeń dla nowych przycisków
    const piankaBox = newRow.querySelector('.Pianka-box2');
    const rzepBox = newRow.querySelector('.Rzep-box3');
    const kontaktBox = newRow.querySelector('.Kontakt-box4');
    const x1Input = newRow.querySelector('.x1');
    const y2Input = newRow.querySelector('.y2');
    const z3Input = newRow.querySelector('.z3');



    if (x1Input) {
        x1Input.addEventListener('input', function () {
            calculateResult();
            if (szkicContainer.style.display === 'block') {
                drawSzkic(newRow);
            }
        });
    }
    if (y2Input) {
        y2Input.addEventListener('input', function () {
            calculateResult();
            if (szkicContainer.style.display === 'block') {
                drawSzkic(newRow);
            }
        });
    }
    if (z3Input) {
        z3Input.addEventListener('input', function () {
            calculateResult();
            if (szkicContainer.style.display === 'block') {
                drawSzkic(newRow);
            }
            // Ukryj Kontakt-box4 i row3 jeśli liczba sztuk jest większa niż 1
            const kontaktBox = this.closest('.options').querySelector('.Kontakt-box4');
            const row3 = this.closest('.options').querySelector('.row3');
            if (this.value > 1) {
                kontaktBox.style.display = 'none';
                row3.style.display = 'none'; // Ukryj row3
            } else {
                // Pokaż row3 tylko jeśli Kontakt-box4 jest aktywny
                if (kontaktBox.classList.contains('active')) {
                    row3.style.display = 'block'; // Pokaż row3
                } else {
                    row3.style.display = 'none'; // Ukryj row3
                }
                kontaktBox.style.display = 'flex'; // Pokaż Kontakt-box4
            }
        });
    }
    if (piankaBox) {
        piankaBox.addEventListener('click', function () {
            this.classList.toggle('active');
            calculateResult();
        });
    }
    if (rzepBox) {
        rzepBox.addEventListener('click', function () {
            this.classList.toggle('active');
            calculateResult();
        });
    }
    const newKontaktBox = newRow.querySelector('.Kontakt-box4');
    if (newKontaktBox) {
        newKontaktBox.addEventListener('click', function () {
            this.classList.toggle('active');
            calculateResult();
            if (szkicContainer.style.display === 'block') {
                drawSzkic(newRow);
            }

            // Pokaż/ukryj kontener row3 po kliknięciu na "Kontakt"
            const row3 = this.closest('.options').querySelector('.row3');
            if (row3) {
                if (this.classList.contains('active')) {
                    row3.style.display = 'block'; // Pokaż row3

                    // Sprawdź, czy "szicMainCon" jest widoczne
                    const szicMainCon = document.getElementById('szicMainCon');
                    if (!szicMainCon || szicMainCon.style.display === 'none') {
                        // Usuń klasę 'active' z przycisku "ZobaczProjek", tylko jeśli "szicMainCon" nie jest widoczne
                        const zobaczProjekBtn = this.closest('.options').querySelector('.ZobaczProjek');
                        if (zobaczProjekBtn) {
                            zobaczProjekBtn.classList.remove('active');
                        }
                    }
                } else {
                    row3.style.display = 'none'; // Ukryj row3
                }
            }
        });
    }

    // Dodaj nasłuchiwanie zdarzeń dla przycisku "ZOBACZ PROJEKT" w nowym wierszu
    if (zobaczProjekBtn) {
        zobaczProjekBtn.addEventListener('click', function (event) {
            openSzkic(event); // Przekaż event jako argument
        });
    }
    if (ZobaczPanelBtn) {
        ZobaczPanelBtn.addEventListener('click', function (event) {
            openSzkic(event);
        });
    }


    updateRemoveButtons();
    updateVariantNumbers();

    // Pobierz wysokość nowo dodanego elementu .options
    const newRowHeight = newRow.offsetHeight;

    // Przewiń stronę w dół o wysokość nowego elementu
    window.scrollBy({
        top: newRowHeight,
        behavior: 'smooth' // Dodaj płynne przewijanie
    });

    // Wywołaj funkcję, aby dodać nasłuchiwacze zdarzeń do nowych elementów
    addEventListenersToNewElements();

    // Dodaj nasłuchiwanie zdarzeń dla nowego wiersza - opis w szkic
    addDynamicUpdateListeners(newRow);

    // W addRow Dodaj nasłuchiwanie zdarzeń dla nowego obrazka
    const newImage = newRow.querySelector('.image-box1 img');
    if (newImage) {
        newImage.addEventListener('click', function (event) {
            event.stopPropagation();
            this.classList.toggle('zoomed');
            if (this.classList.contains('zoomed')) {
                addScrollButtons(this);
            } else {
                removeScrollButtons();
            }
        });
    }


    // W addRow dodaj nasłuchiwanie zdarzeń dla nowego obrazka
    if (newImage) {
        newImage.addEventListener('click', function (event) {
            event.stopPropagation();
            this.classList.toggle('zoomed');
            if (this.classList.contains('zoomed')) {
                addScrollButtons(this);
            } else {
                removeScrollButtons();
            }
        });
    }


}

// Funkcja scrollSubList do przewijania listy tkanin:
function showImage(selectElement) {
    const row = selectElement.closest('.options');
    const imageBox = row.querySelector('.image-box1');
    const selectedFabric = selectElement.value;
    const fabricType = selectedFabric.split(' ')[0];
    const imageUrl = fabricImages[fabricType][selectedFabric];

    if (imageBox && imageUrl) {
        imageBox.innerHTML = `
            <img src="${imageUrl}" alt="Wybrana grafika" class="selected-image">
            <button class="scroll-btn left-btn">❮</button>
            <button class="scroll-btn right-btn">❯</button>
        `;

        const newImage = imageBox.querySelector('img.selected-image');
        if (newImage) {
            newImage.addEventListener('click', function (event) {
                event.stopPropagation();
                this.classList.toggle('zoomed');
                if (this.classList.contains('zoomed')) {
                    addScrollButtons(this);
                } else {
                    removeScrollButtons(this); // Przekazujemy konkretny obrazek
                }
            });
        }

        // Dodaj nasłuchiwanie zdarzeń dla przycisków przewijania
        const leftBtn = imageBox.querySelector('.left-btn');
        const rightBtn = imageBox.querySelector('.right-btn');

        leftBtn.addEventListener('click', function() {
            scrollSubList(-1, selectElement);
        });

        rightBtn.addEventListener('click', function() {
            scrollSubList(1, selectElement);
        });

        // Ukryj przyciski domyślnie
        leftBtn.style.display = 'none';
        rightBtn.style.display = 'none';
    } else {
        imageBox.innerHTML = 'Chwilowy<br>brak zdjęcia';
    }

    // Automatycznie wywołaj calculateResult po zmianie tkaniny
    calculateResult();
}
// Funkcja scrollSubList do przewijania listy tkanin
function scrollSubList(direction, selectElement) {
    const subList = selectElement.closest('.options').querySelector('.subList');
    const options = subList.options;
    const selectedIndex = subList.selectedIndex;
    let newIndex = selectedIndex + direction;

    if (newIndex < 0) {
        newIndex = options.length - 1;
    } else if (newIndex >= options.length) {
        newIndex = 0;
    }

    subList.selectedIndex = newIndex;
    const selectedOption = options[newIndex];
    const fabricType = selectedOption.value.split(' ')[0];
    const fabricName = selectedOption.value;

    if (fabricImages[fabricType] && fabricImages[fabricType][fabricName]) {
        const imageBox = selectElement.closest('.options').querySelector('.image-box1 img');
        imageBox.src = fabricImages[fabricType][fabricName];
    } else {
        console.error(`Nie znaleziono obrazu dla ${fabricName}`);
    }

    // Automatycznie wywołaj calculateResult po zmianie tkaniny
    calculateResult();
}
// Funkcja addScrollButtons i removeScrollButtons
function addScrollButtons(image) {
    const imageBox = image.parentElement;
    const leftBtn = imageBox.querySelector('.left-btn');
    const rightBtn = imageBox.querySelector('.right-btn');

    // Pokaż przyciski z opóźnieniem i efektem przejścia
    setTimeout(() => {
        if (leftBtn) {
            leftBtn.style.display = 'block';
            leftBtn.classList.add('visible'); // Dodaj klasę 'visible' dla efektu przejścia
        }
        if (rightBtn) {
            rightBtn.style.display = 'block';
            rightBtn.classList.add('visible'); // Dodaj klasę 'visible' dla efektu przejścia
        }
    }, 100); // Opóźnienie 250ms
}


function removeScrollButtons(image) {
    const imageBox = image.parentElement;
    const leftBtn = imageBox.querySelector('.left-btn');
    const rightBtn = imageBox.querySelector('.right-btn');

    // Usuń klasę 'visible' dla efektu przejścia
    if (leftBtn) {
        leftBtn.style.display = 'none'; // Ukryj przycisk przewijania
        leftBtn.classList.remove('visible');
    }
    if (rightBtn) {
        rightBtn.style.display = 'none'; // Ukryj przycisk przewijania
        rightBtn.classList.remove('visible');
    }
}

    function removeRow(button) {
        const row = button.parentElement;
        removedElements.push(row);
        row.remove();
        calculateResult();
        updateRemoveButtons();
        updateVariantNumbers();
        // Pokaż przycisk "Przywróć usunięty Zestaw", jeśli są usunięte elementy
        if (removedElements.length > 0) {
            document.querySelector('.undo-btn').style.display = 'block';
        }
    }

    function undoRemove() {
        if (removedElements.length > 0) {
            const lastRemoved = removedElements.pop();
            document.getElementById('inputContainer').appendChild(lastRemoved);
            updateRemoveButtons();
            calculateResult();
            updateVariantNumbers();
            // Ukryj przycisk "Przywróć usunięty Zestaw", jeśli nie ma już usuniętych elementów
            if (removedElements.length === 0) {
                document.querySelector('.undo-btn').style.display = 'none';
            }
        }
    }

//Funkcja do sprawdzania wymiarów i przypisywania ceny dla STANDARD, PREMIUM LUB EXCLUSIVE
function checkStandardSize(x1, y2, fabricType) {
    console.log(`Sprawdzam wymiary: ${x1}x${y2}, typ tkaniny: ${fabricType}`);

    // Wybierz odpowiednią tabelę cenową w zależności od typu tkaniny
const priceTable = (fabricType === 'OLIMP' || fabricType === 'RIVIERA' || fabricType === 'JASMINE_PIK' || fabricType === 'PRESTON' || fabricType === 'GEMMA' || fabricType === 'MONOLITH' || fabricType === 'MATT_VELVET' || fabricType === 'RIO' || fabricType === 'COLIN' || fabricType === 'RODOS' || fabricType === 'KRONOS' || fabricType === 'FOREST' || fabricType === 'CROWN' || fabricType === 'NUBUK' || fabricType === 'LARY' || fabricType === 'FRESH') ? RozmPremium : (fabricType === 'NOW_OR_NEVER' ? RozmExclusive : RozmStandard);
console.log(`Używana tabela cenowa:`, priceTable);

    // Tworzymy klucz w formacie "x1xy2" (np. "60x30")
    const key1 = `${x1}x${y2}`;
    const key2 = `${y2}x${x1}`; // Sprawdzamy również odwrotną kombinację

    // Sprawdzamy, czy któryś z kluczy istnieje w wybranej tablicy cenowej
    if (priceTable[key1]) {
        console.log(`Znaleziono cenę dla klucza ${key1}: ${priceTable[key1]}`);
        return priceTable[key1]; // Zwracamy cenę dla klucza "x1xy2"
    } else if (priceTable[key2]) {
        console.log(`Znaleziono cenę dla klucza ${key2}: ${priceTable[key2]}`);
        return priceTable[key2]; // Zwracamy cenę dla klucza "y2xx1"
    } else {
        console.log(`Brak dopasowania dla wymiarów ${x1}x${y2} w tabeli cenowej.`);
        return null; // Jeśli nie ma dopasowania, zwracamy null
    }
}

    // OBLICZENIE
    function calculateResult() {
        const options = document.querySelectorAll('.options');
        let totalResult = 0;
        let totalArea = 0;
        let resultText = '';
        options.forEach((option, index) => {
            let x1 = parseFloat(option.querySelector('.x1').value) || 0;
            let y2 = parseFloat(option.querySelector('.y2').value) || 0;
            let z3 = parseFloat(option.querySelector('.z3').value) || 0;

        // Ogranicz wartości x1 i y2 do jednego miejsca po przecinku - INNA WERSJA
        //x1 = parseFloat(x1.toFixed(1));
        //y2 = parseFloat(y2.toFixed(1));

// Obetnij wartości x1 i y2 do jednej cyfry po przecinku
x1 = Math.floor(x1 * 10) / 10;
y2 = Math.floor(y2 * 10) / 10;


        // SPRAWDZANIE ŻEBY TYLKO JEDEN WYMIAR BYŁ POWYŻEJ 130cm - Dodaj walidację dla x1 i y2
        if (x1 > 130 && y2 > 130) {
            alert('Ze względów technologicznych tylko jeden z wymiarów może mieć powyżej 130cm');
            return;
        }

        // Korekta wartości x1 i y2
        if (x1 < 10 && x1 > 0) {
            x1 = 10;
        } else if (x1 > 350) {
            x1 = 350;
        }

        if (y2 < 10 && y2 > 0) {
            y2 = 10;
        } else if (y2 > 350) {
            y2 = 350;
        }

            // Pobierz wartość z listy subList, jeśli istnieje
            const subList = option.querySelector('.subList');
            let selectedFabric = 'Nie wybrano tkaniny'; // Domyślna wartość
            // Pobierz wartość z mainSelect (dla pierwszego zestawu to #mainSelect1, dla nowych to .mainSelect)
            const mainSelect = option.querySelector('.mainSelect') || option.querySelector('#mainSelect1');
        const fabricType = mainSelect ? mainSelect.value : null;
        console.log(`Typ tkaniny dla zestawu ${index + 1}:`, fabricType);
            const isWlasnaTkanina = mainSelect && mainSelect.value === 'WLASNA';
            if (isWlasnaTkanina) {
                selectedFabric = '<u>Materiał dostarczony przez klienta</u>'; // Ustaw informację o materiale klienta
            } else if (subList && subList.value && subList.value !== "Wybierz kolor tkaniny") {
                selectedFabric = subList.value; // Aktualizuj, jeśli wybrano tkaninę
            }

    // NAPRAW BLEDU Z WPISYWANIEM W TE POLA WIECEJ NIZ MOZNA I PRZENOSZENIE BLEDNEGO WYNIKU DO RESULT
    // Dodaj walidację dla pól "klej-ilosc" i "z3"
    const klejIloscInput = document.querySelector('.klej-ilosc');
    let klejIlosc = parseFloat(klejIloscInput.value) || 0;
    // Upewnij się, że wartość mieści się w dozwolonym zakresie
    if (klejIlosc > 99) {
        klejIlosc = 99;
        klejIloscInput.value = 99;
    }
    // Dodaj walidację dla pól "z3"
    const z3Inputs = document.querySelectorAll('.z3');
    z3Inputs.forEach(z3Input => {
        let z3Value = parseFloat(z3Input.value) || 0;
        if (z3Value > 99) {
            z3Value = 99;
            z3Input.value = 99;
        }
    });


    // Zaktualizuj wynik na podstawie wartości
    const result = klejIlosc * Klej1;
    document.getElementById('result-content').innerHTML = `Result: ${result}`;


        // Sprawdź, czy wymiary pasują do standardowego rozmiaru
        const standardPrice = checkStandardSize(x1, y2, fabricType);
        const isStandardSize = standardPrice !== null;

        // Użyj ceny standardowej, jeśli wymiary pasują, w przeciwnym razie użyj Cena300
        //const pricePerM2 = isStandardSize ? standardPrice : Cena300;

            // Sprawdź, czy wszystkie trzy pola są uzupełnione
            if (x1 > 0 && y2 > 0 && z3 > 0) {
        const panelArea = (x1 / 100) * (y2 / 100) * z3; // Powierzchnia w m²
        const onepanelArea = (x1 / 100) * (y2 / 100); // Powierzchnia w m²

        totalArea += panelArea;

        // Ustal koszt panelu na podstawie warunków
        let panelCost;

// Warunek 1 TYPOWE Z TABELI
if (isStandardSize) {
    console.log('Warunek 1 TYPOWE - cena z strony');
    panelCost = standardPrice * z3;
} else {
    // Warunek 2 BARDZO MAŁE
    if (onepanelArea < 0.05) {
        console.log('Warunek 3 BARDZO MAŁE - 25 zł/szt');
        panelCost = Cena25 * z3;
    }
    // Warunek 3 MAŁE
    //else if (onepanelArea >= 0.05 && onepanelArea <= 0.1 && (x1 > 20 && y2 > 20 && x1 <= 50 && y2 <= 50)) {
    else if (onepanelArea >= 0.05 && onepanelArea <= 0.1 && (x1 > 10 && y2 > 10 && x1 <= 50 && y2 <= 50)) {
        console.log('Warunek 2 MAŁE - 30 zł/szt');
        panelCost = Cena30 * z3;
    }
    // Warunek 4-A WĄSKIE
    else if (x1 >= 10 && x1 <= 20 && y2 > 50) {
        console.log('Warunek 4-A WĄSKIE - 300 zł/m2');
        panelCost = ((20 / 100) * (y2 / 100) * z3) * Cena300;
    }
    // Warunek 4-B WĄSKIE
    else if (y2 >= 10 && y2 <= 20 && x1 > 50) {
        console.log('Warunek 4-B WĄSKIE - 300 zł/m2');
        panelCost = ((20 / 100) * (x1 / 100) * z3) * Cena300;
    }
    // Warunek 5 STANDARD M2 - Domyślny przypadek
    else {
        console.log('Warunek 5 INNE WARIANTY - 300 zł/m2');
        panelCost = panelArea * Cena300;
    }
}
            totalResult += panelCost;

                // Sprawdź, czy Pianka-box2 jest aktywny
                const piankaBox = option.querySelector('.Pianka-box2');
                const isPiankaActive = piankaBox && piankaBox.classList.contains('active');
                // Sprawdź, czy Rzep-box3 jest aktywny
                const rzepBox = option.querySelector('.Rzep-box3');
                const isRzepActive = rzepBox && rzepBox.classList.contains('active');
                // Sprawdź, czy Kontakt-box4 jest aktywny i widoczny (z3 <= 1)
                const kontaktBox = option.querySelector('.Kontakt-box4');
                const isKontaktActive = kontaktBox && kontaktBox.classList.contains('active') && z3 <= 1;

let rzepCost = 0;

if (isRzepActive) {
    if (onepanelArea < 0.4) {
        rzepCost = Rzep8;
    } else if (onepanelArea >= 0.4 && onepanelArea < 0.9) {
        rzepCost = Rzep20;
    } else if (onepanelArea >= 0.9 && onepanelArea < 1.5) {
        rzepCost = Rzep40;
    } else if (onepanelArea >= 1.5 && onepanelArea < 2) {
        rzepCost = Rzep70;
    } else if (onepanelArea >= 2) {
        rzepCost = Rzep120;
    }
}

let piankaCost = 0;

if (isPiankaActive) {
    if (onepanelArea < 0.4) {
        piankaCost = Pianka6;
    } else if (onepanelArea >= 0.4 && onepanelArea <0.9) {
        piankaCost = Pianka15;
    } else if (onepanelArea >= 0.9 && onepanelArea < 1.5) {
        piankaCost = Pianka30;
    } else if (onepanelArea >= 1.5 && onepanelArea < 2) {
        piankaCost = Pianka60;
    } else if (onepanelArea >= 2) {
        piankaCost = Pianka100;
    }
}

// Dodaj informację o standardowym rozmiarze, jeśli pasuje
//const sizeInfo = isStandardSize ? `<span style="color: green;">(Standardowy rozmiar: ${x1}x${y2})</span>` : '';

            // Pobierz liczbę puszek, jeśli kontakt jest aktywny
            const puszkiSelect = option.querySelector('.puszki-select');
            const puszkiValueNr = isKontaktActive && puszkiSelect ? parseInt(puszkiSelect.value) : 0;
            const orientacjaSelect = option.querySelector('.orientacja-select'); // Pobierz element orientacja-select

resultText += `<br><u><b>Zestaw nr ${index + 1}</b>, Razem = <b>${(
                panelCost + 
                (isPiankaActive ? piankaCost * z3 : 0) + 
                (isRzepActive ? rzepCost * z3 : 0) + 
                (isKontaktActive && puszkiSelect && puszkiSelect.value !== "" ? 
        (puszkiSelect.value === "1" || (puszkiSelect.value > "1" && orientacjaSelect && orientacjaSelect.value !== "") ? 
            Kontakt1 * puszkiValueNr : 0
        ) : 0)
                ).toFixed(2)} zł</b></u><br>`;

resultText += `<b>Panel:</b> szer. ${x1} cm x wys. ${y2} cm x ${z3} szt = ${panelCost.toFixed(2)} zł<br><span style="font-size: small;">Powierzchnia: ${onepanelArea.toFixed(3)} m² x ${z3} szt = ${panelArea.toFixed(3)} m²</span><br>`;

// Dodaj informację o tkaninie
resultText += `<b>Tkanina:</b> ${selectedFabric === 'Nie wybrano tkaniny' ? '<span style="color: red;">Nie wybrano tkaniny</span>' : selectedFabric}<br>`;

// Dodaj koszt podwójnej pianki, jeśli jest aktywna
if (isPiankaActive) {
    totalResult += piankaCost * z3; // Dodaj koszt podwójnej pianki dla wszystkich paneli
    resultText += `\u2003+ Podwójna pianka: ${z3} szt x ${piankaCost} zł = ${(piankaCost * z3).toFixed(2)} zł<br>`;
}


// Dodaj koszt rzepu montażowego, jeśli jest aktywny
if (isRzepActive) {
    totalResult += rzepCost * z3;
    resultText += `\u2003+ Rzep montażowy: ${z3} szt x ${rzepCost} zł = ${(rzepCost * z3).toFixed(2)} zł<br>`;
}
// Dodaj koszt otworu na kontakt, jeśli jest aktywny i widoczny
if (isKontaktActive) {
                    // Pobierz wartości z pól "do lewej", "do dołu", "puszki-select" i "orientacja-select"
                    const leftInput = option.querySelector('.left-input');
                    const bottomInput = option.querySelector('.bottom-input');
                    const puszkiSelect = option.querySelector('.puszki-select');
                    const orientacjaSelect = option.querySelector('.orientacja-select');
                    const leftValue = leftInput ? leftInput.value : '';
                    const bottomValue = bottomInput ? bottomInput.value : '';
                    const puszkiValue = puszkiSelect ? puszkiSelect.options[puszkiSelect.selectedIndex].text : '';
                    const orientacjaValue = orientacjaSelect ? orientacjaSelect.options[orientacjaSelect.selectedIndex].text : '';
                    // Sprawdź, czy pola "left-input" i "bottom-input" są uzupełnione
                    const areInputsFilled = leftValue && bottomValue;
                    // Sprawdź, czy listy "puszki-select" i "orientacja-select" mają wybrane wartości inne niż domyślne
                    const isPuszkiSelected = puszkiSelect && puszkiSelect.selectedIndex > 0; // Wartość domyślna to indeks 0
                    const isOrientacjaSelected = orientacjaSelect && orientacjaSelect.selectedIndex > 0; // Wartość domyślna to indeks 0
                    // Jeśli wszystkie warunki są spełnione, dodaj koszt i szczegóły
                    if (areInputsFilled && isPuszkiSelected && (puszkiSelect.value === "1" || isOrientacjaSelected)) {
                        const puszkiValueNr = puszkiSelect.value; // Pobierz wartość z listy rozwijanej
                        totalResult += Kontakt1 * puszkiValueNr; // Dodaj koszt otworu na kontakt
                        resultText += `\u2003+ Otwór na kontakt: ${puszkiValueNr} x ${Kontakt1} zł = ${(Kontakt1 * puszkiValueNr).toFixed(2)} zł<br>`;
                        // Dodaj szczegóły dotyczące otworu na kontakt
                        resultText += `\u2003\u2003Wymiary do środka ramki kontaktu:<br>`;
                        resultText += `\u2003\u2003- od lewej krawędzi (szer) panelu: ${leftValue} cm<br>`;
                        resultText += `\u2003\u2003- od dolnej krawędzi (wys) panelu: ${bottomValue} cm<br>`;
                        resultText += `\u2003\u2003Ilość otworów w ścianie: ${puszkiValue}<br>`;
                        if (puszkiSelect.value !== "1") {
                            resultText += `\u2003\u2003Układ ramki/otworów kontaktu na panelu: ${orientacjaValue}<br>`;
                        }
                    } else {
                        resultText += `\u2003+ Otwór na kontakt: <span style="color: red;">UZUPEŁNIJ DANE</span><br>`;
                    }
                }
            }
        });
        // Jeśli nie ma żadnych uzupełnionych zestawów, wyświetl domyślny komunikat
        if (resultText === '') {
            document.getElementById('result-content').innerHTML = 'Wprowadź wymiary aby zobaczyć wycenę';
            return;
        }
        // Obliczenia dla dodatków (dodatki)
        const dodatki = document.querySelector('.dodatki');
        let dodatkiText = '';
        // Sprawdź, czy pole "klej-ilosc" ma wartość dodatnią
        const klejIloscInput = dodatki.querySelector('.klej-ilosc');
        if (klejIloscInput && klejIloscInput.value > 0) {
            const klejIlosc = parseFloat(klejIloscInput.value) || 0;
            const klejCost = klejIlosc * Klej1;
            totalResult += klejCost;
            dodatkiText += `\u2003+ Klej montażowy: ${klejIlosc} szt x ${Klej1} zł = ${klejCost.toFixed(2)} zł<br>`;
        }

    // Sprawdź, czy "Wysyłka kurierska" jest zaznaczona
    const wysylkaCheckbox = dodatki.querySelector('.wysylka');
    if (wysylkaCheckbox && wysylkaCheckbox.checked) {
        let shippingCost = Wysylka18; // Domyślna wartość
        
        // Sprawdź wszystkie zestawy dla warunków wysyłki
        const options = document.querySelectorAll('.options');
        options.forEach(option => {
            const x1 = parseFloat(option.querySelector('.x1').value) || 0;
            const y2 = parseFloat(option.querySelector('.y2').value) || 0;
            const z3 = parseFloat(option.querySelector('.z3').value) || 0;
            
            // Oblicz wymiar dla pierwszego warunku
            const wymiar = x1 + y2 + (z3 * 5);
            
            // Sprawdź warunki w kolejności priorytetu (od najdroższego)
            if ((x1 >= 100 && y2 >= 200) || (x1 >= 200 && y2 >= 100)) {
                shippingCost = Math.max(shippingCost, Wysylka130);
            } else if (x1 >= 200 && y2 >= 200) {
                shippingCost = Math.max(shippingCost, Wysylka130);
            } else if (x1 >= 140 && y2 >= 140) {
                shippingCost = Math.max(shippingCost, Wysylka130);
            } else if ((x1 >= 90 && y2 >= 90) && (x1 < 140 && y2 < 140)) {
                shippingCost = Math.max(shippingCost, Wysylka39);
            } else if (x1 >= 110 || y2 >= 110) {
                shippingCost = Math.max(shippingCost, Wysylka39);
            } else if (wymiar < 300) {
                shippingCost = Math.max(shippingCost, Wysylka18);
            }
        });
        
        totalResult += shippingCost;
        
        // Dodaj informację o koszcie wysyłki
        if (shippingCost === Wysylka130) {
            dodatkiText += `\u2003+ Wysyłka kurierska (Gabaryt): ${Wysylka130} zł<br>`;
        } else if (shippingCost === Wysylka39) {
            dodatkiText += `\u2003+ Wysyłka kurierska (Średnia paczka): ${Wysylka39} zł<br>`;
        } else {
            dodatkiText += `\u2003+ Wysyłka kurierska (Standard): ${Wysylka18} zł<br>`;
        }
    }

        // Jeśli są jakieś dodatki, dodaj je do wyceny
        if (dodatkiText) {
            resultText += `\u2003<br><b>Dodatkowo:</b><br>${dodatkiText}<br>`;
        }

        totalResult = totalResult.toFixed(2);
        totalArea = totalArea.toFixed(3);

        resultText += `<em><br><b>Przed realizacją zamówienia prosimy o potwierdzenie wyceny na sklep@rasek.pl</b><br></em>`;

        // Aktualizuj zawartość #result-content
        document.getElementById('result-content').innerHTML = `
            <span style="font-size: x-large"><b>SUMA: ${totalResult} zł </b></span><span style="font-size: small">brutto<br>
            Powierzchnia: ${totalArea} m²\u2003
            Cena za m²: ${Cena300} zł *<br>* Małe lub wąskie panele wyceniane są według stałych wartości<br><br></span>
            ${resultText}
    `;

    // Aktualizuj wartość przycisku SumaZam
    const sumaZamBtn = document.getElementById('sumaZamBtn');
    if (sumaZamBtn) {
            sumaZamBtn.innerHTML = `SUMA:&nbsp<b>${totalResult} zł</b>`;
    }
}

    function updateRemoveButtons() {
        const options = document.querySelectorAll('.options');
        options.forEach((option, index) => {
            const removeBtn = option.querySelector('.remove-btn');
            if (options.length === 1) {
                removeBtn.style.display = 'none';
            } else {
                removeBtn.style.display = 'block';
            }
        });
    }

    function updateVariantNumbers() {
        const options = document.querySelectorAll('.options');
        options.forEach((option, index) => {
            const variantLabel = option.querySelector('.variant-label');
            variantLabel.textContent = `Zestaw nr. ${index + 1}`;
        });
    }

    function showSubList(selectElement) {
        const rowId = selectElement.id.replace('mainSelect', '');
        const subListContainer = document.getElementById(`subListContainer${rowId}`);
        const subList = document.getElementById(`subList${rowId}`);
        const imageBox = selectElement.closest('.options').querySelector('.image-box1');

  if (selectElement.value === 'DIANA') {
    populateSubList(subList, dianaList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'LUNA') {
    populateSubList(subList, lunaList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'SWEET') {
    populateSubList(subList, sweetList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'TANGO') {
    populateSubList(subList, tangoList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'NUBUK') {
    populateSubList(subList, nubukList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'TREND') {
    populateSubList(subList, trendList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'OLIMP') {
    populateSubList(subList, olimpList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'TRINITY') {
    populateSubList(subList, trinityList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'RIO') {
    populateSubList(subList, rioList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'LARY') {
    populateSubList(subList, laryList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'IVA') {
    populateSubList(subList, ivaList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'EKO_SKÓRA') {
    populateSubList(subList, ekoskoraList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'COLIN') {
    populateSubList(subList, colinList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'KRONOS') {
    populateSubList(subList, kronosList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'RODOS') {
    populateSubList(subList, rodosList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'FOREST') {
    populateSubList(subList, forestList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'CROWN') {
    populateSubList(subList, crownList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'MONOLITH') {
    populateSubList(subList, monolithList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'EVO') {
    populateSubList(subList, evoList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'FRESH') {
    populateSubList(subList, freshList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'PRESTON') {
    populateSubList(subList, prestonList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'MATT_VELVET') {
    populateSubList(subList, mattvelvetList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'JASMINE_PIK') {
    populateSubList(subList, jasmineList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'RIVIERA') {
    populateSubList(subList, rivieraList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'GEMMA') {
    populateSubList(subList, gemmaList);
    subListContainer.classList.remove('hidden');
  } else if (selectElement.value === 'NOW_OR_NEVER') {
    populateSubList(subList, noworneverList);
    subListContainer.classList.remove('hidden');

        } else if (selectElement.value === 'WLASNA') {
            subListContainer.classList.add('hidden');
            imageBox.innerHTML = 'Tkanina dostarczona<br>przez klienta';
        } else {
            subListContainer.classList.add('hidden'); // Ukryj listę kolorów
        }
        // Zresetuj selectedFabric i wyczyść obrazek, jeśli nie wybrano "Własna tkanina"
        if (selectElement.value !== 'WLASNA') {
            const selectedFabric = 'Nie wybrano tkaniny';
            imageBox.innerHTML = 'Wybierz numer<br> koloru tkaniny'; // Wyczyść obrazek
        }
        // Wywołaj calculateResult, aby zaktualizować wynik
        calculateResult();
    }

    function populateSubList(subList, options) {
        // Zachowaj pierwszą opcję "Wybierz kolor tkaniny"
        subList.innerHTML = '<option value="" disabled selected>Wybierz kolor tkaniny</option>';
        
        // Dodaj pozostałe opcje z tablicy
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            subList.appendChild(opt);
        });
    // Automatycznie wywołaj calculateResult po zmianie tkaniny
    calculateResult();
    }


// WYMIARY KONTAKTU I POLA LIMITY
function addEventListenersToNewElements() {

    const integerInputs = document.querySelectorAll('.z3, .klej-ilosc');
    integerInputs.forEach(input => {
        // Zablokuj wpisanie kropki i przecinka podczas wpisywania
        input.addEventListener('keydown', function (event) {
            if (event.key === '.' || event.key === ',') {
                event.preventDefault();
            }
        });

        // Usuń kropki i przecinki po wprowadzeniu wartości
        input.addEventListener('input', function () {
            this.value = this.value.replace(/[.,]/g, '');
        });
    });

    const numberInputs = document.querySelectorAll('input[type="number"]');
    numberInputs.forEach(input => {
        input.addEventListener('input', function () {
            if (this.value.includes('.')) {
                const parts = this.value.split('.');
                if (parts[1].length > 1) {
                    this.value = parts[0] + '.' + parts[1].slice(0, 1);
                }
            }
        });
    });

    numberInputs.forEach(input => {
        // Dodaj nasłuchiwanie zdarzeń dla pól x1 i y2
        if (input.classList.contains('x1') || input.classList.contains('y2')) {
            input.addEventListener('input', function () {
                const x1Element = input.closest('.options').querySelector('.x1');
                const y2Element = input.closest('.options').querySelector('.y2');
                const x1Value = x1Element ? parseFloat(x1Element.value) : 0;
                const y2Value = y2Element ? parseFloat(y2Element.value) : 0;

                const leftInput = input.closest('.options').querySelector('.left-input');
                const bottomInput = input.closest('.options').querySelector('.bottom-input');

                // Sprawdź, czy pola x1 i y2 są uzupełnione i mają wartości większe niż 10
                const isX1Valid = x1Element.value.trim() !== "" && x1Value >= 10;
                const isY2Valid = y2Element.value.trim() !== "" && y2Value >= 10;

            // SPRAWDZANIE ŻEBY TYLKO JEDEN WYMIAR BYŁ POWYŻEJ 130cm - Dodaj walidację dla x1 i y2
            if (x1Value > 130 && y2Value > 130) {
                alert('Ze względów technologicznych tylko jeden z wymiarów może mieć powyżej 130cm');
                input.value = '130'; // Resetuj wartość pola
            }

                // Odblokuj pola left-input i bottom-input tylko jeśli oba pola x1 i y2 są poprawne
                if (isX1Valid && isY2Valid) {
                    if (leftInput) leftInput.disabled = false;
                    if (bottomInput) bottomInput.disabled = false;
                } else {
                    // Zablokuj pola left-input i bottom-input
                    if (leftInput) leftInput.disabled = true;
                    if (bottomInput) bottomInput.disabled = true;
                }
            });
        }

        // Dodaj nasłuchiwanie zdarzeń dla pól left-input i bottom-input
        if (input.classList.contains('left-input') || input.classList.contains('bottom-input')) {
            input.addEventListener('input', function () {
                const x1Element = input.closest('.options').querySelector('.x1');
                const y2Element = input.closest('.options').querySelector('.y2');
                const x1Value = x1Element ? parseFloat(x1Element.value) : 0;
                const y2Value = y2Element ? parseFloat(y2Element.value) : 0;

                // Ogranicz wartości w left-input i bottom-input
                if (input.classList.contains('left-input')) {
                    const maxLeftValue = x1Value + 5.0;
                    if (parseFloat(input.value) > maxLeftValue) {
                        input.value = maxLeftValue;
                    }
                    if (parseFloat(input.value) < -5.0) {
                        input.value = -5.0;
                    }
                }
                if (input.classList.contains('bottom-input')) {
                    const maxBottomValue = y2Value + 5.0;
                    if (parseFloat(input.value) > maxBottomValue) {
                        input.value = maxBottomValue;
                    }
                    if (parseFloat(input.value) < -5.0) {
                        input.value = -5.0;
                    }
                }
                // Wywołaj calculateResult() po korekcie wartości
                calculateResult();
            });
        }

        // Dodaj nasłuchiwacz zdarzeń blur, aby sprawdzić warunek po wyjściu z pola
        if (input.classList.contains('x1') || input.classList.contains('y2')) {
            input.addEventListener('blur', function () {
                const value = parseFloat(this.value);
                if (this.value.trim() === "" || value <= 10) {
                    this.value = '10';
                }
                if (value > 350) {
                    this.value = '350';
                }

                // Po zmianie wartości w x1 lub y2, sprawdź ponownie stan pól left-input i bottom-input
                const x1Element = input.closest('.options').querySelector('.x1');
                const y2Element = input.closest('.options').querySelector('.y2');
                const x1Value = x1Element ? parseFloat(x1Element.value) : 0;
                const y2Value = y2Element ? parseFloat(y2Element.value) : 0;

                const leftInput = input.closest('.options').querySelector('.left-input');
                const bottomInput = input.closest('.options').querySelector('.bottom-input');

                const isX1Valid = x1Element.value.trim() !== "" && x1Value >= 10;
                const isY2Valid = y2Element.value.trim() !== "" && y2Value >= 10;

                if (isX1Valid && isY2Valid) {
                    if (leftInput) leftInput.disabled = false;
                    if (bottomInput) bottomInput.disabled = false;
                } else {
                    if (leftInput) leftInput.disabled = true;
                    if (bottomInput) bottomInput.disabled = true;
                }
            });


input.addEventListener('input', function () {
    const value = parseFloat(this.value);
    if (this.value.trim() === "") {
        this.value = '';
    } else if (value <= 10) {
        this.value = value;
    } else if (value > 350) {
        this.value = '350';
    }
});


        }

        // Dodaj nasłuchiwanie zdarzeń dla pól z3 i klej-ilosc
        if (input.classList.contains('z3') || input.classList.contains('klej-ilosc')) {
            input.addEventListener('input', function () {
                const value = parseFloat(this.value);
                if (this.value.trim() === "" || value < 1) {
                    this.value = ''; // Minimalna wartość to 1
                }
                if (value > 99) {
                    this.value = '99'; // Maksymalna wartość to 999
                }
            });

            input.addEventListener('blur', function () {
                const value = parseFloat(this.value);
                if (this.value.trim() === "" || value < 1) {
                    this.value = ''; // Minimalna wartość to 1
                }
                if (value > 99) {
                    this.value = '99'; // Maksymalna wartość to 999
                }
            });
        }
    });

    // Sprawdź stan pól left-input i bottom-input na starcie (jeśli pola x1 i y2 są już uzupełnione)
    const options = document.querySelectorAll('.options');
    options.forEach(option => {
        const x1Element = option.querySelector('.x1');
        const y2Element = option.querySelector('.y2');
        const x1Value = x1Element ? parseFloat(x1Element.value) : 0;
        const y2Value = y2Element ? parseFloat(y2Element.value) : 0;

        const leftInput = option.querySelector('.left-input');
        const bottomInput = option.querySelector('.bottom-input');

        const isX1Valid = x1Element && x1Element.value.trim() !== "" && x1Value > 10;
        const isY2Valid = y2Element && y2Element.value.trim() !== "" && y2Value > 10;

        if (isX1Valid && isY2Valid) {
            if (leftInput) leftInput.disabled = false;
            if (bottomInput) bottomInput.disabled = false;
        } else {
            if (leftInput) leftInput.disabled = true;
            if (bottomInput) bottomInput.disabled = true;
        }
    });
}

    // Wywołaj funkcję dla istniejących elementów
    // W RAZIE CZEGO DODAĆ DO ADDROW
    addEventListenersToNewElements();


