class MatchCalendar {
  constructor({ fetchUrl, idSuffix = ''}) {
    this.fetchUrl = fetchUrl;
    this.idSuffix = idSuffix; // '', 'PL', 'Champions', ...
    this.allMatches = [];
    this.totalJournees = 0;
    this.currentJournee = 1;
  }

  _id(name) {
    return name + this.idSuffix;
  }

  async load() {
    try {
      const response = await fetch(this.fetchUrl);
      const data = await response.json();
      this.allMatches = data?.matches || [];

      this.allMatches.forEach((m, i) => { m.index = this.computeStageIndex(this.allMatches, i, m); });

      this.totalJournees = Math.max(...this.allMatches.map(m => m.index || 1), 1);

      const firstUnplayed = this.allMatches.find(m => m.status !== 'FINISHED');
      this.currentJournee = firstUnplayed?.index ?? 1;

      this.displayJournee(this.currentJournee);
    } catch (err) {
      console.error('Erreur de chargement:', err);
      const el = document.getElementById(this._id('loadingCal'));
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

  displayJournee(journeeNum) {
    const loadingEl = document.getElementById(this._id('loadingCal'));
    const container = document.getElementById(this._id('matchesContainer'));
    if (loadingEl) loadingEl.style.display = 'block';
    if (container) container.style.display = 'none';

    setTimeout(() => {
      const journees = this.allMatches.filter(m => m.index === journeeNum);
      if (!journees || journees.length === 0) {
        if (container) container.innerHTML = '<p style="text-align: center; padding: 10px;">Aucun match disponible pour cette journée</p>';
      } else {
        this.renderMatches(journees, container);
      }

      const currentEl = document.getElementById(this._id('currentJournee'));
      if (currentEl) currentEl.textContent = journeeNum;

      this.updateJourneeDates(journees);

      if (loadingEl) loadingEl.style.display = 'none';
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
      container.appendChild(dateGroup);
    });
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
    const datesDiv = document.getElementById(this._id('journeeDates'));
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
    this.displayJournee(this.currentJournee);
  }

  updateNavigationButtons() {
    const prev = document.getElementById(this._id('prevBtn'));
    const next = document.getElementById(this._id('nextBtn'));
    if (prev) prev.disabled = this.currentJournee <= 1;
    if (next) next.disabled = this.currentJournee >= this.totalJournees;
  }
}

// Expose to global scope for usage from existing scripts/HTML
window.MatchCalendar = MatchCalendar;
