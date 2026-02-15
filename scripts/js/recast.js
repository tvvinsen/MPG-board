let codeLeague = "PNAL4RJN";
let seasonNum = undefined;
let seasonNumChoice = undefined;
let nbPlayers = 8;
let nbDivisionsForSeason = 2;

let teamsOfDivision = [[]];
let liveStandings = [[]];
let calendarDiv = [[]];
let divisions = [];
let bonusesRules = [];

function createDivisionPairs() {
    const numDivisions = nbDivisionsForSeason;
    divisions = [];
    for (let i = 1; i <= numDivisions; i++) divisions.push(i);

    const tabSelect = document.querySelector('.division-tab-select');
    const tabContent = document.querySelector('.divisions-content');
    if (!tabSelect || !tabContent) return;
    tabSelect.innerHTML = '';
    tabContent.innerHTML = '';

    const tabSelectBonus = document.querySelector('.division-tab-select-bonus');
    const bonusContent = document.querySelector('.bonus-content');
    if (!tabSelectBonus || !bonusContent) return;
    tabSelectBonus.innerHTML = '';
    bonusContent.innerHTML = '';

    const tabSelectResults = document.querySelector('.division-tab-select-results');
    const resultsContent = document.querySelector('.results-content');
    if (!tabSelectResults || !resultsContent) return;
    tabSelectResults.innerHTML = '';
    resultsContent.innerHTML = '';

    const tabSelectLigue = document.querySelector('.division-tab-select-ligue');
    const ligueContent = document.querySelector('.ligue-content');
    if (!tabSelectLigue || !ligueContent) return;
    tabSelectLigue.innerHTML = '';
    ligueContent.innerHTML = '';

    // Créer une liste déroulante pour sélectionner la paire
    const select = document.createElement('select');
    select.id = 'divisionPairSelect';
    select.setAttribute('aria-label', 'Sélection des paires de divisions');
    select.className = 'division-pair-select';
    tabSelect.appendChild(select);

    const selectBonus = select.cloneNode(true);
    tabSelectBonus.appendChild(selectBonus);

    const selectResults = select.cloneNode(true);
    tabSelectResults.appendChild(selectResults);

    const selectLigue = select.cloneNode(true);
    tabSelectLigue.appendChild(selectLigue);

    const pairs = [];
    for (let i = 0; i < divisions.length; i += 2) {
        const pairNum = Math.floor(i / 2) + 1;
        const div1 = divisions[i];
        const div2 = divisions[i + 1];

        const option = document.createElement('option');
        option.value = String(pairNum);
        option.textContent = div2 ? `Divisions ${div1}-${div2}` : `Division ${div1}`;
        option.dataset.div1 = String(div1);
        if (div2) option.dataset.div2 = String(div2);

        option.className = 'division-pair-select';
        select.appendChild(option);

        const optionBonus = option.cloneNode(true);
        selectBonus.appendChild(optionBonus);

        const optionResults = option.cloneNode(true);
        selectResults.appendChild(optionResults);

        const optionLigue = option.cloneNode(true);
        selectLigue.appendChild(optionLigue);

        const panelId = `panel-${pairNum}`;
        const pairContent = document.createElement('div');
        pairContent.className = 'division-pair';
        pairContent.id = panelId;
        pairContent.setAttribute('role', 'region');
        pairContent.setAttribute('aria-labelledby', `divisionPairLabel-${pairNum}`);
        pairContent.hidden = (i !== 0);

        // Construire le HTML pour la paire (uniquement les classements)
        let html = `
            <div class="divisions">
                <div id="div${div1}" class="division">
                    <h2 id="divisionTitle${div1}"></h2>
                    <table id="division${div1}" class="classement-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Equipe</th>
                                <th>Points</th>
                                <th style="text-align: center">J</th>
                                <th style="text-align: center">V/N/D</th>
                                <th style="text-align: center">Diff.</th>
                                <th style="text-align: center">Buts<br>réels</th>
                                <th style="text-align: center">Buts<br>MPG</th>
                                <th style="text-align: center">Derniers<br>matchs</th>
                            </tr>
                        </thead>
                        <tbody id="classementBodyDiv${div1}"></tbody>
                    </table>
                </div>
        `;

        if (div2) {
            html += `
                <div id="div${div2}" class="division">
                    <h2 id="divisionTitle${div2}"></h2>
                    <table id="division${div2}" class="classement-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Equipe</th>
                                <th>Points</th>
                                <th style="text-align: center">J</th>
                                <th style="text-align: center">V/N/D</th>
                                <th style="text-align: center">Diff.</th>
                                <th style="text-align: center">Buts<br>réels</th>
                                <th style="text-align: center">Buts<br>MPG</th>
                                <th style="text-align: center">Derniers<br>matchs</th>
                            </tr>
                        </thead>
                        <tbody id="classementBodyDiv${div2}"></tbody>
                    </table>
                </div>
            `;
        }

        html += '</div>';
        pairContent.innerHTML = html;
        tabContent.appendChild(pairContent);

        const panelBonusId = `panelBonus-${pairNum}`;
        const pairBonusContent = document.createElement('div');
        pairBonusContent.className = 'division-pair';
        pairBonusContent.id = panelBonusId;
        pairBonusContent.setAttribute('role', 'region');
        pairBonusContent.setAttribute('aria-labelledby', `divisionPairLabel-${pairNum}`);
        pairBonusContent.hidden = (i !== 0);

        let htmlBonus = `
            <div class="divisions">
                <div id="bnDiv${div1}" class="division">
                    <h2 id="bonusDivisionTitle${div1}"></h2>
                    <table id="bonusDivision${div1}" class="classement-table">
                        <thead>
                            <tr>
                                <th>Equipe</th>
                                <th style="text-align: center">Bonus disponibles</th>
                                <th style="text-align: center">Bonus joués</th>
                                <th style="text-align: center">Bonus encaissés</th>
                            </tr>
                        </thead>
                        <tbody id="bonusBodyDiv${div1}"></tbody>
                    </table>
                </div>
        `;
        if (div2) {
            htmlBonus += `
                <div id="bnDiv${div2}" class="division">
                    <h2 id="bonusDivisionTitle${div2}"></h2>
                    <table id="bonusDivision${div2}" class="classement-table">
                        <thead>
                            <tr>
                                <th>Equipe</th>
                                <th style="text-align: center">Bonus disponibles</th>
                                <th style="text-align: center">Bonus joués</th>
                                <th style="text-align: center">Bonus encaissés</th>
                            </tr>
                        </thead>
                        <tbody id="bonusBodyDiv${div2}"></tbody>
                    </table>
                </div>
            `;
        }

        htmlBonus += '</div>';
        pairBonusContent.innerHTML = htmlBonus;
        bonusContent.appendChild(pairBonusContent);

        const panelResultsId = `panelResults-${pairNum}`;
        const pairResultsContent = document.createElement('div');
        pairResultsContent.className = 'division-pair';
        pairResultsContent.id = panelResultsId;
        pairResultsContent.setAttribute('role', 'region');
        pairResultsContent.setAttribute('aria-labelledby', `divisionPairLabel-${pairNum}`);
        pairResultsContent.hidden = (i !== 0);

        let htmlResults = `
            <div class="divisions">
                <div id="resultsDiv${div1}" class="division">
                    <h2 id="resultsTitle${div1}"></h2>
                    <div id="resultsBodyDiv${div1}"></div>
                </div>
        `;
        if (div2) {
            htmlResults += `
                <div id="resultsDiv${div2}" class="division">
                    <h2 id="resultsTitle${div2}"></h2>
                    <div id="resultsBodyDiv${div2}"></div>
                </div>
            `;
        }

        htmlResults += '</div>';
        pairResultsContent.innerHTML = htmlResults;
        resultsContent.appendChild(pairResultsContent);

        const panelLigueId = `panelLigue-${pairNum}`;
        const pairLigueContent = document.createElement('div');
        pairLigueContent.className = 'division-pair';
        pairLigueContent.id = panelLigueId;
        pairLigueContent.setAttribute('role', 'region');
        pairLigueContent.setAttribute('aria-labelledby', `divisionPairLabel-${pairNum}`);
        pairLigueContent.hidden = (i !== 0);

        let htmlLigue = `
            <div class="divisions">
                <div id="ligueDiv${div1}" class="division">
                    <h2 id="ligueTitle${div1}"></h2>
                    <div id="ligueBodyDiv${div1}"></div>
                </div>
        `;
        if (div2) {
            htmlLigue += `
                <div id="ligueDiv${div2}" class="division">
                    <h2 id="ligueTitle${div2}"></h2>
                    <div id="ligueBodyDiv${div2}"></div>
                </div>
            `;
        }
        htmlLigue += '</div>';
        pairLigueContent.innerHTML = htmlLigue;
        ligueContent.appendChild(pairLigueContent);
        
        pairs.push({ pairNum, option, panel: pairContent, bonusPanel: pairBonusContent, resultsPanel: pairResultsContent, liguePanel: pairLigueContent });
    }

    // Helper pour charger une paire par son numéro
    async function loadPairByNum(pairNum) {
        const item = pairs.find(p => p.pairNum === pairNum);
        if (!item) return;
        const opt = item.option;
        if (opt.dataset.loaded === 'true' || opt.dataset.loading === 'true') return;
        const div1 = parseInt(opt.dataset.div1, 10);
        const div2 = opt.dataset.div2 ? parseInt(opt.dataset.div2, 10) : null;
        opt.dataset.loading = 'true';
        const promises = [];
        try {
            promises.push(loadDivisionData(div1, getApiUrls(div1)));
            if (div2) promises.push(loadDivisionData(div2, getApiUrls(div2)));
        } catch (err) {
            console.error('Erreur lors de la préparation des URLs pour la paire', err);
            opt.dataset.loading = 'false';
            return;
        }
        try {
            await Promise.all(promises);
            opt.dataset.loaded = 'true';
        } catch (err) {
            console.error('Erreur de chargement de la paire de divisions :', err);
        } finally {
            delete opt.dataset.loading;
        }
    }

    function activatePanel(pairNum) {
        pairs.forEach(({pairNum: pn, panel, option, bonusPanel, resultsPanel, liguePanel}) => {
            const selected = pn === pairNum;
            panel.classList.toggle('active', selected);
            panel.hidden = !selected;
            option.selected = selected;
            bonusPanel.classList.toggle('active', selected);
            bonusPanel.hidden = !selected;
            resultsPanel.classList.toggle('active', selected);
            resultsPanel.hidden = !selected;
            liguePanel.classList.toggle('active', selected);
            liguePanel.hidden = !selected;
        });
    }

    // Écouter le changement de sélection
    select.addEventListener('change', () => {
        const pairNum = parseInt(select.value, 10);
        selectBonus.selectedIndex = select.selectedIndex;
        selectResults.selectedIndex = select.selectedIndex;
        selectLigue.selectedIndex = select.selectedIndex;

        document.querySelectorAll('.division-pair').forEach(btn => btn.classList.remove('active'));
        showLoadingClassement();
        loadPairByNum(pairNum).then(() => {
            activatePanel(pairNum);
            hideLoadingClassement();
        });
    });

    selectBonus.addEventListener('change', () => {
        const pairNum = parseInt(selectBonus.value, 10);
        select.selectedIndex = selectBonus.selectedIndex;
        selectResults.selectedIndex = selectBonus.selectedIndex;
        selectLigue.selectedIndex = selectBonus.selectedIndex;

        document.querySelectorAll('.division-pair').forEach(btn => btn.classList.remove('active'));
        showLoadingClassement();
        loadPairByNum(pairNum).then(() => {
            activatePanel(pairNum);
            hideLoadingClassement();
        });
    });

    selectResults.addEventListener('change', () => {
        const pairNum = parseInt(selectResults.value, 10);
        select.selectedIndex = selectResults.selectedIndex;
        selectBonus.selectedIndex = selectResults.selectedIndex;
        selectLigue.selectedIndex = selectResults.selectedIndex;

        document.querySelectorAll('.division-pair').forEach(btn => btn.classList.remove('active'));
        showLoadingClassement();
        loadPairByNum(pairNum).then(() => {
            activatePanel(pairNum);
            hideLoadingClassement();
        });
    });

    selectLigue.addEventListener('change', () => {
        const pairNum = parseInt(selectLigue.value, 10);
        select.selectedIndex = selectLigue.selectedIndex;
        selectBonus.selectedIndex = selectLigue.selectedIndex;
        selectResults.selectedIndex = selectLigue.selectedIndex;

        document.querySelectorAll('.division-pair').forEach(btn => btn.classList.remove('active'));
        showLoadingByType('Ligue');
        loadPairByNum(pairNum).then(() => {
            activatePanel(pairNum);
            hideLoadingByType('Ligue');
        });
    });

    // Charger immédiatement la première paire pour affichage à l'ouverture de la page
    if (pairs.length > 0) {
        select.selectedIndex = 0;
        selectBonus.selectedIndex = 0;
        selectResults.selectedIndex = 0;
        selectLigue.selectedIndex = 0;
        loadPairByNum(pairs[0].pairNum).then(() => {
            activatePanel(pairs[0].pairNum);
            hideLoading();
            hideLoadingClassement();
            hideLoadingByType('Ligue');
            contentDisplay();
        });
    }
}

