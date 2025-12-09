let totalJourneesPL; // Nombre total de journées
let allMatchesPL = [];
let currentJourneePL = 1;

// Enumérer les types de stages
var stageTypes = new Map();
stageTypes.set("LEAGUE_STAGE", 1);
stageTypes.set("PLAYOFFS", 2);
stageTypes.set("LAST_16", 3);
stageTypes.set("QUARTER_FINALS", 4);
stageTypes.set("SEMI_FINALS", 5);
stageTypes.set("FINAL", 6);


// Charger les données au démarrage
async function loadMatchesPL() {
    try {
        const response = await fetch('https://proxy-football-api.onrender.com/api/en-pl');
        const data = await response.json();
        allMatchesPL = data?.matches || [];

        var previousStage = undefined
        var previousMatchDay = undefined
        var currentStageIndex = 1;
        // Parcourir les matchs pour assigner un index unique à chaque journée de même 'stage
        allMatchesPL.forEach((match, index) => {
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

        totalJourneesPL = currentStageIndex;

        // Chercher la première journée avec des matchs non joués
        const firstUnplayed = allMatchesPL.find(match => match.status !== 'FINISHED');
        currentJourneePL = firstUnplayed?.matchday ?? 1;
        displayJourneePL(currentJourneePL);
    } catch (error) {
        console.error('Erreur de chargement:', error);
        document.getElementById('loadingCalPL').innerHTML = 
            '<p style="color: #e74c3c;">Erreur lors du chargement des données</p>';
    }
}

// Afficher une journée spécifique
function displayJourneePL(journeeNum) {
    document.getElementById('loadingCalPL').style.display = 'block';
    document.getElementById('matchesContainerPL').style.display = 'none';
    
    // Simuler un délai de chargement
    setTimeout(() => {
        const journees = allMatchesPL.filter(j => j.index === journeeNum);
        if (!journees || journees.length === 0) {
            document.getElementById('matchesContainerPL').innerHTML = 
                '<p style="text-align: center; padding: 10px;">Aucun match disponible pour cette journée</p>';
        } else {
            renderMatchesPL(journees);
        }
        
        document.getElementById('currentJourneePL').textContent = journeeNum;
        updateJourneeDatesPL(journees);
        document.getElementById('loadingCalPL').style.display = 'none';
        document.getElementById('matchesContainerPL').style.display = 'block';
        
        updateNavigationButtonsPL();
    }, 300);
}

// Mettre à jour les dates de la journée
function updateJourneeDatesPL(journeeData) {
    const datesDiv = document.getElementById('journeeDatesPL');
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
function renderMatchesPL(journees) {
    const container = document.getElementById('matchesContainerPL');
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
            const matchCard = createMatchCardPL(match);
            dateGroup.appendChild(matchCard);
        });
        
        container.appendChild(dateGroup);
    });
}

// Créer une carte de match
function createMatchCardPL(match) {
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
function changeJourneePL(direction, event) {
    const newJournee = currentJourneePL + direction;
    
    if (newJournee < 1 || newJournee > totalJourneesPL) {
        return;
    }
    
    currentJourneePL = newJournee;
    displayJourneePL(currentJourneePL);
    updateNavigationButtonsPL();
}

// Mettre à jour l'état des boutons de navigation
function updateNavigationButtonsPL() {
    document.getElementById('prevBtnPL').disabled = currentJourneePL <= 1;
    document.getElementById('nextBtnPL').disabled = currentJourneePL >= totalJourneesPL;
}

loadMatchesPL();
