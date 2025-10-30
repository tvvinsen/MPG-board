let codeLeague = "PNAL4RJN";
let seasonNum = "9";
let nbPlayers = 8;
let nbDivisionsForSeason = 2;

let teamsOfDivision = [[]];
let liveStandings = [[]];
let calendarDiv = [[]];

let currentJournee = 1;
const totalJournees = 34; // Nombre total de journées en Ligue 1
let allMatches = [];

let API_URL_LEAGUE = 'https://api.mlnstats.com/mpgleague/league/' + codeLeague;

let codeLeagueAndSeasonNum = codeLeague + '_' + seasonNum;

let API_URL_TEAMS_DIV_1 = 'https://api.mlnstats.com/mpgleague/teams/' + codeLeagueAndSeasonNum + "_1";
let API_URL_TEAMS_DIV_2 = 'https://api.mlnstats.com/mpgleague/teams/' + codeLeagueAndSeasonNum + "_2";

let API_URL_DIV_1 = 'https://api.mpgstats.fr/mpgleague/matches/' + codeLeagueAndSeasonNum + "_1";
let API_URL_DIV_2 = 'https://api.mpgstats.fr/mpgleague/matches/' + codeLeagueAndSeasonNum + "_2";

const ringElement = '<span class="badge"><img src="./img/ring.png" style="vertical-align: bottom; width: 20px"/></span>';

/**
 * Charger et injecter des fragments SVG référencés par [data-src].
 * Utilise un cache pour éviter les fetchs répétés.
 */
const _svgCache = new Map();

async function loadSvgComponents(root = document) {
    const placeholders = Array.from(root.querySelectorAll('.svg-component[data-src]'));
    if (placeholders.length === 0) return;

    await Promise.all(placeholders.map(async el => {
        const src = el.getAttribute('data-src');
        if (!src) return;
        try {
            let svgText = _svgCache.get(src);
            if (!svgText) {
                const res = await fetch(src, {cache: 'no-cache'});
                if (!res.ok) throw new Error('Failed to load ' + src);
                svgText = await res.text();
                _svgCache.set(src, svgText);
            }
            // Insérer le SVG inline (accessible) et conserver les attributs aria si présents.
            el.innerHTML = svgText;
            // Si aria-hidden ou aria-labelledby existe sur le placeholder, propage-les au SVG inséré
            const svg = el.querySelector('svg');
            if (svg) {
                for (const attr of ['aria-hidden', 'aria-labelledby', 'role', 'title']) {
                    if (el.hasAttribute(attr) && !svg.hasAttribute(attr)) {
                        svg.setAttribute(attr, el.getAttribute(attr));
                    }
                }
            }
        } catch (err) {
            // en cas d'erreur, laisser le placeholder vide ou insérer un fallback simple
            console.error('loadSvgComponents:', err);
            el.innerHTML = '';
        }
    }));
}

// Gestion des onglets
document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
        // Masquer le message d'erreur lors du changement d'onglet au cas où il était visible
        document.getElementById('error').style.display = 'none';

        const tabId = button.getAttribute('data-tab');
        
        document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        button.classList.add('active');
        document.getElementById(tabId + '-tab').classList.add('active');
    });
});