function getApiUrls(divisionNumber) {
    const codeLeagueAndSeasonNum = codeLeague + '_' + seasonNum;
    return {
        teams: `https://api.mlnstats.com/mpgleague/teams/${codeLeagueAndSeasonNum}_${divisionNumber}`,
        matches: `https://api.mpgstats.fr/mpgleague/matches/${codeLeagueAndSeasonNum}_${divisionNumber}`
    };
}

function initializeData() {
    createDivisionPairs();
    // Initialiser structures internes sans déclencher d'appels API (lazy load on tab activation)
    divisions.forEach(divisionNumber => {
        const idx = divisionNumber - 1;
        teamsOfDivision[idx] = [];
        liveStandings[idx] = [];
        calendarDiv[idx] = [];
        bonusesRules = [];
    });
}

function buildCalendarResults(matchesData, divIndex) {

    calendarDiv[divIndex].forEach((cal, idxDay) => {
        cal.matches.forEach((calDay, idxMatch) => {
            calDay.homePlayer = teamsOfDivision[divIndex]?.filter(it => it.teamNum === calDay[0]).slice().shift();
            calDay.awayPlayer = teamsOfDivision[divIndex]?.filter(it => it.teamNum === calDay[1]).slice().shift();

            const timelineDayHome = matchesData?.division?.teams?.filter(it => it.teamNum === calDay[0]).slice().shift().timeline[idxDay];
            // Calcul des buts encaissés pour définir le score adverse
            calDay.scoreAway = cal.isPlayed ? (timelineDayHome?.g || 0) + (timelineDayHome?.m || 0) : undefined;

            const timelineDayAway = matchesData?.division?.teams?.filter(it => it.teamNum === calDay[1]).slice().shift().timeline[idxDay];
            // Calcul des buts encaissés pour définir le score adverse
            calDay.scoreHome = cal.isPlayed ? (timelineDayAway?.g || 0) + (timelineDayAway?.m || 0) : undefined;
        })
    });
}

