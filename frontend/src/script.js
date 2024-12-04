import { deburr } from 'lodash';

/////////////////////////////////////////// SEARCH ///////////////////////////////////////////

const searchStudents = () => {
    const nom = document.getElementById('search-nom').value.trim();
    const prenom = document.getElementById('search-prenom').value.trim();

    const params = new URLSearchParams();
    if (nom) params.append('nom', nom);
    if (prenom) params.append('prenom', prenom);

    const apiUrl = `http://localhost:3000/api/search?${params.toString()}`;

    fetch(apiUrl)
    .then(response => response.json())
    .then(data => {
        displaySearchResults(data);
    })
    .catch(error => {
        console.error(error);
        alert('Une erreur s\'est produite lors de la recherche des données.');
    });
}

// Fonction pour afficher les résultats de la recherche
async function displaySearchResults(results) {
    const resultsContainer = document.getElementById('search-results');
    resultsContainer.innerHTML = '';

    if (results.length === 0) {
        resultsContainer.innerHTML = '<p>Aucun résultat trouvé.</p>';
        return;
    }

    const consolidatedResults = consolidateStudentSchedules(results);

    for (const result of consolidatedResults) {
        const avatarUrl = await getAvatarUrl(result.nom);
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <img src="${avatarUrl}" alt="${result.nom}" class="avatar">
            <h2>${result.nom}</h2>
            <p>Classe: ${result.classe}</p>
            <p>Horaires: ${result.horaires}</p>
            <p>Laboratoire: ${result.laboratoire}</p>
        `;
        resultsContainer.appendChild(resultItem);
    }
}

// Fonction pour obtenir l'URL de l'avatar
async function getAvatarUrl(fullName) {
    const FIRST_NAME_INITIAL_LENGTH = 3;
    const LAST_NAME_INITIAL_LENGTH = 8;
    const START_YEAR = 2010;
    const API_ENDPOINT = "/api/img/students";

    const nameArray = fullName.toLowerCase().split(' ');
    const firstName = nameArray.at(-1);
    const lastName = nameArray.slice(0, -1).join(' ').replace(/\s+/g, '');

    const firstNameInitial = firstName.substring(0, FIRST_NAME_INITIAL_LENGTH);
    const normalizedFirstNameInitial = deburr(firstNameInitial);

    const lastNameInitial = lastName.substring(0, LAST_NAME_INITIAL_LENGTH);
    const normalizedLastName = deburr(lastNameInitial);

    const currentYear = new Date().getFullYear();
    for (let year = currentYear; year > START_YEAR; year--) {
        const url = `${API_ENDPOINT}/${year}/${normalizedFirstNameInitial}${normalizedLastName}.jpg`;
        if (await testImageUrl(url)) {
            return url;
        }
    }

    return ''; // Return an empty string if no valid URL is found
}

// Fonction pour tester si une URL d'image est valide
async function testImageUrl(url) {
    try {
        const response = await fetch(url, { method: 'HEAD' });
        console.log(`Response status for ${url}: ${response.status}`);
        return response.ok;
    } catch (error) {
        console.error(`Error testing URL ${url}:`, error);
        return false;
    }
}

// Fonction pour consolider les horaires des étudiants
function consolidateStudentSchedules(results) {
    const consolidated = {};

    results.forEach(item => {
        if (!consolidated[item.nom]) {
            consolidated[item.nom] = {
                nom: item.nom,
                classe: item.classe,
                horaires: [],
                laboratoire: item.laboratoire
            };
        }
        consolidated[item.nom].horaires.push(item.heure);
    });

    return Object.values(consolidated).map(student => {
        student.horaires = getMinMaxHours(student.horaires);
        return student;
    });
}

// Fonction pour obtenir les heures minimum et maximum de l'horaire d'un élève
function getMinMaxHours(hours) {
    if (hours.length === 0) return '';
    const sortedHours = hours.sort();
    const minHour = formatHour(sortedHours[0]);
    const maxHour = formatHour(sortedHours[sortedHours.length - 1]);
    return `${minHour} à ${maxHour}`;
}

// Fonction pour formater l'heure en HH:MM
function formatHour(time) {
    const [hours, minutes] = time.split(':');
    return `${hours}:${minutes}`;
}

// Attach the event listener to the search button
document.getElementById('search-button').addEventListener('click', searchStudents);