const mapLeaguesResults = new Map();
const mapLeaguesComponents = new Map();

// Ajouter les options de championnat dans le selecteur
const leagueSelect = document.getElementById('leagueSelect');
leagueSelect.innerHTML = '';
leagueSelect.className = 'division-pair-select';

class League {
  // Create new instances of the same class as static attributes
  static FR_L1 = new League("Ligue 1", "fr-l1")
  static EN_PL = new League("Premier League", "en-pl")
  static SP_PD = new League("La Liga", "sp-pd")
  static DE_BL1 = new League("Bundesliga", "de-bl1")
  static IT_SA = new League("Serie A", "it-sa")
  static PB_DED = new League("Eredivisie", "pb-ded")
  static PT_PPL = new League("Primeira Liga", "pt-ppl")
  static EU_CL = new League("Champions League", "eu-cl")

  constructor(name, code) {
    this.name = name;
    this.code = code;
  }
}

// Construction de la liste de championnats
Object.entries(League).forEach(([key, value]) => {
  const option = document.createElement('option');
  option.value = value.code;
  option.id = key;
  option.textContent = value.name;
  option.className = 'division-pair-select';
  leagueSelect.appendChild(option);
});

document.addEventListener('DOMContentLoaded', () => {
  // Gestion du formulaire de sélection du championnat
  document.getElementById('leagueSelect').addEventListener('change', (e) => {
    e.preventDefault();
    const input = document.getElementById('leagueSelect');  
    leagueNumChoice = input.value;          
    // Afficher les résultats du championnat sélectionné
    mapLeaguesComponents.get(leagueNumChoice).displayJournee();
  });
});

// France
const ligue1Calendar = new MatchCalendar({
  codeLeague: League.FR_L1.code
});
mapLeaguesComponents.set(League.FR_L1.code, ligue1Calendar);
ligue1Calendar.load().then(() => {
  // Afficher la Ligue 1 par défaut au chargement
  leagueSelect.value = League.FR_L1.code;
  mapLeaguesComponents.get(League.FR_L1.code).displayJournee();
});

// Angleterre
const plCalendar = new MatchCalendar({
  codeLeague: League.EN_PL.code
});
mapLeaguesComponents.set(League.EN_PL.code, plCalendar);
plCalendar.load();

// Allemagne
const bl1Calendar = new MatchCalendar({
  codeLeague: League.DE_BL1.code
});
mapLeaguesComponents.set(League.DE_BL1.code, bl1Calendar);
bl1Calendar.load();

// Espagne
const spainCalendar = new MatchCalendar({
  codeLeague: League.SP_PD.code
});
mapLeaguesComponents.set(League.SP_PD.code, spainCalendar);
spainCalendar.load();

// Italie
const italiaCalendar = new MatchCalendar({
  codeLeague: League.IT_SA.code
});
mapLeaguesComponents.set(League.IT_SA.code, italiaCalendar);
italiaCalendar.load();

// Pays-Bas
const paysbasCalendar = new MatchCalendar({
  codeLeague: League.PB_DED.code
});
mapLeaguesComponents.set(League.PB_DED.code, paysbasCalendar);
paysbasCalendar.load();

// Portugal
const portugalCalendar = new MatchCalendar({
  codeLeague: League.PT_PPL.code
});
mapLeaguesComponents.set(League.PT_PPL.code, portugalCalendar);
portugalCalendar.load();

const championsCalendar = new MatchCalendar({
  codeLeague: League.EU_CL.code
});
mapLeaguesComponents.set(League.EU_CL.code, championsCalendar);
championsCalendar.load();