async function loadDivisionData(divisionNumber, urls) {
    try {
        const [teamsResponse, matchesResponse] = await Promise.all([
            fetch(urls.teams),
            fetch(urls.matches)
        ]);

        const teamsData = await teamsResponse.json();
        const matchesData = await matchesResponse.json();

        // Normaliser l'indexation : nos tableaux internes sont 0-based, les divisions sont 1-based
        const divIndex = divisionNumber - 1;

        // Stocker les équipes (provenant de l'API teams)
        teamsOfDivision[divIndex] = teamsData?.teams || [];

        // Nettoyer les anciens containers DOM
        const classementBody = document.getElementById(`classementBodyDiv${divisionNumber}`);
        if (classementBody) classementBody.innerHTML = '';
        const divisionTitle = document.getElementById(`divisionTitle${divisionNumber}`);
        if (divisionTitle) divisionTitle.innerHTML = '';
        const bonusBody = document.getElementById(`bonusBodyDiv${divisionNumber}`);
        if (bonusBody) bonusBody.innerHTML = '';
        const bonusDivisionTitle = document.getElementById(`bonusDivisionTitle${divisionNumber}`);
        if (bonusDivisionTitle) bonusDivisionTitle.innerHTML = '';

        const resultsTitle = document.getElementById(`resultsTitle${divisionNumber}`);
        if (resultsTitle) resultsTitle.innerHTML = '';
        const resultsBody = document.getElementById(`resultsBodyDiv${divisionNumber}`);
        if (resultsBody) resultsBody.innerHTML = '';

        // Récupérer et stocker les données de classement et calendrier
        nbPlayers = matchesData?.division?.teams?.length || nbPlayers;
        liveStandings[divIndex] = matchesData?.liveStandings || [];
        calendarDiv[divIndex] = matchesData?.calendar || [];
        bonusesRules = matchesData?.division.bonusesRules || [];

        // Associer les résultats des matchs au calendrier des matchs pour afficher dans l'onglet de résultats
        buildCalendarResults(matchesData, divIndex);

        // Construire les maps de bonus
        matchesData?.division?.teams?.forEach((mpgTeam) => {
            const listeBonus = bonusList();
            mpgTeam.timeline.forEach((day, index) => {
                const opponentTeam = matchesData?.division?.teams?.filter(team => team.id == day.o).slice().shift();
                const opponentPlayerName = farmersPlayers().get(opponentTeam.MPGuserId) || opponentTeam.name;

                // Filtrer les bonus non pertinents (0 : Capitaine, 6 : Chapron, 8 : 4 défenseurs, 9 : 5 défenseurs)
                const idxBonus = day?.b?.filter(bonus => ![0, 6, 8, 9].includes(bonus)).flatMap(bonus => bonus);

                // Construire une map des bonus ciblés pour chaque opposant
                const keyOpponentId = day.o;

                if (idxBonus && idxBonus.length === 1) {
                    const existingData = mapBonusTargeted.get(keyOpponentId) || [];
                    const currentTeamName = farmersPlayers().get(mpgTeam.MPGuserId) || mpgTeam.name;
                    mapBonusTargeted.set(keyOpponentId, [...existingData, {nom : currentTeamName, bonus: idxBonus, day: index + 1}]);

                    const existingDataPlayed = mapBonusPlayed.get(mpgTeam.id) || [];
                    const detail = listeBonus[idxBonus[0]];
                    mapBonusPlayed.set(mpgTeam.id, [...existingDataPlayed, {adversaire : opponentPlayerName, bonus: idxBonus[0], day: index + 1, info: detail}]);
                } else {
                    mapBonusTargeted.set(keyOpponentId, mapBonusTargeted.get(keyOpponentId) || []);
                    mapBonusPlayed.set(mpgTeam.id, mapBonusPlayed.get(mpgTeam.id) || []);
                }
            });
        });

        // Créer le composant d'affichage pour la division
        expandableTables.push(new ExpandableTable(
            `classementBodyDiv${divisionNumber}`,
            `divisionTitle${divisionNumber}`,
            matchesData.division,
            `bonusBodyDiv${divisionNumber}`,
            `bonusDivisionTitle${divisionNumber}`,
            `resultsBodyDiv${divisionNumber}`,
            `resultsTitle${divisionNumber}`,
            `ligueBodyDiv${divisionNumber}`,
            `ligueTitle${divisionNumber}`
        ));
    } catch (error) {
        console.error(`Error loading division ${divisionNumber} data:`, error);
    }
}

