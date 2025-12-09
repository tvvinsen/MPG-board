let totalJourneesChampions; // Nombre total de journées
let allMatchesChampions = [];
let currentJourneeChampions = 1;

// Enumérer les types de stages
var stageTypes = new Map();
stageTypes.set("LEAGUE_STAGE", 1);
stageTypes.set("PLAYOFFS", 2);
stageTypes.set("LAST_16", 3);
stageTypes.set("QUARTER_FINALS", 4);
stageTypes.set("SEMI_FINALS", 5);
stageTypes.set("FINAL", 6);


// Charger les données au démarrage
async function loadChampions() {
    try {
        const response = await fetch('https://proxy-football-api.onrender.com/api/eu-cl');
        const data = await response.json();
        allMatchesChampions = data?.matches || [];

        var previousStage = undefined
        var previousMatchDay = undefined
        var currentStageIndex = 1;
        // Parcourir les matchs pour assigner un index unique à chaque journée de même 'stage
        allMatchesChampions.forEach((match, index) => {
            if (index === 0) {
                previousStage = match.stage;
                previousMatchDay = match.matchday;
                match.index = currentStageIndex;
            } else {
                if (match.stage === previousStage) {
                    if (match.matchday === previousMatchDay) {
                        match.index = currentStageIndex;
                        // Même journée, ne pas incrémenter
                    } else {
                        currentStageIndex++;
                        match.index = currentStageIndex;
                    }
                } else {
                    currentStageIndex++;
                    match.index = currentStageIndex;
                    previousStage = match.stage;
                }
                previousMatchDay = match.matchday;
            }
        }); 

        totalJourneesChampions = currentStageIndex;

        // Chercher la première journée avec des matchs non joués
        const firstUnplayed = allMatchesChampions.find(match => match.status !== 'FINISHED');
        currentJourneeChampions = firstUnplayed?.matchday ?? 1;
        displayJourneeChampions(currentJourneeChampions);
    } catch (error) {
        console.error('Erreur de chargement:', error);
        document.getElementById('loadingCalChampions').innerHTML = 
            '<p style="color: #e74c3c;">Erreur lors du chargement des données</p>';
    }
}

// Afficher une journée spécifique
function displayJourneeChampions(journeeNum) {
    document.getElementById('loadingCalChampions').style.display = 'block';
    document.getElementById('matchesContainerChampions').style.display = 'none';
    
    // Simuler un délai de chargement
    setTimeout(() => {
        const journees = allMatchesChampions.filter(j => j.index === journeeNum);
        if (!journees || journees.length === 0) {
            document.getElementById('matchesContainerChampions').innerHTML = 
                '<p style="text-align: center; padding: 10px;">Aucun match disponible pour cette journée</p>';
        } else {
            renderMatchesChampions(journees);
        }
        
        document.getElementById('currentJourneeChampions').textContent = journeeNum;
        updateJourneeDatesChampions(journees);
        document.getElementById('loadingCalChampions').style.display = 'none';
        document.getElementById('matchesContainerChampions').style.display = 'block';
        
        updateNavigationButtonsChampions();
    }, 300);
}

// Mettre à jour les dates de la journée
function updateJourneeDatesChampions(journeeData) {
    const datesDiv = document.getElementById('journeeDatesChampions');
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
function renderMatchesChampions(journees) {
    const container = document.getElementById('matchesContainerChampions');
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
            const matchCard = createMatchCardChampions(match);
            dateGroup.appendChild(matchCard);
        });
        
        container.appendChild(dateGroup);
    });
}

// Créer une carte de match
function createMatchCardChampions(match) {
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
                <div class="team-name">${match.homeTeam.shortName ?? 'NA'}</div>
            </div>
            <div class="match-score">${match.score.fullTime.home ?? ''} - ${match.score.fullTime.away ?? ''}</div>
            <div class="team-section-away">
                <div class="team-name-away">${match.awayTeam.shortName ?? 'NA'}</div>
            </div>
        </div>
        <span class="match-status ${statusClass}">${statusText}</span>
    `;
    
    return card;
}

// Fonction pour changer de journée
function changeJourneeChampions(direction, event) {
    const newJournee = currentJourneeChampions + direction;
    
    if (newJournee < 1 || newJournee > totalJourneesChampions) {
        return;
    }
    
    currentJourneeChampions = newJournee;
    displayJourneeChampions(currentJourneeChampions);
    updateNavigationButtonsChampions();
}

// Mettre à jour l'état des boutons de navigation
function updateNavigationButtonsChampions() {
    document.getElementById('prevBtnChampions').disabled = currentJourneeChampions <= 1;
    document.getElementById('nextBtnChampions').disabled = currentJourneeChampions >= totalJourneesChampions;
}

loadChampions();
