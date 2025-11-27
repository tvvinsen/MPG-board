let totalJournees; // Nombre total de journées en Ligue 1
let allMatches = [];
let currentJournee = 1;

// Charger les données au démarrage
async function loadMatches() {
    try {
        const response = await fetch('https://proxy-football-api.onrender.com/api/matches');
        const data = await response.json();
        allMatches = data?.matches || [];

        totalJournees = Math.max(...allMatches.map(m => m.matchday));
        
        // Chercher la première journée avec des matchs non joués
        const firstUnplayed = allMatches.find(match => match.status !== 'FINISHED');
        currentJournee = firstUnplayed?.matchday ?? 1;
        displayJournee(currentJournee);
    } catch (error) {
        console.error('Erreur de chargement:', error);
        document.getElementById('loadingCal').innerHTML = 
            '<p style="color: #e74c3c;">Erreur lors du chargement des données</p>';
    }
}

// Afficher une journée spécifique
function displayJournee(journeeNum) {
    document.getElementById('loadingCal').style.display = 'block';
    document.getElementById('matchesContainer').style.display = 'none';
    
    // Simuler un délai de chargement
    setTimeout(() => {
        const journees = allMatches.filter(j => j.matchday === journeeNum);
        if (!journees || journees.length === 0) {
            document.getElementById('matchesContainer').innerHTML = 
                '<p style="text-align: center; padding: 10px;">Aucun match disponible pour cette journée</p>';
        } else {
            renderMatches(journees);
        }
        
        document.getElementById('currentJournee').textContent = journeeNum;
        updateJourneeDates(journees);
        document.getElementById('loadingCal').style.display = 'none';
        document.getElementById('matchesContainer').style.display = 'block';
        
        updateNavigationButtons();
    }, 300);
}

// Mettre à jour les dates de la journée
function updateJourneeDates(journeeData) {
    const datesDiv = document.getElementById('journeeDates');
    if (journeeData && journeeData.dates) {
        const startDate = new Date(journeeData.dates.start).toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short' 
        });
        const endDate = new Date(journeeData.dates.end).toLocaleDateString('fr-FR', { 
            day: 'numeric', 
            month: 'short',
            year: 'numeric'
        });
        datesDiv.textContent = `${startDate} - ${endDate}`;
    }
}

// Afficher les matchs
function renderMatches(journees) {
    const container = document.getElementById('matchesContainer');
    container.innerHTML = '';
    
    // Grouper les matchs par date
    const matchesByDate = {};
    journees.forEach(match => {
        // Récupérer la date au format YYYY-MM-DD pour regrouper les matchs par jour
        const dateKey = match.utcDate.split('T')[0];
        if (!matchesByDate[dateKey]) {
            matchesByDate[dateKey] = [];
        }
        matchesByDate[dateKey].push(match);
    });
    
    // Afficher chaque groupe de date
    Object.entries(matchesByDate).forEach(([date, matches]) => {
        const dateGroup = document.createElement('div');
        dateGroup.className = 'match-date-group';
        
        const dateHeader = document.createElement('div');
        dateHeader.className = 'match-date-header';
        
        dateHeader.textContent = new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
        dateGroup.appendChild(dateHeader);
        
        matches.forEach(match => {
            const matchCard = createMatchCard(match);
            dateGroup.appendChild(matchCard);
        });
        
        container.appendChild(dateGroup);
    });
}

// Créer une carte de match
function createMatchCard(match) {
    const card = document.createElement('div');
    card.className = 'match-card';
    
    const time = new Date(match.utcDate).toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
    });
    
    let statusClass;
    let statusText;

    switch (match.status) {
        case 'FINISHED':
            statusClass = 'status-termine';
            statusText = 'Terminé';
            // Actions spécifiques pour les matchs terminés
            break;
        case 'IN_PLAY':
            statusClass = 'status-inplay';
            statusText = 'En cours';
            // Actions spécifiques pour les matchs à venir
            break;
        default:
            statusClass = 'status-avenir';
            statusText = 'À venir';
            // Actions par défaut
            break;
    }

    card.innerHTML = `
        <div class="match-time">${time}</div>
        <div class="match-content">
            <div class="team-section">
                <div class="team-name">${match.homeTeam.shortName}</div>
            </div>
            <div class="match-score">${match.score.fullTime.home ?? ''} - ${match.score.fullTime.away ?? ''}</div>
            <div class="team-section-away">
                <div class="team-name-away">${match.awayTeam.shortName}</div>
            </div>
        </div>
        <span class="match-status ${statusClass}">${statusText}</span>
    `;
    
    return card;
}

// Fonction pour changer de journée
function changeJournee(direction, event) {
    const newJournee = currentJournee + direction;
    
    if (newJournee < 1 || newJournee > totalJournees) {
        return;
    }
    
    currentJournee = newJournee;
    displayJournee(currentJournee);
    updateNavigationButtons();
}

// Mettre à jour l'état des boutons de navigation
function updateNavigationButtons() {
    document.getElementById('prevBtn').disabled = currentJournee <= 1;
    document.getElementById('nextBtn').disabled = currentJournee >= totalJournees;
}

loadMatches();