const ringElement = '<span class="badge"><img src="./img/ring.png" style="vertical-align: bottom; width: 20px"/></span>';

/**
 * Charger et injecter des fragments SVG référencés par [data-src].
 * Utilise un cache pour éviter les fetchs répétés.
 */
const _svgCache = new Map();

// Récupère le texte SVG (lève en cas d'erreur)
async function fetchSvgText(src) {
    const res = await fetch(src, { cache: 'no-cache' });
    if (!res.ok) throw new Error(`SVG load failed ${src} (${res.status})`);
    return await res.text();
}

// Précharge un SVG et le met en cache (utilisez ceci au démarrage si vous voulez warm-up)
async function prefetchSvg(src) {
    if (!src || _svgCache.has(src)) return;
    try {
        const res = await fetchSvgText(src);
        _svgCache.set(src, res);
    } catch (err) {
        console.warn('prefetchSvg failed', src, err);
    }
}

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

const otherLeaguesSelect = document.getElementById('otherLeaguesSelect');
otherLeaguesSelect.innerHTML = '';
otherLeaguesSelect.className = 'division-pair-select';

let leagues = new Map();
leagues.set("TKMXKZDF", "La kadastrophe");
leagues.set("PNAL4RJN", "Farmers-Visas League");
leagues.set("T4D5JPZU", "Referential League");
leagues.set("PJ4V8EXJ", "Notchup 25-26");

leagues.set("T3UZYS9D", "Staging League");
leagues.set("TTD7J493", "Champions Referential League");

leagues.set("TK8UPTE8", "Les strasbourgeois");
leagues.set("RDRE1KZA", "Saison 2025/2026");
leagues.set("U3VWU7K8", "👑King’s Ligue 1👑");

// trier la map leagues par ordre alphabétique de la valeur
leagues = new Map([...leagues.entries()].sort((a, b) => a[1].localeCompare(b[1])));

// parcourir la map leagues pour ajouter dans une liste les clés et valeurs
leagues.forEach((value, key) => {
    const option = document.createElement('option');
    option.value = key;
    option.textContent = `${value} (${key})`;
    option.className = 'division-pair-select';
    otherLeaguesSelect.appendChild(option);
});


// Variable pour suivre la ligne actuellement étendue
let currentExpandedRowId = null;

let mapBonusTargeted = new Map();
let mapBonusPlayed = new Map();
let expandableTables = [];

