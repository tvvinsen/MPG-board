// =====================================================================
// Évolution du classement — onglet "📈 Évolution"
// -----------------------------------------------------------------------
// Reconstitue le classement journée par journée à partir de la timeline
// de chaque équipe (déjà chargée par recast.js dans `expandableTables`),
// puis affiche une courbe SVG (pas de dépendance externe) : une ligne par
// équipe, position 1 en haut, avec légende interactive et tooltip.
// =====================================================================

const EVOLUTION_COLORS = [
    '#003d7a', '#e63946', '#2a9d8f', '#f4a300', '#8338ec',
    '#ff6b6b', '#06d6a0', '#118ab2', '#ef476f', '#7209b7',
    '#ffb703', '#4361ee', '#495057', '#c9184a'
];

/**
 * Reconstitue l'historique de classement d'une division à partir de la
 * timeline de chaque équipe (mêmes données que celles utilisées pour les
 * "5 derniers résultats" dans l'onglet Classement).
 *
 * @param {Array} teams - matchesData.division.teams (avec .id, .name, .timeline)
 * @returns {Array<{day:number, positions:Object<string,number>}>}
 */
function computeStandingsHistory(teams) {
    if (!teams || teams.length === 0) return [];

    const nbDays = teams.reduce(
        (max, t) => Math.max(max, (t.timeline || []).length),
        0
    );
    if (nbDays === 0) return [];

    const cumPoints = new Map(teams.map(t => [t.id, 0]));
    const cumDiff = new Map(teams.map(t => [t.id, 0]));
    const history = [];

    for (let day = 0; day < nbDays; day++) {
        teams.forEach(team => {
            const entry = team.timeline[day];
            if (!entry) return;
            
            const pts = entry.r === 'W' ? 3 : entry.r === 'D' ? 1 : 0;
            cumPoints.set(team.id, (cumPoints.get(team.id) || 0) + pts);

            let butsGP = entry.G?.flatMap(o => Object.values(o)).reduce((a, b) => a + b, 0) || 0;
            butsGP += entry.M?.length || 0;
            const butsGC = (entry.g || 0) + (entry.m || 0);
            cumDiff.set(team.id, (cumDiff.get(team.id) || 0) + (butsGP - butsGC));
        });

        // Tri : points cumulés desc, puis différence de buts cumulée desc
        // (approximation raisonnable des règles de départage MPG)
        const ranking = teams
            .map(t => ({
                id: t.id,
                points: cumPoints.get(t.id) || 0,
                diff: cumDiff.get(t.id) || 0,
            }))
            .sort((a, b) => b.points - a.points || b.diff - a.diff);

        const positions = {};
        ranking.forEach((r, idx) => { positions[r.id] = idx + 1; });
        history.push({ day: day + 1, positions });
    }

    return history;
}

/**
 * Dessine la courbe d'évolution du classement dans `container` (SVG pur).
 */
