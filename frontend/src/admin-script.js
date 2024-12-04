document.getElementById('admin-login-button').addEventListener('click', loginAdmin);

function loginAdmin() {
    const password = document.getElementById('admin-password').value.trim();

    if (!password) {
        alert('Veuillez entrer le mot de passe.');
        return;
    }

    fetch('http://localhost:3000/api/adminLogin', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            document.querySelector('.login-container').style.display = 'none';
            document.querySelector('.admin-container').style.display = 'block';
            // document.getElementById('admin-add-button').addEventListener('click', addStudent);
            // document.getElementById('admin-remove-button').addEventListener('click', removeStudent);
            document.getElementById('excel-file').addEventListener('change', handleFileUpload);
        } else {
            alert('Mot de passe incorrect.');
        }
    });
}

// Fonction pour lire et traiter le fichier Excel
function handleFileUpload() {
    const fileInput = document.getElementById('excel-file');
    const file = fileInput.files[0];

    if (!file) {
        alert('Veuillez sélectionner un fichier Excel.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(event) {
        const data = event.target.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const dataToSend = processWorkbook(workbook);
        const uniqueStudents = getUniqueStudents(dataToSend);

        // Envoyer les données au serveur
        sendDataToServer(dataToSend);

        // Afficher le nombre total d'élèves uniques trouvés
        document.getElementById("studentsFound").innerText = "Nombre d'élèves uniques trouvés: " + uniqueStudents.size;
    };
    reader.readAsBinaryString(file);
}

// Fonction pour traiter le workbook Excel
function processWorkbook(workbook) {
    const dataToSend = [];
    workbook.SheetNames.forEach(sheetName => {
        if (sheetName === "ALL" || sheetName === "Prof-Labo") return;
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        processSheet(jsonData, sheetName, dataToSend);
    });
    return dataToSend;
}

// Fonction pour traiter une feuille Excel
function processSheet(jsonData, sheetName, dataToSend) {
    const timeHeaders = jsonData[1].slice(2, 19); // 2, 19 sont les cases contenant les horaires sur l'Excel
    jsonData.slice(2).forEach(row => { // On slice(2) afin d'enlever les deux premières lignes inutiles
        const nom = row[0];
        if (nom === "Total élèves" || nom === "" || !nom) return;
        const classe = row[1];
        const horaires = row.slice(2, 19);
        processRow(nom, classe, horaires, timeHeaders, sheetName, dataToSend);
    });
}

// Fonction pour traiter une ligne de données
function processRow(nom, classe, horaires, timeHeaders, sheetName, dataToSend) {
    horaires.forEach((timeSlot, index) => {
        const heure = excelTimeToHHMMSS(timeHeaders[index]);
        dataToSend.push({
            nom: nom,
            classe: classe,
            heure: heure,
            presence: timeSlot == 0 || timeSlot == 1 ? timeSlot : 0,
            laboratoire: sheetName
        });
    });
}

// Fonction pour convertir le temps Excel en format HH:MM:SS
function excelTimeToHHMMSS(excelTime) {
    const totalSeconds = Math.floor(excelTime * 24 * 60 * 60);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return [hours, minutes, seconds].map(unit => String(unit).padStart(2, '0')).join(':');
}

// Fonction pour obtenir les élèves uniques
function getUniqueStudents(dataToSend) {
    const uniqueStudents = new Set();
    dataToSend.forEach(item => uniqueStudents.add(item.nom));
    return uniqueStudents;
}

function sendDataToServer(data) {
    const apiUrl = 'http://localhost:3000/api/insert';

    fetch(apiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            return response.text().then(text => {
                throw new Error(text);
            });
        }
    })
    .then(data => {
        console.log('Données envoyées avec succès:', data);
        alert('Les données ont été envoyées avec succès.');
    })
    .catch(error => {
        console.error('Erreur lors de l\'envoi des données:', error);
        alert('Une erreur s\'est produite lors de l\'envoi des données.');
    });
}