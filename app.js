document.getElementById('processButton').addEventListener('click', processFile);
let date = "";

function processFile() {
    const inputDate = document.getElementById('inputDate').value;
    const inputFile = document.getElementById('inputFile').files[0];

    if (!inputDate || !inputFile) {
        alert('Per favore inserisci una data valida e carica un file CSV.');
        return;
    }

    if (inputDate.length !== 10) {
        alert('La data deve essere nel formato GG/MM/AAAA.');
        return;
    }

    date = inputDate;

    const reader = new FileReader();
    reader.onload = function(event) {
        const csvContent = event.target.result;
        const turni = parseCSV(csvContent);
        const outputData = generateOutput(inputDate, turni);
        downloadCSV(outputData);
    };
    reader.readAsText(inputFile);
}

function parseCSV(content) {
    const lines = content.split('\n');
    const turni = [];
    let week = [];

    for (let line of lines) {
        line = line.trim();
        if (line === '|') {
            if (week.length) {
                turni.push(week);
                week = [];
            }
        } else {
            week.push(line);
        }
    }
    if (week.length) {
        turni.push(week);
    }

    return turni;
}

function generateOutput(inputDate, turni) {
    const dateStrings = generateDateStrings(inputDate);
    let output = '';

    for (let i = 0; i < 4; i++) {
        output += `Settimana ${i + 1},,,,,\n`;
        output += `,Lunedì,Martedì,Mercoledì,Giovedì,Venerdì\n`;
        output += `,${dateStrings[i]}\n`;
        output += ',,,,,\n';

        for (let turno of turni[i]) {
            output += `${turno}\n`;
        }

        output += ',,,,,\n';
        output += 'Ferie/recuperi,,,,,\n';
        output += 'Corso,,,,,\n';
        output += 'Riunione mattutina,,,,,\n';
        output += 'Riunione pomeriggio,,,,,\n';
        output += 'Malattia,,,,,\n';
        output += ',,,,,\n';
        output += ',,,,,\n';
        output += ',,,,,\n';
    }

    return output;
}

function generateDateStrings(inputDate) {
    const result = [];
    const [dd, mm, yyyy] = inputDate.split('/').map(Number);
    let day = dd, month = mm, year = yyyy;

    for (let set = 0; set < 4; set++) {
        let dates = '';

        for (let i = 0; i < 5; i++) {
            dates += (i > 0 ? ',' : '') + formatDate(day, month, year);
            day++;
            if (day > daysInMonth(month, year)) {
                day = 1;
                month++;
                if (month > 12) {
                    month = 1;
                    year++;
                }
            }
        }

        result.push(dates);
        day += 2;
        if (day > daysInMonth(month, year)) {
            day = 1;
            month++;
            if (month > 12) {
                month = 1;
                year++;
            }
        }
    }

    return result;
}

function formatDate(day, month, year) {
    return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}/${year}`;
}

function daysInMonth(month, year) {
    return new Date(year, month, 0).getDate();
}

function downloadCSV(data) {
    const blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
    const file_name = 'turni_' + date + '.csv';
    saveAs(blob, file_name);
}