// Classe pour gérer le tableau extensible
class ExpandableTable {
    constructor(containerId, divisionTitleId, data, bonusContainerId, bonusDivisionTitleId, resultsContainerId, resultsTitleId, ligueContainerId, ligueTitleId) {
        this.container = document.getElementById(containerId);
        this.bonusContainer = document.getElementById(bonusContainerId);
        this.divisionTitleId = divisionTitleId;
        this.bonusDivisionTitleId = bonusDivisionTitleId;
        this.data = data;
        this.divNum = data.divisionNum;
        this.clickHandler = null; // Référence à l'écouteur de clic
        this.resultsContainer = document.getElementById(resultsContainerId);
        this.resultsTitleId = resultsTitleId;
        this.ligueContainer = document.getElementById(ligueContainerId);
        this.ligueTitleId = ligueTitleId;
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
        if (this.resultsContainer) {
            this.resultsContainer.innerHTML = '';
        }
        if (this.ligueContainer) {
            this.ligueContainer.innerHTML = '';
        }

        const divisionTitle = document.getElementById(this.divisionTitleId);
        if (divisionTitle) {
            divisionTitle.innerHTML = '';
        }

        const bonusDivisionTitle = document.getElementById(this.bonusDivisionTitleId);
        if (bonusDivisionTitle) {
            bonusDivisionTitle.innerHTML = '';
        }

        const resultsTitle = document.getElementById(this.resultsTitleId);
        if (resultsTitle) {
            resultsTitle.innerHTML = '';
        }

        const ligueTitle = document.getElementById(this.ligueTitleId);
        if (ligueTitle) {
            ligueTitle.innerHTML = '';
        }

        // Libérer les références
        this.container = null;
        this.bonusContainer = null;
        this.divisionTitleId = null;
        this.bonusDivisionTitleId = null;
        this.data = null;
        this.resultsContainer = null;
        this.ligueContainer = null;
        this.resultsTitleId = null;
        this.ligueTitleId = null;
    }