// Charger les données au démarrage
async function loadMatches() {
    try {
        const response = await fetch('https://proxy-football-api.onrender.com/api/matches');
        const data = await response.json();
        allMatches = data?.matches || [];

        // Chercher la première journée avec des matchs non joués
        const firstUnplayed = allMatches.find(match => match.status !== 'FINISHED');
        currentJournee = firstUnplayed ? firstUnplayed.matchday : 1;
        displayJournee(currentJournee);
    } catch (error) {
        console.error('Erreur de chargement:', error);
        document.getElementById('loadingCal').innerHTML = 
            '<p style="color: #e74c3c;">Erreur lors du chargement des données</p>';
    }
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

// Afficher une journée spécifique
function displayJournee(journeeNum) {
    document.getElementById('loadingCal').style.display = 'block';
    document.getElementById('matchesContainer').style.display = 'none';
    
    // Simuler un délai de chargement
    setTimeout(() => {
        const journees = allMatches.filter(j => j.matchday === journeeNum);
        if (!journees || journees.length === 0) {
            document.getElementById('matchesContainer').innerHTML = 
                '<p style="text-align: center; padding: 40px;">Aucun match disponible pour cette journée</p>';
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
        const dateKey = match.utcDate;
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
    
    const statusClass = match.status === 'FINISHED' ? 'status-termine' : 'status-avenir';
    const statusText = match.status === 'FINISHED' ? 'Terminé' : 'À venir';
    
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

// Mettre à jour l'état des boutons de navigation
function updateNavigationButtons() {
    document.getElementById('prevBtn').disabled = currentJournee <= 1;
    document.getElementById('nextBtn').disabled = currentJournee >= totalJournees;
}

// Variable pour suivre la ligne actuellement étendue
let currentExpandedRowId = null;

let mapBonusTargeted = new Map();
let mapBonusPlayed = new Map();
let expandableTables = [];

// Classe pour gérer le tableau extensible
class ExpandableTable {
    constructor(containerId, divisionTitleId, data, bonusContainerId, bonusDivisionTitleId) {
        this.container = document.getElementById(containerId);
        this.bonusContainer = document.getElementById(bonusContainerId);
        this.divisionTitleId = divisionTitleId;
        this.bonusDivisionTitleId = bonusDivisionTitleId;
        this.data = data;
        this.divNum = data.divisionNum;
        this.clickHandler = null; // Référence à l'écouteur de clic
        this.init();
    }

    init() {
        this.render();
        this.attachEventListeners();
    }

    // Méthode pour nettoyer le composant
    destroy() {
        // Fermer la ligne étendue si elle existe
        if (currentExpandedRowId) {
            this.closeExpandedRow(currentExpandedRowId);
        }
        
        // Supprimer les écouteurs d'événements
        if (this.clickHandler) {
            this.container.removeEventListener('click', this.clickHandler);
            this.clickHandler = null;
        }
        
        // Vider le contenu
        if (this.container) {
            this.container.innerHTML = '';
        }
        if (this.bonusContainer) {
            this.bonusContainer.innerHTML = '';
        }
        
        const divisionTitle = document.getElementById(this.divisionTitleId);
        if (divisionTitle) {
            divisionTitle.innerHTML = '';
        }

        const bonusDivisionTitle = document.getElementById(this.bonusDivisionTitleId);
        if (bonusDivisionTitle) {
            bonusDivisionTitle.innerHTML = '';
        }
        
        // Libérer les références
        this.container = null;
        this.bonusContainer = null;
        this.divisionTitleId = null;
        this.bonusDivisionTitleId = null;
        this.data = null;
    }

    render() {
        // Personnalisation du nom de la division
        let divisionName = this.data.name === "undefined" ? `Division ${this.divNum}` : this.data.name;

        const divisionTitle = document.getElementById(this.divisionTitleId);
        divisionTitle.innerHTML = '';
        const divisionSpan = document.createElement('span');
        divisionSpan.innerHTML = `<p>${divisionName}</p>`;
        divisionTitle.appendChild(divisionSpan);

        const bonusDivisionTitle = document.getElementById(this.bonusDivisionTitleId);
        bonusDivisionTitle.innerHTML = '';
        const bonusDivisionSpan = document.createElement('span');
        bonusDivisionSpan.innerHTML = `<p>${divisionName}</p>`;
        bonusDivisionTitle.appendChild(bonusDivisionSpan);

        this.container.innerHTML = '';
        this.bonusContainer.innerHTML = '';

        this.data.teams.forEach((mpgTeam, index) => {
            this.container.appendChild(this.createDataRow(mpgTeam, index));
            this.bonusContainer.appendChild(this.createBonusRow(mpgTeam));
        });
    }

    createDataRow(mpgTeam, index) {
        const position = index + 1;
        let positionClass = '';

        const wdl = mpgTeam.win + '/' + mpgTeam.draw + '/' + mpgTeam.loss;
        const realGoals = formatGP(mpgTeam.realGP) + '/' + formatGC(mpgTeam.realGC)
        const mpgGoals = formatGP(mpgTeam.MPGGP) + '/' + formatGC(mpgTeam.MPGGC);
        const playerName = farmersPlayers().get(mpgTeam.MPGuserId) || 'Inconnu';
    
        // Construire une liste des bonus utilisés par le joueur
        const bonusFormates = formatBonusTitle(mpgTeam.bonusTab);

        // Gestion de l'anneau, extraction de la dernière journée de championnat sans modifier l'original
        let ring = '';
        const lastTimeline = [...mpgTeam.timeline].pop();
        if (lastTimeline.P === 1) {
            ring = ringElement;
        }

        // Gestion de la variation de position
        const lsTeam = liveStandings[this.divNum-1]?.filter(item => item.teamNum === mpgTeam.teamNum).pop();
        let variation = lsTeam?.variation ?? 0;
        let variationImg = '';
        if (variation < 0) {
            variationImg = '<img src="https://assets.eurosport.io/web/inArenaIcons/table-down.svg" style="width: 15px;"/>'
        } else if (variation > 0) {
            variationImg = '<img src="https://assets.eurosport.io/web/inArenaIcons/table-up.svg" style="width: 15px;"/>';
        }
        
        // Gestion du classement
        if (position === 1) {
            positionClass = 'first';
        } else if (position === 2) {
            positionClass = 'second';
        } else if (position === 3) {
            positionClass = 'third';
        }

        const tr = document.createElement('tr');
        tr.className = 'data-row';
        tr.setAttribute('data-row-id', mpgTeam.id);

        const numDivision = this.divNum;
        const nbJoueurs = this.data.teams.length;

        // Mise en évidence des équipes en situation de promotion
        if (mpgTeam.nextPromotion === 1) {
            tr.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
        }
        // Mise en évidence des équipes en situation de relégation
        else if (mpgTeam.nextPromotion === -1 && nbDivisionsForSeason !== numDivision) {
            tr.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
        }

        // Résultats des dernières journées
        const lastFiveMatches = document.createElement('div');
        const lastFiveMatchesChild = document.createElement('div');
        lastFiveMatchesChild.style.display = 'inline-flex';
        lastFiveMatches.appendChild(lastFiveMatchesChild);

        mpgTeam.timeline
            .slice(-5)  // Garder uniquement les 5 derniers éléments
            .forEach((day, index) => {
                // Sommer les buts réels marqués
                let butsGP = day.G?.flatMap(obj => Object.values(obj))
                    .reduce((a, b) => a + b, 0) || 0;
                // Ajouter les buts MPG
                butsGP += day.M?.length || 0;

                // Somme des buts encaissés
                const butsGC = (day.g || 0) + (day.m || 0);

                // Construction du titre de l'icône
                let titleDay;
                if (day.S === 'H') {
                    // Match à domicile 'Home'
                    titleDay = `${farmersPlayersId().get(mpgTeam.id) || 'Inconnu'} ${butsGP} - ${butsGC} ${farmersPlayersId().get(day.o) || 'Inconnu'}`;
                } else {
                    // Match à l'extérieur 'Away'
                    titleDay = `${farmersPlayersId().get(day.o) || 'Inconnu'} ${butsGC} - ${butsGP} ${farmersPlayersId().get(mpgTeam.id) || 'Inconnu'}`;
                }

                switch (day.r) {
                    case 'W': lastFiveMatchesChild.appendChild(createSuccessIconElement(titleDay)); break;
                    case 'D': lastFiveMatchesChild.appendChild(createNulIconElement(titleDay)); break;
                    case 'L': lastFiveMatchesChild.appendChild(createDefeatIconElement(titleDay)); break;
                }
            });

        const nbMissingTimelines = 5 - mpgTeam.timeline.length;
        Array.from({ length: nbMissingTimelines }, () => {
            lastFiveMatchesChild.appendChild(createNotPlayedIconElement());
        });

        tr.innerHTML = `
            <td class="position ${positionClass}"><span>${position}${variationImg}</span></td>
            <td class="joueur-name" title="${bonusFormates}">${mpgTeam.name} ${ring}<br><span style="font-size: 80%;">${playerName}</span></td>
            <td class="points">${mpgTeam.points} pts</td>
            <td style="text-align: center">${this.data.leagueDayScan}</td>
            <td style="text-align: center">${wdl}</td>
            <td style="text-align: center">${mpgTeam.goalAvg}</td>
            <td style="text-align: center">${realGoals}</td>
            <td style="text-align: center">${mpgGoals}</td>
            <td style="text-align: center">${lastFiveMatches.innerHTML}</td>
        `;
        return tr;
    }

    createExpandedRow(mpgUser) {
        const tr = document.createElement('tr');
        tr.className = 'expanded-row';
        tr.setAttribute('data-expanded-id', mpgUser.id);

        const td = document.createElement('td');
        td.colSpan = 9; // Nombre de colonnes dans le tableau principal																																							

        td.innerHTML = `
            <div class="details-panel" style="display: inline-flex">
                <h4>Informations du joueur ${mpgUser.name} (${mpgUser.abbr})</h4>
        `;

        const nbBonusDefault = Array.from(bonusDetails().entries()).map(([nom, [description, compteur]]) => compteur).reduce((a, b) => a + b, 0);   
        const bonusCount = getBonusCountUpdated(mpgUser.bonusTab);
        const availableBonuses = Array.from(bonusCount.entries()).filter(([nom, [description, compteur]]) => compteur > 0);
        const nbAvailableBonuses = availableBonuses.map(([nom, [description, compteur]]) => compteur).reduce((a, b) => a + b, 0);
        
        let tableHTML = '<table><tr>';

        if (nbAvailableBonuses > 0) {
            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div>Bonus disponible${nbAvailableBonuses > 1 ? "s" : ""} (${nbAvailableBonuses}/${nbBonusDefault})</div>
                    <div id="dispos" style="display: inline-flex; margin-right: 16px;">
                        ${availableBonuses.map(([nom, [description, compteur, linkImg]]) => `
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; vertical-align: middle;">
                                ${Array.from({ length: compteur }, 
                                    () => `<img title="${description}" src="${linkImg}" width="36.8" height="48" style="vertical-align: middle;">`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </td>
                `;
        }

        const bonusPlayed = Array.from(mapBonusPlayed.get(mpgUser.id));
        const nbBonusPlayed = bonusPlayed.length;

        if (nbBonusPlayed > 0) {
            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div>Bonus utilisé${nbBonusPlayed > 1 ? "s" : ""} (${nbBonusPlayed}/${nbBonusDefault})</div>
                    <div id="used" style="display: inline-flex; margin-right: 16px;">
                        ${bonusPlayed.map((element) => `
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; vertical-align: middle;">
                                ${Array.from({ length: 1 },
                                    () => `<img title="${element.info[1]} : contre ${element.adversaire} (J${element.day})" src="${element.info[2]}" width="36.8" height="48" style="vertical-align: middle;">`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </td>
                `;
        }

        tableHTML += `</td></tr></table>`;
        td.innerHTML += tableHTML;

        const bonusTargeted = mapBonusTargeted.get(mpgUser.id);
            
        if (bonusTargeted?.length > 0) {   
            let tableHTML = '<table><tr>';
            
            const targetBonus = Array.from(getBonusTargeted(bonusTargeted));

            // Trier les bonus par journée de championnat
            targetBonus.sort((a, b) => a[1][3].day - b[1][3].day);
            let nbBonusTarget = bonusTargeted.length

            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div>Bonus encaissé${nbBonusTarget > 1 ? "s" : ""} (${nbBonusTarget})</div>
                    <div id="used" style="display: inline-flex; margin-right: 16px;">
                        ${targetBonus.map(([nom, [bKey, libelle, linkImg, tmp]]) => `
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; vertical-align: middle;">
                                ${Array.from({ length: 1 }, 
                                    () => `<img title="${libelle} : attaque de ${tmp.nom} (J${tmp.day})" src="${linkImg}" width="36.8" height="48" style="vertical-align: middle;">`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </td>`;

            tableHTML += `</tr></table>`;
            td.innerHTML += tableHTML
        }

        const nextMatchToPlay = calendarDiv[this.divNum-1]?.filter(item => item.isPlayed === false).slice().shift();
        if (nextMatchToPlay) {
            const teamNextMatch = nextMatchToPlay?.matches.filter(it => it[0] === mpgUser.teamNum || it[1] === mpgUser.teamNum).pop();
            const homePlayer = teamsOfDivision[this.divNum-1]?.filter(it => it.teamNum === teamNextMatch[0]).slice().shift();
            const awayPlayer = teamsOfDivision[this.divNum-1]?.filter(it => it.teamNum === teamNextMatch[1]).slice().shift();

            td.innerHTML += `
                    <div>Prochain match : ${homePlayer.name} reçoit ${awayPlayer.name}</div>
            `;
        }

        td.innerHTML += `
                    <div>Classement général moyen : Points ${mpgUser.gScoreAvg} / Rang ${mpgUser.gRankAvg}</div>
                </div>
            </div>
        `;

        tr.appendChild(td);
        return tr;
    }

    createBonusRow(mpgUser) {
        const tr = document.createElement('tr');
        // tr.className = 'expanded-row';
        tr.setAttribute('bonus-id', mpgUser.id);

        const td = document.createElement('td');

        const nbBonusDefault = Array.from(bonusDetails().entries()).map(([nom, [description, compteur]]) => compteur).reduce((a, b) => a + b, 0);   
        const bonusCount = getBonusCountUpdated(mpgUser.bonusTab);
        const availableBonuses = Array.from(bonusCount.entries()).filter(([nom, [description, compteur]]) => compteur > 0);
        const nbAvailableBonuses = availableBonuses.map(([nom, [description, compteur]]) => compteur).reduce((a, b) => a + b, 0);
        
        let tableHTML = `<td style="padding-right: 16px;"><strong>${mpgUser.name}</strong></td>`;

        if (nbAvailableBonuses > 0) {
            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div id="dispos" style="display: inline-flex; margin-right: 16px;">
                        ${availableBonuses.map(([nom, [description, compteur, linkImg]]) => `
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; vertical-align: middle;">
                                ${Array.from({ length: compteur }, 
                                    () => `<img title="${description}" src="${linkImg}" width="30" height="42" style="vertical-align: middle;">`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </td>
                `;
        }

        const bonusPlayed = Array.from(mapBonusPlayed.get(mpgUser.id));
        const nbBonusPlayed = bonusPlayed.length;

        if (nbBonusPlayed > 0) {
            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div id="used" style="display: inline-flex; margin-right: 16px;">
                        ${bonusPlayed.map((element) => `
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; vertical-align: middle;">
                                ${Array.from({ length: 1 },
                                    () => `<img title="${element.info[1]} : contre ${element.adversaire} (J${element.day})" src="${element.info[2]}" width="30" height="42" style="vertical-align: middle;">`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </td>
                `;
        }

        const bonusTargeted = mapBonusTargeted.get(mpgUser.id);

        if (bonusTargeted?.length > 0) {   
            const targetBonus = Array.from(getBonusTargeted(bonusTargeted));

            // Trier les bonus par journée de championnat
            targetBonus.sort((a, b) => a[1][3].day - b[1][3].day);
            let nbBonusTarget = bonusTargeted.length

            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div id="used" style="display: inline-flex; margin-right: 16px;">
                        ${targetBonus.map(([nom, [bKey, libelle, linkImg, tmp]]) => `
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; vertical-align: middle;">
                                ${Array.from({ length: 1 }, 
                                    () => `<img title="${libelle} : attaque de ${tmp.nom} (J${tmp.day})" src="${linkImg}" width="30" height="42" style="vertical-align: middle;">`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </td>`;
        }

        tableHTML += `</tr>`;
        tr.innerHTML += tableHTML;
        return tr;
    }

    attachEventListeners() {
        // Créer une référence à la fonction handler pour pouvoir la supprimer plus tard
        this.clickHandler = (e) => {
            e.preventDefault();
            const dataRow = e.target.closest('.data-row');
            if (dataRow) {
                const rowId = parseInt(dataRow.getAttribute('data-row-id'));
                this.handleRowClick(rowId, dataRow);
            }
        };
        // Attacher l'événement avec la référence stockée
        this.container.addEventListener('click', this.clickHandler);}

    handleRowClick(rowId, rowElement) {
        // Fermer la ligne actuellement étendue si elle existe et est différente
        if (currentExpandedRowId && currentExpandedRowId !== rowId) {
            this.closeExpandedRow(currentExpandedRowId);
        }

        // Vérifier si la ligne cliquée est déjà étendue
        const existingExpandedRow = document.querySelector(`[data-expanded-id="${rowId}"]`);

        if (existingExpandedRow) {
            // Fermer la ligne étendue
            this.closeExpandedRow(rowId);
            currentExpandedRowId = null;
        } else {
            const mpgTeam = this.data.teams.find(item => item.id === rowId);
            if (!mpgTeam) {
                console.error('Équipe non trouvée pour l\'ID:', rowId);
                return;
            }
            // Ouvrir la nouvelle ligne étendue
            const expandedRow = this.createExpandedRow(mpgTeam);
            rowElement.after(expandedRow);
            rowElement.classList.add('expanded');
            currentExpandedRowId = rowId;
        }
    }

    closeExpandedRow(rowId) {
        const expandedRow = document.querySelector(`[data-expanded-id="${rowId}"]`);
        const dataRow = document.querySelector(`[data-row-id="${rowId}"]`);

        if (expandedRow) {
            expandedRow.classList.add('fadeOut');
            setTimeout(() => {
                expandedRow.remove();
                if (dataRow) {
                    dataRow.classList.remove('expanded');
                }
            }, 200);
        }
    }

    // Méthodes utilitaires pour ajouter/supprimer des lignes
    addRow(newRowData) {
        this.data.push(newRowData);
        this.render();
        this.attachEventListeners();
    }

    removeRow(rowId) {
        this.data = this.data.filter(item => item.id !== rowId);
        this.closeExpandedRow(rowId);
        this.render();
        this.attachEventListeners();
    }

    updateRow(rowId, newData) {
        const index = this.data.findIndex(item => item.id === rowId);
        if (index !== -1) {
            this.data[index] = { ...this.data[index], ...newData };
            this.render();
            this.attachEventListeners();
        }
    }
}

const createNotPlayedIconElement = (labelId = 'validation-notplayed') => {
    const div = document.createElement('div');
    div.setAttribute('aria-labelledby', labelId);
    div.innerHTML = `
        <svg aria-hidden="true" viewBox="0 0 22 22" style="height: 22px; width: 22px">
            <path d="M18 11a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" fill="none" stroke="#9D9BA7" stroke-width="2"></path>
        </svg>`;
    return div;
};

const createSuccessIconElement = (title) => {
    const labelId = 'validation-success'
    const div = document.createElement('div');
    div.setAttribute('aria-labelledby', labelId);
    div.innerHTML = `<span title="${title}">${_svgCache.get('./img/svg/victory-icon.svg') || ''}</span>`;
    return div;
};

const createNulIconElement = (title) => {
    const labelId = 'validation-nul';
    const div = document.createElement('div');
    div.setAttribute('aria-labelledby', labelId);
    div.innerHTML = `<span title="${title}">${_svgCache.get('./img/svg/draw-icon.svg') || ''}</span>`;
    return div;
};

const createDefeatIconElement = (title) => {
    const labelId = 'validation-defeat';
    const div = document.createElement('div');
    div.setAttribute('aria-labelledby', labelId);
    div.innerHTML = `<span title="${title}">${_svgCache.get('./img/svg/loss-icon.svg') || ''}</span>`;
    return div;
};

async function fetchJson(url) {
    const resp = await fetch(url);
    if (!resp.ok) {
        console.error(url, ' -> Erreur HTTP ' + resp.status);
        return null;
    } else {
        return resp.json();
    }
}

async function fetchLeague() {
    try {
        const response = await fetch(API_URL_LEAGUE);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if(data?.error === 'championshipNotManaged') {
            throw new Error('Championnat non géré par la source de données.');
        }
        else if(data?.error === 'notFetchable') {
            throw new Error('Ligue non trouvée. Vérifiez le code de la ligue.');
        } else {
            displayLeague(data);
        }
    } catch (error) {
        contentDisplay(); // Afficher le contenu même en cas d'erreur
        showError(`Impossible de charger les données de la ligue : ${error.message}`);
        throw error; // Rejeter la promesse pour indiquer l'échec
    }
}

function displayLeague(data) {
    seasonNum = data?.seasonNum?.toString() || "1";

    // Déterminer la quantité de divisions de la saison courante
    const divisionsForSeason = (data.divisions || []).filter(div => div.seasonNum.toString() === seasonNum);
    nbDivisionsForSeason = divisionsForSeason.length;

    // Affichage de la ligue
    const leagueTitle = document.getElementById('leagueTitle');
    leagueTitle.innerHTML = '';
    const spanELement = document.createElement('span');
    
    let spanLibelle = `<p>${data.name} / Saison ${seasonNum}</p>`
    if (nbDivisionsForSeason > 1)
        spanLibelle += `<h6>(${nbDivisionsForSeason} divisions)</h6>`;
    
    spanELement.innerHTML = spanLibelle;
    leagueTitle.appendChild(spanELement);

    updateApiUrls();        
}

function loadLeague(newLeagueCode) {
    if (!newLeagueCode || newLeagueCode.trim() === '') {
        showError('Veuillez entrer un code de ligue valide.');
        return;
    }

    codeLeague = newLeagueCode.trim().toUpperCase();
    updateApiUrls();

    fetchLeague()
        .then(() => {
            // Basculer vers l'onglet Classement
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            const classementTabButton = document.querySelector('.tab-button[data-tab="classement"]');
            classementTabButton.classList.add('active');
            document.getElementById('classement-tab').classList.add('active');

            nbPlayers = 0;
            mapBonusTargeted.clear();
            mapBonusPlayed.clear();
            currentExpandedRowId = null;

            // Nettoyer les anciens composants ExpandableTable
            expandableTables.forEach(table => {
                if (table && typeof table.destroy === 'function') {
                    table.destroy();
                }
            });
            expandableTables = [];

            document.getElementById('content').style.display = 'none';
            document.getElementById('error').style.display = 'none';
            document.getElementById('loading').style.display = 'block';

            fetchMatches();
        })
        .catch((error) => {
            console.error('Erreur lors du fetch de la league:', error);
            throw error; // Propager l'erreur pour arrêter le processus
        });
}

function updateApiUrls() {
    API_URL_LEAGUE = 'https://api.mlnstats.com/mpgleague/league/' + codeLeague;
    codeLeagueAndSeasonNum = codeLeague + '_' + seasonNum;
    API_URL_DIV_1 = 'https://api.mpgstats.fr/mpgleague/matches/' + codeLeagueAndSeasonNum + "_1";
    API_URL_DIV_2 = 'https://api.mpgstats.fr/mpgleague/matches/' + codeLeagueAndSeasonNum + "_2";

    API_URL_TEAMS_DIV_1 = 'https://api.mlnstats.com/mpgleague/teams/' + codeLeagueAndSeasonNum + "_1";
    API_URL_TEAMS_DIV_2 = 'https://api.mlnstats.com/mpgleague/teams/' + codeLeagueAndSeasonNum + "_2";
}

async function fetchMatches() {
    try {
        const divisionConfigs = [];
        divisionConfigs.push([API_URL_DIV_1, 'classementBodyDiv1', 'divisionTitle1', 'division1', 'bonusBodyDiv1', 'bonusDivisionTitle1', API_URL_TEAMS_DIV_1]);
        // Inclure la deuxième division uniquement si elle est présente
        if (nbDivisionsForSeason > 1) {
            divisionConfigs.push([API_URL_DIV_2, 'classementBodyDiv2', 'divisionTitle2', 'division2', 'bonusBodyDiv2', 'bonusDivisionTitle2', API_URL_TEAMS_DIV_2]);
            document.getElementById('div2').style.display = 'block';
            document.getElementById('bonusdiv2').style.display = 'block';
        } else {
            // Si une deuxième division n'est pas présente, masquer son conteneur
            document.getElementById('div2').style.display = 'none';
            document.getElementById('bonusdiv2').style.display = 'none';
        }

        const allTeams = await Promise.all(
            divisionConfigs.map(([url, a, b, c, d, e, urlTeam]) => fetchJson(urlTeam))
        );

        allTeams.forEach((teams, i) => {
            teamsOfDivision[i] = allTeams[i].teams;
        });

        const allMatches = await Promise.all(
            divisionConfigs.map(([url]) => fetchJson(url))
        );

        allMatches.forEach((matches, i) => {
            // Il faut supprimer les anciens tableaux avant d'en créer de nouveaux
            let oldContainer = document.getElementById(divisionConfigs[i][1]);
            oldContainer.innerHTML = '';
            oldContainer = document.getElementById(divisionConfigs[i][2]);
            oldContainer.innerHTML = '';

            nbPlayers = matches.division.teams.length;
            liveStandings[i] = matches.liveStandings;
            calendarDiv[i] = matches.calendar;

            matches.division.teams.forEach((mpgTeam) => {
                const listeBonus = bonusList();
                mpgTeam.timeline.forEach((day, index) => {
                    const opponent = farmersPlayersId().get(day.o) || 'Inconnu';

                    // Filtrer les bonus non pertinents (0 : Capitaine, 6 : Chapron, 8 : 4 défenseurs, 9 : 5 défenseurs)
                    const idxBonus = day?.b?.filter(bonus => ![0, 6, 8, 9].includes(bonus)).flatMap(bonus => bonus);

                    // Construire une map des bonus ciblés pour chaque opposant
                    const keyOpponentId = day.o;

                    if (idxBonus && idxBonus.length === 1) {
                        const existingData = mapBonusTargeted.get(keyOpponentId) || [];
                        mapBonusTargeted.set(keyOpponentId, [...existingData, {nom : farmersPlayersId().get(mpgTeam.id) ?? 'Inconnu', bonus: idxBonus, day: index + 1}]);

                        const existingDataPlayed = mapBonusPlayed.get(mpgTeam.id) || [];
                        const detail = listeBonus[idxBonus[0]];
                        mapBonusPlayed.set(mpgTeam.id, [...existingDataPlayed, {adversaire : opponent, bonus: idxBonus[0], day: index + 1, info: detail}]);
                    } else {
                        mapBonusTargeted.set(keyOpponentId, mapBonusTargeted.get(keyOpponentId) || []);
                        mapBonusPlayed.set(mpgTeam.id, mapBonusPlayed.get(mpgTeam.id) || []);
                    }
                });
            });

            expandableTables.push(new ExpandableTable(divisionConfigs[i][1], divisionConfigs[i][2], matches.division, divisionConfigs[i][4], divisionConfigs[i][5]));
        });

        contentDisplay();

    } catch (error) {
        console.error('Erreur:', error);
        showError('Erreur lors du chargement des matchs. Vérifiez le code de la ligue.');
    }
}

function bonusDetails() {
    const bonusMap = new Map();

    let nbUber = 3;
    let nbSuarez = 1;
    let nbTonton = 1;
    let nbCheat = 1;

    switch(nbPlayers) {
        case 6:
            nbUber = 2;
            nbCheat = 0;
            nbTonton = 0;
            break;
        case 10:
            nbSuarez = 2;
            break;
    }

    bonusMap.set("valise", ["Valise à Nanard", 1, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_c8a2c4971c.png"]);
    bonusMap.set("uber", ["McDo+", nbUber, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/mcdo_XNSJJIK_7_4d86759c68.png"]);
    bonusMap.set("suarez", ["Suarez", nbSuarez, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_73c40fcf0f.png"]);
    bonusMap.set("zahia", ["Zahia", 1, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_587179007b.png"]);
    bonusMap.set("miroir", ["Miroir", 1, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/thumbnail_miroir_DPKQOLRY_3fa41cbb7a.png"]);
    bonusMap.set("tonton", ["Tonton Pat'", nbTonton, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_45de0b018a.png"]);
    bonusMap.set("decat", ["4 Decat", 1, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_8b62f75294.png"]);
    bonusMap.set("cheat", ["Cheat Code 18-26", nbCheat, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/cheat_Code_RQGFVQYS_c1cf552f40.webp"]);
    return Object.freeze(bonusMap);
}

function bonusList() {
    const bonus = [];
    bonus.push(["captain", "Capitaine", ""]);
    bonus.push(["valise", "Valise à Nanard", "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_c8a2c4971c.png"]);
    bonus.push(["uber", "McDo+", "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/mcdo_XNSJJIK_7_4d86759c68.png"]);
    bonus.push(["suarez", "Suarez", "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_73c40fcf0f.png"]);
    bonus.push(["zahia", "Zahia", "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_587179007b.png"]);
    bonus.push(["miroir", "Miroir", "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/thumbnail_miroir_DPKQOLRY_3fa41cbb7a.png"]);
    bonus.push(["chapron", "Chapron", ""]);
    bonus.push(["tonton", "Tonton Pat'", "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_45de0b018a.png"]);
    bonus.push(["4def", "4 Défenseurs", ""]);
    bonus.push(["5def", "5 Défenseurs", ""]);
    bonus.push(["decat", "4 Decat", "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_8b62f75294.png"]);
    bonus.push(["cheat", "Cheat Code 18-26", "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/cheat_Code_RQGFVQYS_c1cf552f40.webp"]);
    return Object.freeze(bonus);
}

function farmersPlayers() {
    const mapPlayerNames = new Map();
    mapPlayerNames.set(188049, "Yannick");
    mapPlayerNames.set(3535140, "Jérôme");
    mapPlayerNames.set(649848, "Vincent");
    mapPlayerNames.set(5142264, "Richard");
    mapPlayerNames.set(3536346, "David");
    mapPlayerNames.set(521473, "Robin");
    mapPlayerNames.set(6429552, "Benoît");
    mapPlayerNames.set(6430884, "Julien");

    mapPlayerNames.set(5892169, "Nicolas");
    mapPlayerNames.set(1497344, "Antoine P.");
    mapPlayerNames.set(1519479, "Jean-Philippe");
    mapPlayerNames.set(6429841, "Stéphane");
    mapPlayerNames.set(7143201, "Charlotte");
    mapPlayerNames.set(7206496, "Leïla");
    mapPlayerNames.set(6942448, "Thomas");
    mapPlayerNames.set(6742055, "Antoine C.");
    return mapPlayerNames;
}

function farmersPlayersId() {
    const mapPlayerNames = new Map();
    mapPlayerNames.set(2919624, "Yannick");
    mapPlayerNames.set(2919625, "Jérôme");
    mapPlayerNames.set(2919631, "Vincent");
    mapPlayerNames.set(2919627, "Richard");
    mapPlayerNames.set(2919626, "David");
    mapPlayerNames.set(2919628, "Robin");
    mapPlayerNames.set(2919629, "Benoît");
    mapPlayerNames.set(2919630, "Julien");

    mapPlayerNames.set(2919634, "Nicolas");
    mapPlayerNames.set(2919632, "Antoine P.");
    mapPlayerNames.set(2919633, "Jean-Philippe");
    mapPlayerNames.set(2919635, "Stéphane");
    mapPlayerNames.set(2919638, "Charlotte");
    mapPlayerNames.set(2919639, "Leïla");
    mapPlayerNames.set(2919637, "Thomas");
    mapPlayerNames.set(2919636, "Antoine C.");
    return mapPlayerNames;
}

function formatGP(goalGP) {
    return (goalGP > 0 ? '+' : '') + goalGP;
}

function formatGC(goalGC) {
    return (goalGC > 0 ? '-' : '') + goalGC;
}

function getBonusCountUpdated(bonusTab) {

    const detailsBonus = bonusDetails();

    // Décrémenter le compteur de chacun des bonus joués																	   
    Object.entries(bonusTab)
        .forEach(([key, value]) => {
            const detail = detailsBonus.get(key);
            if (detail)
                detail[1] -= value;
        });

    return detailsBonus;
}

function getBonusTargeted(bonusTab) {
    const setBonus = bonusList();

    const map = new Map(
    Object.entries(bonusTab)
        .map(([key, value]) => {                    
            const detail = setBonus[value.bonus[0]];
            return [key, [...detail, value]];
        })
    );

    return map;
}

function formatBonusTitle(bonusTab) {
    const bonusCount = getBonusCountUpdated(bonusTab);

    const remainingBonuses = [...bonusCount.values()]
        .filter(([nom, compteur]) => compteur > 0)
        .map(([nom, compteur]) => `${nom} (${compteur})`)
        .join(' - ');

    const nbBonusDefault = Array.from(bonusDetails().entries()).map(([nom, [description, compteur]]) => compteur).reduce((a, b) => a + b, 0);   
    const bonusDispos = Array.from(bonusCount.entries()).filter(([nom, [description, compteur]]) => compteur > 0);
    let nbBonusDispos = bonusDispos.map(([nom, [description, compteur]]) => compteur).reduce((a, b) => a + b, 0);

    return remainingBonuses.length > 0 ? "Bonus disponibles (" + nbBonusDispos + "/" + nbBonusDefault + ") : " + remainingBonuses : "Plus aucun bonus disponible !"
}

function contentDisplay() {
    hideLoading();
    document.getElementById('content').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showError(message = 'Erreur lors du chargement des données. Veuillez réessayer.') {
    hideLoading();
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Chargement initial
fetchLeague()
    .then(() => {
        fetchMatches();
    });

loadMatches();

document.addEventListener('DOMContentLoaded', () => {
    // Charger les composants SVG
    loadSvgComponents();

    // Gestion du formulaire de sélection de ligue
    document.getElementById('leagueForm').addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('error').style.display = 'none';  // Cacher les erreurs précédentes
        const input = document.getElementById('leagueCodeInput'); 
        try {
            loadLeague(input.value)
        }          
        catch(error) {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            const cfgTabButton = document.querySelector('.tab-button[data-tab="cfg"]');
            cfgTabButton.classList.add('active');
            document.getElementById('cfg-tab').classList.add('active');

            console.error('Erreur lors du chargement de la ligue:', error);
            return; // Sortir de la fonction en cas d'erreur
        }

    });
});

// Gestion du sous-menu avec click si nécessaire
document.querySelectorAll('.submenu button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tab = btn.dataset.tab;
        showTab(tab);
    });
});

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Actualisation automatique toutes les heures
setInterval(fetchMatches, 60 * 60 * 1000);