function renderEvolutionChart(container, teams, history) {
    container.innerHTML = '';

    if (!teams.length || !history.length) {
        container.innerHTML =
            '<p class="evolution-empty">Pas encore assez de journées jouées pour afficher une courbe.</p>';
        return;
    }

    const nbTeams = teams.length;
    const width = 900;
    const height = 360;
    const margin = { top: 16, right: 16, bottom: 34, left: 34 };
    const plotW = width - margin.left - margin.right;
    const plotH = height - margin.top - margin.bottom;

    const days = history.map(h => h.day);
    const xScale = d => margin.left + (plotW * (d - 1)) / Math.max(days.length - 1, 1);
    const yScale = pos => margin.top + (plotH * (pos - 1)) / Math.max(nbTeams - 1, 1);

    const svgNS = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    svg.setAttribute('class', 'evolution-svg');
    svg.setAttribute('role', 'img');
    svg.setAttribute('aria-label', 'Évolution du classement par journée');

    // --- Grille horizontale + graduation des positions ---
    for (let pos = 1; pos <= nbTeams; pos++) {
        const y = yScale(pos);

        const line = document.createElementNS(svgNS, 'line');
        line.setAttribute('x1', margin.left);
        line.setAttribute('x2', width - margin.right);
        line.setAttribute('y1', y);
        line.setAttribute('y2', y);
        line.setAttribute('class', 'evolution-grid');
        svg.appendChild(line);

        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', margin.left - 8);
        label.setAttribute('y', y + 3);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('class', 'evolution-axis-label');
        label.textContent = pos;
        svg.appendChild(label);
    }

    // --- Graduation des journées ---
    const xTickEvery = Math.max(1, Math.ceil(days.length / 12));
    days.forEach((d, idx) => {
        if (idx % xTickEvery !== 0 && idx !== days.length - 1) return;
        const x = xScale(d);
        const label = document.createElementNS(svgNS, 'text');
        label.setAttribute('x', x);
        label.setAttribute('y', height - margin.bottom + 18);
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', 'evolution-axis-label');
        label.textContent = 'J' + d;
        svg.appendChild(label);
    });

    const wrapper = document.createElement('div');
    wrapper.className = 'evolution-chart-wrapper';

    const tooltip = document.createElement('div');
    tooltip.className = 'evolution-tooltip';

    function positionTooltip(evt) {
        const rect = wrapper.getBoundingClientRect();
        tooltip.style.left = (evt.clientX - rect.left + 14) + 'px';
        tooltip.style.top = (evt.clientY - rect.top - 12) + 'px';
    }

    // --- Une ligne + des points par équipe ---
    teams.forEach((team, i) => {
        const color = EVOLUTION_COLORS[i % EVOLUTION_COLORS.length];
        const points = history
            .map(h => `${xScale(h.day)},${yScale(h.positions[team.id])}`)
            .join(' ');

        const polyline = document.createElementNS(svgNS, 'polyline');
        polyline.setAttribute('points', points);
        polyline.setAttribute('class', 'evolution-line');
        polyline.setAttribute('data-team', team.id);
        polyline.style.stroke = color;
        svg.appendChild(polyline);

        history.forEach(h => {
            const circle = document.createElementNS(svgNS, 'circle');
            circle.setAttribute('cx', xScale(h.day));
            circle.setAttribute('cy', yScale(h.positions[team.id]));
            circle.setAttribute('r', 3);
            circle.setAttribute('class', 'evolution-dot');
            circle.setAttribute('data-team', team.id);
            circle.style.fill = color;
            circle.addEventListener('mouseenter', (evt) => {
                tooltip.innerHTML =
                    `<strong>${team.name}</strong><br>Journée ${h.day} — position #${h.positions[team.id]}`;
                tooltip.classList.add('visible');
                positionTooltip(evt);
            });
            circle.addEventListener('mousemove', positionTooltip);
            circle.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
            svg.appendChild(circle);
        });
    });

    wrapper.appendChild(svg);
    wrapper.appendChild(tooltip);
    container.appendChild(wrapper);

    // --- Légende interactive : survol = aperçu, clic = verrouille la sélection ---
    const legend = document.createElement('div');
    legend.className = 'evolution-legend';

    let activeTeamId = null; // équipe verrouillée par clic (null = aucune)

    function applyHighlight(teamId) {
        if (teamId) {
            highlightEvolutionTeam(svg, teamId);
        } else {
            resetEvolutionHighlight(svg);
        }
    }

    const lastDay = history[history.length - 1];
    teams
        .map((team, i) => ({
            team,
            color: EVOLUTION_COLORS[i % EVOLUTION_COLORS.length],
            pos: lastDay.positions[team.id],
        }))
        .sort((a, b) => a.pos - b.pos)
        .forEach(({ team, color, pos }) => {
            const chip = document.createElement('div');
            chip.className = 'evolution-chip';
            chip.innerHTML =
                `<span class="evolution-dot-legend" style="background:${color}"></span>` +
                `<span class="evolution-chip-name">${team.name}</span>` +
                `<span class="evolution-chip-pos">#${pos}</span>`;

            // Aperçu au survol : ne prend effet que si aucune équipe n'est verrouillée
            chip.addEventListener('mouseenter', () => {
                if (!activeTeamId) applyHighlight(team.id);
            });
            chip.addEventListener('mouseleave', () => {
                applyHighlight(activeTeamId);
            });

            // Clic : verrouille (ou déverrouille si on reclique sur la même équipe)
            chip.addEventListener('click', () => {
                activeTeamId = String(activeTeamId) === String(team.id) ? null : team.id;
                legend.querySelectorAll('.evolution-chip').forEach(c => c.classList.remove('active'));
                if (activeTeamId) chip.classList.add('active');
                applyHighlight(activeTeamId);
            });

            legend.appendChild(chip);
        });

    container.appendChild(legend);
}

function highlightEvolutionTeam(svg, teamId) {
    const targetId = String(teamId);
    svg.querySelectorAll('.evolution-line, .evolution-dot').forEach(el => {
        const match = el.getAttribute('data-team') === targetId;
        el.style.opacity = match ? '1' : '0.12';
        if (el.classList.contains('evolution-line')) {
            el.style.strokeWidth = match ? '3' : '1.5';
        }
    });
}

function resetEvolutionHighlight(svg) {
    svg.querySelectorAll('.evolution-line, .evolution-dot').forEach(el => {
        el.style.opacity = '1';
        if (el.classList.contains('evolution-line')) el.style.strokeWidth = '2';
    });
}

/**
 * Construit l'ensemble de l'onglet "Évolution" : une section par division
 */
function renderEvolutionTab() {

    // Une entrée par division
    const byDivision = new Map();

    matches.forEach((et, idx) => byDivision.set(idx, et));

    [...byDivision.entries()]
        .sort((a, b) => a[0] - b[0])
        .forEach(([divNum, et], idx) => {
            const divisionName = et.division && et.division.name && et.division.name !== 'undefined'
                ? et.division.name
                : `Division ${divNum}`;

            const section = document.createElement('div');
            section.className = 'evolution-section';

            const heading = document.createElement('h3');
            heading.className = 'evolution-section-title';
            heading.textContent = divisionName;
            section.appendChild(heading);

            const chartContainer = document.createElement('div');
            section.appendChild(chartContainer);

            const rootIdx = document.getElementById('evolutionContent' + (idx + 1));
            if (!rootIdx) return;
            rootIdx.innerHTML = '';
            rootIdx.appendChild(section);

            if (et.division && et.division.teams) {
            const history = computeStandingsHistory(et.division.teams);
            renderEvolutionChart(chartContainer, et.division.teams, history);
            }
        });
}

// Recalculer à chaque ouverture de l'onglet (les données peuvent avoir
// changé entre-temps si l'utilisateur a chargé une autre division/ligue)
document.addEventListener('DOMContentLoaded', () => {
    const statsButton = document.querySelector('.tab-button[data-tab="stats"]');
    if (statsButton) {
        statsButton.addEventListener('click', renderEvolutionTab);
    }
});
