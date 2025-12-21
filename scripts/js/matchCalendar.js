class MatchCalendar {
  constructor({ codeLeague }) {
    this.codeLeague = codeLeague;
    this.allMatches = [];
    this.totalJournees = 0;
    this.currentJournee = 1;
  }

  async load() {

    const URL_PROXY_API = "https://proxy-football-api.onrender.com/api/";
    try {
      const response = await fetch(URL_PROXY_API + this.codeLeague);
      const data = await response.json();
      this.allMatches = data?.matches || [];

      this.allMatches.forEach((m, i) => { m.index = this.computeStageIndex(this.allMatches, i, m); });

      // Stockage des données dans une map globale
      mapLeaguesResults.set(this.codeLeague, this.allMatches);

      this.totalJournees = Math.max(...this.allMatches.map(m => m.index || 1), 1);

      const firstUnplayed = this.allMatches.find(m => m.status !== 'FINISHED');
      this.currentJournee = firstUnplayed?.index ?? 1;
    } catch (err) {
      console.error('Erreur de chargement:', err);
      const el = document.getElementById('loadingCal');
      if (el) el.innerHTML = '<p style="color: #e74c3c;">Erreur lors du chargement des données</p>';
    }
  }

  computeStageIndex(allMatches, idx, match) {
    if (idx === 0) { match._stageIndex = 1; return 1; }
    const prev = allMatches[idx - 1];
    let current = prev._stageIndex || 1;
    if (match.stage === prev.stage) {
      if (match.matchday !== prev.matchday) current++;
    } else {
      current++;
    }
    match._stageIndex = current;
    return current;
  }

  displayJournee() {
    const container = document.getElementById('leagueContainer');
    if (container) container.style.display = 'block';

    const journee = this.currentJournee;
    setTimeout(() => {
      const journees = this.allMatches.filter(m => m.index === journee);
      if (!journees || journees.length === 0) {
        if (container) container.innerHTML = '<p style="text-align: center; padding: 10px;">Aucun match disponible pour cette journée</p>';
      } else {
        this.renderMatches(journees, container);
      }

      const currentEl = document.getElementById('currentJournee');
      if (currentEl) currentEl.textContent = journee;

      this.updateJourneeDates(journees);

      if (container) container.style.display = 'block';

      this.updateNavigationButtons();
    }, 200);
  }

  renderMatches(journees, container) {
    if (!container) return;
    container.innerHTML = '';
    const matchesByDate = {};
    journees.forEach(match => {
      const dateKey = match.utcDate.split('T')[0];
      if (!matchesByDate[dateKey]) matchesByDate[dateKey] = [];
      matchesByDate[dateKey].push(match);
    });

    const divLeague = document.createElement('div');
    divLeague.id = this.codeLeague;

    const divNav = document.createElement('div');
    divNav.id = this.codeLeague;
    divNav.className = 'journee-navigation';

    const button = document.createElement('button');
    button.id = 'prevBtn';
    button.onclick = () => this.changeJournee(-1);
    button.innerHTML = '&lt;';
    divNav.appendChild(button);
    divLeague.appendChild(divNav);

    const divInfo = document.createElement('div');
    divInfo.id = this.codeLeague;
    divInfo.className = 'journee-info';
    const divNumber = document.createElement('div');
    divNumber.className = 'journee-number';
    divNumber.innerHTML = `Journée <span id="currentJournee">${this.currentJournee}</span>`;
    divInfo.appendChild(divNumber);
    const divDates = document.createElement('div');
    divDates.className = 'journee-dates';
    divDates.id = 'journeeDates';

    const dates = journees.map(m => new Date(m.utcDate));
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    const start = min.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const end = max.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    divDates.textContent = `${start} - ${end}`;

    divInfo.appendChild(divDates);
    divNav.appendChild(divInfo);
    const buttonNext = document.createElement('button');
    buttonNext.id = 'nextBtn';
    buttonNext.onclick = () => this.changeJournee(1);
    buttonNext.innerHTML = '&gt;';
    divNav.appendChild(buttonNext);
    divLeague.appendChild(divNav);

    const divMatches = document.createElement('div');
    divMatches.id = 'matchesContainer';
    divMatches.className = 'matches-container';

    Object.entries(matchesByDate).forEach(([date, matches]) => {
      const dateGroup = document.createElement('div');
      dateGroup.className = 'match-date-group';

      const dateHeader = document.createElement('div');
      dateHeader.className = 'match-date-header';
      dateHeader.textContent = new Date(date).toLocaleDateString('fr-FR', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      dateGroup.appendChild(dateHeader);

      matches.forEach(match => {
        const matchCard = this.createMatchCard(match);
        dateGroup.appendChild(matchCard);
      });
      divMatches.appendChild(dateGroup);
    });
    
    divLeague.appendChild(divMatches);
    container.appendChild(divLeague);
  }

  createMatchCard(match) {
    const card = document.createElement('div');
    card.className = 'match-card';
    const time = new Date(match.utcDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

    let statusClass = 'status-avenir';
    let statusText = 'À venir';
    if (match.status === 'FINISHED') { statusClass = 'status-termine'; statusText = 'Terminé'; }
    else if (match.status === 'IN_PLAY') { statusClass = 'status-inplay'; statusText = 'En cours'; }

    card.innerHTML = `
      <div class="match-time">${time}</div>
      <div class="match-content">
        <div class="team-section"><div class="team-name">${match.homeTeam?.shortName ?? 'NA'}</div></div>
        <div class="match-score">${match.score?.fullTime?.home ?? ''} - ${match.score?.fullTime?.away ?? ''}</div>
        <div class="team-section-away"><div class="team-name-away">${match.awayTeam?.shortName ?? 'NA'}</div></div>
      </div>
      <span class="match-status ${statusClass}">${statusText}</span>
    `;

    return card;
  }

  updateJourneeDates(journeeMatches) {
    const datesDiv = document.getElementById('journeeDates');
    if (!datesDiv) return;
    if (!journeeMatches || journeeMatches.length === 0) { datesDiv.textContent = ''; return; }
    const dates = journeeMatches.map(m => new Date(m.utcDate));
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    const start = min.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
    const end = max.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
    datesDiv.textContent = `${start} - ${end}`;
  }

  changeJournee(direction) {
    const newJ = this.currentJournee + direction;
    if (newJ < 1 || newJ > this.totalJournees) return;
    this.currentJournee = newJ;
    this.displayJournee();
  }

  updateNavigationButtons() {
    const prev = document.getElementById('prevBtn');
    const next = document.getElementById('nextBtn');
    if (prev) prev.disabled = this.currentJournee <= 1;
    if (next) next.disabled = this.currentJournee >= this.totalJournees;
  }
}

// Expose to global scope for usage from existing scripts/HTML
window.MatchCalendar = MatchCalendar;
