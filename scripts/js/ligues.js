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
    document.getElementById('leagueContainer').style.display = 'none';
    document.getElementById('loadingCalendar').style.display = 'block';
    
    const input = document.getElementById('leagueSelect');  
    leagueNumChoice = input.value;

    // Tester la présence du composant avant de l'afficher
    if (!mapLeaguesComponents.has(leagueNumChoice)) {
      // Charger les données du championnat si le composant n'existe pas
      const leagueCalendar = new MatchCalendar({
        codeLeague: leagueNumChoice
      });
      mapLeaguesComponents.set(leagueNumChoice, leagueCalendar);
      leagueCalendar.load().then(() => {
        // Afficher les résultats du championnat sélectionné
        leagueCalendar.displayJournee();
      });
    } else {
    const leagueComponent =  mapLeaguesComponents.get(leagueNumChoice)
    // Afficher les résultats du championnat sélectionné
      leagueComponent?.displayJournee();
    }
  });
});

// Fonction pour charger et afficher le calendrier de la Ligue 1 française
function displayFrenchLigueCalendar() {
  const ligue1Calendar = new MatchCalendar({
    codeLeague: League.FR_L1.code
  });
  mapLeaguesComponents.set(League.FR_L1.code, ligue1Calendar);
  document.getElementById('leagueContainer').style.display = 'none';
  document.getElementById('loadingCalendar').style.display = 'block';
  ligue1Calendar.load().then(() => {
    ligue1Calendar.displayJournee();
  });
}