    render() {
        // Personnalisation du nom de la division
        let divisionName = this.data.name === "undefined" ? `Division ${this.divNum}` : this.data.name;

        const divisionTitle = document.getElementById(this.divisionTitleId);
        divisionTitle.innerHTML = '';
        const divisionSpan = document.createElement('span');
        divisionSpan.innerHTML = `<p>${divisionName}<h6>(mode : ${this.data.mode === 'default' ? 'défaut' : this.data.mode})</h6></p>`;
        divisionTitle.appendChild(divisionSpan);

        const bonusDivisionTitle = document.getElementById(this.bonusDivisionTitleId);
        bonusDivisionTitle.innerHTML = '';
        const bonusDivisionSpan = document.createElement('span');
        bonusDivisionSpan.innerHTML = `<p>${divisionName}</p>`;
        bonusDivisionTitle.appendChild(bonusDivisionSpan);

        const resultsTitle = document.getElementById(this.resultsTitleId);
        resultsTitle.innerHTML = '';
        const resultsSpan = document.createElement('span');
        resultsSpan.innerHTML = `<p>${divisionName}</p>`;
        resultsTitle.appendChild(resultsSpan);

        const ligueTitle = document.getElementById(this.ligueTitleId);
        ligueTitle.innerHTML = '';
        const ligueSpan = document.createElement('span');
        ligueSpan.innerHTML = `<p>${divisionName}</p>`;
        ligueTitle.appendChild(ligueSpan);

        this.container.innerHTML = '';
        this.bonusContainer.innerHTML = '';
        this.resultsContainer.innerHTML = '';
        this.ligueContainer.innerHTML = '';

        this.resultsContainer.appendChild(this.createResults(this.divNum));

        this.ligueContainer.appendChild(this.createNextDayMatch(this.divNum));

        // Tri des équipes par ordre de classement dans la division avant les playoffs
        this.data.teams.sort((a, b) => {
            return a.poolRank - b.poolRank;
        });
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
        const playerName = farmersPlayers().get(mpgTeam.MPGuserId) ?? '<br>';
    
        // Construire une liste des bonus utilisés par le joueur
        const bonusFormates = formatBonusTitle(mpgTeam.bonusTab);

        // Gestion de l'anneau, extraction de la dernière journée de championnat sans modifier l'original
        let ring = '';
        const lastTimeline = [...mpgTeam.timeline].pop();
        if (lastTimeline?.P === 1) {
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

        if (this.data.mode === 'default') {
            // Mise en évidence des équipes en situation de promotion
            if (mpgTeam.nextPromotion === 1) {
                tr.style.backgroundColor = 'rgba(0, 255, 0, 0.1)';
            }
            // Mise en évidence des équipes en situation de relégation
            else if (mpgTeam.nextPromotion === -1 && nbDivisionsForSeason !== this.divNum) {
                tr.style.backgroundColor = 'rgba(255, 0, 0, 0.1)';
            }
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

                const currentTeamName = farmersPlayers().get(mpgTeam.MPGuserId) || mpgTeam.name;

                // Identifier le joueur adverse à partir de son ID
                const opponentTeam = this.data.teams.filter(team => team.id == day.o).slice().shift();
                const opponentPlayerName = farmersPlayers().get(opponentTeam.MPGuserId) || opponentTeam.name;

                // Construction du titre de l'icône
                let titleDay;
                if (day.S === 'H') {
                    // Match à domicile 'Home'
                    titleDay = `${currentTeamName} ${butsGP} - ${butsGC} ${opponentPlayerName}`;
                } else {
                    // Match à l'extérieur 'Away'
                    titleDay = `${opponentPlayerName} ${butsGC} - ${butsGP} ${currentTeamName}`;
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

        const leagueDay = this.data.leagueDayScan ?? '-';

        tr.innerHTML = `
            <td class="position ${positionClass}"><span>${position}${variationImg}</span></td>
            <td class="joueur-name" title="${bonusFormates}">${mpgTeam.name} ${ring}<br><span style="font-size: 80%;">${playerName}</span></td>
            <td class="points">${mpgTeam.points} pts</td>
            <td style="text-align: center">${leagueDay}</td>
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
                    <div id="dispos" style="display: inline-flex; margin-right: 16px; flex-wrap: wrap;">
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

        const bonusPlayed = Array.from(mapBonusPlayed.get(mpgUser.id) || []);
        const nbBonusPlayed = bonusPlayed.length;

        if (nbBonusPlayed > 0) {
            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div>Bonus utilisé${nbBonusPlayed > 1 ? "s" : ""} (${nbBonusPlayed}/${nbBonusDefault})</div>
                    <div id="used" style="display: inline-flex; margin-right: 16px; flex-wrap: wrap;">
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

        const bonusTargeted = mapBonusTargeted.get(mpgUser.id);
            
        if (bonusTargeted?.length > 0) {   
            const targetBonus = Array.from(getBonusTargeted(bonusTargeted));

            // Trier les bonus par journée de championnat
            targetBonus.sort((a, b) => a[1][3].day - b[1][3].day);
            let nbBonusTarget = bonusTargeted.length

            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div>Bonus encaissé${nbBonusTarget > 1 ? "s" : ""} (${nbBonusTarget})</div>
                    <div id="attack" style="display: inline-flex; margin-right: 16px; flex-wrap: wrap;">
                        ${targetBonus.map(([nom, [bKey, libelle, linkImg, tmp]]) => `
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; vertical-align: middle;">
                                ${Array.from({ length: 1 }, 
                                    () => `<img title="${libelle} : attaque de ${tmp.nom} (J${tmp.day})" src="${linkImg}" width="36.8" height="48" style="vertical-align: middle;">`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </td>`;
        }

        tableHTML += `</tr></table>`;
        td.innerHTML += tableHTML;

        const nextMatchToPlay = calendarDiv[this.divNum-1]?.filter(item => item.isPlayed === false).slice().shift();
        if (nextMatchToPlay) {
            const teamNextMatch = nextMatchToPlay?.matches.filter(it => it[0] === mpgUser.teamNum || it[1] === mpgUser.teamNum).pop();
            const isHomeMatch = teamNextMatch[0] === mpgUser.teamNum;

            const svgPath = isHomeMatch ? './img/svg/home.svg' : './img/svg/away.svg';
            const svgMatch = _svgCache.get(svgPath);

            const idxVersusTeam = isHomeMatch ? 1 : 0;
            const versusPlayer = teamsOfDivision[this.divNum-1]?.filter(it => it.teamNum === teamNextMatch[idxVersusTeam]).slice().shift();

            td.innerHTML += `<div>Prochain match : ${svgMatch} ${versusPlayer.name}</div>`;
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
        tr.setAttribute('bonus-id', mpgUser.id);

        const bonusCount = getBonusCountUpdated(mpgUser.bonusTab);
        const availableBonuses = Array.from(bonusCount.entries()).filter(([nom, [description, compteur]]) => compteur > 0);
        const nbAvailableBonuses = availableBonuses.map(([nom, [description, compteur]]) => compteur).reduce((a, b) => a + b, 0);
        
        let tableHTML = `<td style="padding-right: 16px;">${mpgUser.name}</td>`;

        if (nbAvailableBonuses > 0) {
            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div id="dispos" style="display: inline-flex; margin-right: 16px; flex-wrap: wrap;">
                        ${availableBonuses.map(([nom, [description, compteur, linkImg]]) => `
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; vertical-align: middle;">
                                ${Array.from({ length: compteur }, 
                                    () => `<img title="${description}" src="${linkImg}" width="18" height="25" style="vertical-align: middle;">`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </td>
                `;
        } else {
            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div id="dispos" style="display: inline-flex; margin-right: 16px; flex-wrap: wrap;">
                        -
                    </div>
                </td>
                `;
        }

        const bonusPlayed = Array.from(mapBonusPlayed.get(mpgUser.id) || []);
        const nbBonusPlayed = bonusPlayed.length;

        if (nbBonusPlayed > 0) {
            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div id="used" style="display: inline-flex; margin-right: 16px; flex-wrap: wrap;">
                        ${bonusPlayed.map((element) => `
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; vertical-align: middle;">
                                ${Array.from({ length: 1 },
                                    () => `<img title="${element.info[1]} : contre ${element.adversaire} (J${element.day})" src="${element.info[2]}" width="18" height="25" style="vertical-align: middle;">`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </td>
                `;
        } else {
            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div id="used" style="display: inline-flex; margin-right: 16px; flex-wrap: wrap;">
                        -
                    </div>
                </td>
                `;
        }

        const bonusTargeted = mapBonusTargeted.get(mpgUser.id);

        if (bonusTargeted?.length > 0) {   
            const targetBonus = Array.from(getBonusTargeted(bonusTargeted));

            // Trier les bonus par journée de championnat
            targetBonus.sort((a, b) => a[1][3].day - b[1][3].day);

            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div id="attack" style="display: inline-flex; margin-right: 16px; flex-wrap: wrap;">
                        ${targetBonus.map(([nom, [bKey, libelle, linkImg, tmp]]) => `
                            <div style="display: inline-flex; align-items: center; gap: 8px; margin: 4px; vertical-align: middle;">
                                ${Array.from({ length: 1 }, 
                                    () => `<img title="${libelle} : attaque de ${tmp.nom} (J${tmp.day})" src="${linkImg}" width="18" height="25" style="vertical-align: middle;">`).join('')}
                            </div>
                        `).join('')}
                    </div>
                </td>`;
        } else {
            tableHTML += `
                <td style="vertical-align: top; padding-right: 16px;">
                    <div id="attack" style="display: inline-flex; margin-right: 16px; flex-wrap: wrap;">
                        -
                    </div>
                </td>
            `;
        }

        tableHTML += `</tr>`;
        tr.innerHTML += tableHTML;
        return tr;
    }

    createResults(divNum) {
        const elDiv = document.createElement('div');

        let tableHTML = `<div class="match-date-group">`;
        calendarDiv[divNum - 1].forEach(matches => tableHTML += this.createHtmlDayMatch(matches));
        tableHTML += `</div>`;
        elDiv.innerHTML += tableHTML;
        return elDiv;
    }

    createNextDayMatch(divNum) {
        const elDiv = document.createElement('div');

        let tableHTML = `<div class="match-date-group">`;

        // Trouver la prochaine journée non jouée dans calendarDiv
        const nextMatchDay = calendarDiv[divNum - 1].find(day => !day.isPlayed);
        if (!nextMatchDay) {
            tableHTML += `<div class="match-date-header" style="text-align: center">Aucun match à venir</div>`;
            tableHTML += `</div>`;
            elDiv.innerHTML += tableHTML;
            return elDiv;
        } else {
            tableHTML += this.createHtmlDayMatch(nextMatchDay);
        }

        tableHTML += `</div>`;
        elDiv.innerHTML += tableHTML;
        return elDiv;
    }

    createHtmlDayMatch(matchDay) {
        let tableHTML = '';

        tableHTML += `<div class="match-date-header" style="text-align: center">Journée ${matchDay.gameWeek}</div>`;
        matchDay?.matches.forEach(journee => {    
            const idMpgUserHome = this.data.teams.filter(team => team.teamNum == journee.homePlayer.teamNum).slice().shift().MPGuserId;
            const firstnameHome = farmersPlayers().get(idMpgUserHome) ?? '';

            const idMpgUserAway = this.data.teams.filter(team => team.teamNum == journee.awayPlayer.teamNum).slice().shift().MPGuserId;
            const firstnameAway = farmersPlayers().get(idMpgUserAway) ?? '';

            tableHTML += `
                <div class="match-content" style="padding: 20px;">
                    <div class="team-section">
                        <div class="team-name">${journee.homePlayer.name}<br><span style="font-size: 80%;">${firstnameHome}</span></div>
                    </div>
                    <div class="match-score">${journee.scoreHome ?? ''} - ${journee.scoreAway ?? ''}</div>
                    <div class="team-section-away">
                        <div class="team-name-away">${journee.awayPlayer.name}<br><span style="font-size: 80%;">${firstnameAway}</span></div>
                    </div>
                </div>
            `;
        });
        
        return tableHTML;
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

const createIconElement = (title, labelId, svgPath) => {
    const div = document.createElement('div');
    div.setAttribute('aria-labelledby', labelId);
    div.innerHTML = `<span title="${title}">${_svgCache.get(svgPath) || ''}</span>`;
    return div;
};

const createNotPlayedIconElement = () => {
    return createIconElement('', 'validation-notplayed', './img/svg/notplayed-icon.svg');
};

const createSuccessIconElement = (title) => {
    return createIconElement(title, 'validation-success', './img/svg/victory-icon.svg');
};

const createNulIconElement = (title) => {
    return createIconElement(title, 'validation-nul', './img/svg/draw-icon.svg');
};

const createDefeatIconElement = (title) => {
    return createIconElement(title, 'validation-defeat', './img/svg/loss-icon.svg');
};

async function fetchLeague() {
    try {
        let API_URL_LEAGUE = 'https://api.mlnstats.com/mpgleague/league/' + codeLeague;
        const response = await fetch(API_URL_LEAGUE);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const dataLeague = await response.json();

        if(dataLeague?.error === 'championshipNotManaged') {
            throw new Error('Championnat non géré par la source de données.');
        }
        else if(dataLeague?.error === 'notFetchable') {
            throw new Error('Ligue non trouvée. Vérifiez le code de la ligue.');
        } else {
            seasonNum = seasonNumChoice || dataLeague?.seasonNum?.toString() || "1";

            // Déterminer la quantité de divisions de la saison courante
            const divisionsForSeason = (dataLeague.divisions || []).filter(div => div.seasonNum.toString() === seasonNum);
            nbDivisionsForSeason = divisionsForSeason.length;

            if (nbDivisionsForSeason === 0) {
                throw new Error(`Aucune division disponible pour la saison ${seasonNum} de cette ligue !`);
            }
            
            // Lister les saisons disponibles pour la ligue
            const seasonsSet = new Set();
            (dataLeague.divisions || []).forEach(div => {
                seasonsSet.add(div.seasonNum.toString());
            });
            availableSeasons = Array.from(seasonsSet).sort((a, b) => b - a);

            // Ajouter les options de saison dans le selecteur
            const seasonSelect = document.getElementById('seasonSelect');
            seasonSelect.innerHTML = '';
            seasonSelect.className = 'division-pair-select';
            availableSeasons.forEach(season => {
                const option = document.createElement('option');
                option.value = season;
                option.textContent = `Saison ${season}`;
                option.className = 'division-pair-select';
                if (season === seasonNum) {
                    option.selected = true;
                }
                seasonSelect.appendChild(option);
            });
            displayLeague(dataLeague);
        }
    } catch (error) {
        contentDisplay(); // Afficher le contenu même en cas d'erreur
        showError(`Impossible de charger les données de la ligue ${codeLeague} : ${error.message}`);
        throw error; // Rejeter la promesse pour indiquer l'échec
    }
}

function displayLeague(dataLeague) {
    // Affichage de la ligue
    const leagueTitle = document.getElementById('leagueTitle');
    leagueTitle.innerHTML = '';
    const spanELement = document.createElement('span');
    
    let spanLibelle = `<p>${dataLeague.name} / Saison ${seasonNum}</p>`
    if (nbDivisionsForSeason > 1)
        spanLibelle += `<h6>(${nbDivisionsForSeason} divisions)</h6>`;
    
    spanELement.innerHTML = spanLibelle;
    leagueTitle.appendChild(spanELement);
}

function loadLeague(newLeagueCode) {
    if (!newLeagueCode || newLeagueCode.trim() === '') {
        showError('Veuillez entrer un code de ligue valide.');
        return;
    }

    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    showLoading();

    codeLeague = newLeagueCode.trim().toUpperCase();

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
            showLoading();
            
            initializeData();
        })
        .catch((error) => {
            const cfgTabButton = document.querySelector('.tab-button[data-tab="cfg"]');
            cfgTabButton.classList.add('active');
            document.getElementById('cfg-tab').classList.add('active');
            throw error; // Propager l'erreur pour arrêter le processus
        });
}

function bonusDetails() {
    const bonusMap = new Map();
    bonusMap.set("valise", ["Valise à Nanard", bonusesRules.valise, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_c8a2c4971c.png"]);
    bonusMap.set("uber", ["McDo+", bonusesRules.uber, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/mcdo_XNSJJIK_7_4d86759c68.png"]);
    bonusMap.set("suarez", ["Suarez", bonusesRules.suarez, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_73c40fcf0f.png"]);
    bonusMap.set("zahia", ["Zahia", bonusesRules.zahia, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_587179007b.png"]);
    bonusMap.set("miroir", ["Miroir", bonusesRules.miroir, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/thumbnail_miroir_DPKQOLRY_3fa41cbb7a.png"]);
    bonusMap.set("tonton", ["Tonton Pat'", bonusesRules.tonton, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_45de0b018a.png"]);
    bonusMap.set("decat", ["4 Decat", bonusesRules.decat, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/image_8b62f75294.png"]);
    bonusMap.set("cheat", ["Cheat Code 18-26", bonusesRules.cheat, "https://s3.eu-west-3.amazonaws.com/ligue1.image/cms/cheat_Code_RQGFVQYS_c1cf552f40.webp"]);
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

// Map dont la clé est division.teams[x].MPGuserId associée au prénom du joueur MPG
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
    mapPlayerNames.set(7143201, "Charlotte B.");
    mapPlayerNames.set(7206496, "Leïla");
    mapPlayerNames.set(6942448, "Thomas");
    mapPlayerNames.set(6742055, "Antoine C.");
    mapPlayerNames.set(3536318, "Paul");
    mapPlayerNames.set(1905716, "Audric");
    mapPlayerNames.set(4995952, "Christelle");
    mapPlayerNames.set(382722, "Simon");
    mapPlayerNames.set(4895077, "Axel");
    mapPlayerNames.set(5026495, "Mikael");
    mapPlayerNames.set(7726375, "Cyrille");
    mapPlayerNames.set(7931768, "Charlotte D.");
    
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

    return remainingBonuses.length > 0 ? "Bonus disponibles (" + nbBonusDispos + "/" + nbBonusDefault + ") : " + remainingBonuses : "Aucun bonus disponible !"
}

function contentDisplay() {
    hideLoading();
    document.getElementById('content').style.display = 'block';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

function hideLoadingClassement() {
    document.getElementById('loadingClassement').style.display = 'none';
}

function showLoadingClassement() {
    document.getElementById('loadingClassement').style.display = 'block';
}

function hideLoadingByType(type) {
    document.getElementById('loading' + type).style.display = 'none';
}

function showLoadingByType(type) {
    document.getElementById('loading' + type).style.display = 'block';
}

function showError(message = 'Erreur lors du chargement des données. Veuillez réessayer.') {
    hideLoading();
    const errorDiv = document.getElementById('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
}

// Gestion du clic sur les codes de ligue
document.querySelectorAll('.league-code-btn').forEach(button => {
    button.addEventListener('click', function() {
        const code = this.getAttribute('data-code');
        const input = document.getElementById('leagueCodeInput');
        input.value = code;
        
        // Déclencher la soumission du formulaire
        document.querySelector('#leagueForm button[type="submit"]').click();
    });
});

document.addEventListener('DOMContentLoaded', () => {
    // Charger les composants SVG
    loadSvgComponents();

    prefetchSvg('./img/svg/home.svg');
    prefetchSvg('./img/svg/away.svg');
    prefetchSvg('./img/svg/notplayed-icon.svg');
    
    // Gestion du formulaire de sélection de ligue
    document.getElementById('leagueForm').addEventListener('submit', (e) => {
        e.preventDefault();
        document.getElementById('error').style.display = 'none';  // Cacher les erreurs précédentes
        const input = document.getElementById('leagueCodeInput');
        seasonNumChoice = null; // Réinitialiser le choix de saison lors du changement de ligue

        try {
            loadLeague(input.value);
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

    // Gestion du formulaire de sélection de la saison
    document.getElementById('seasonSelect').addEventListener('change', (e) => {
        e.preventDefault();
        document.getElementById('error').style.display = 'none';  // Cacher les erreurs précédentes
        const input = document.getElementById('seasonSelect');
        
        try {
            seasonNumChoice = input.value;
            loadLeague(codeLeague);
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

    // Gestion du formulaire de sélection d'une ligue connue
    document.getElementById('otherLeaguesSelect').addEventListener('change', (e) => {
        e.preventDefault();
        document.getElementById('error').style.display = 'none';  // Cacher les erreurs précédentes
        const input = document.getElementById('otherLeaguesSelect');
        
        try {
            seasonNumChoice = null;
            loadLeague(input.value);
        }
        catch(error) {
            document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            const cfgTabButton = document.querySelector('.tab-button[data-tab="cfg"]');
            cfgTabButton.classList.add('active');
            document.getElementById('cfg-tab').classList.add('active');

            console.error('Erreur lors du chargement de la ligue:', error);
            return;
        }
    });

});

// Gestion du sous-menu avec clic si nécessaire
document.querySelectorAll('.submenu button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const tab = btn.dataset.tab;
        showTab(tab);
    });
});

function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    document.getElementById(tabName + '-tab').classList.add('active');
}

// Chargement initial
fetchLeague()
    .then(() => {    
        // Initialiser les données des divisions
        initializeData();
    });

