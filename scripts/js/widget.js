// Ajouter les options de championnat dans le selecteur
const resultSelect = document.getElementById('resultSelect');
resultSelect.innerHTML = '';
resultSelect.className = 'division-pair-select';

class LeagueResult {
  // Create new instances of the same class as static attributes
  static FR_L1 = new LeagueResult("Ligue 1", "35")
  static FR_L2 = new LeagueResult("Ligue 2", "36")
  static FR_NT = new LeagueResult("National", "357")

  constructor(name, code) {
    this.name = name;
    this.code = code;
  }
}

// Construction de la liste de championnats
Object.entries(LeagueResult).forEach(([key, value]) => {
  const option = document.createElement('option');
  option.value = value.code;
  option.id = key;
  option.textContent = value.name;
  option.className = 'division-pair-select';
  resultSelect.appendChild(option);
});

document.addEventListener('DOMContentLoaded', () => {
  // Gestion du formulaire de sélection du championnat
  document.getElementById('resultSelect').addEventListener('change', (e) => {
    e.preventDefault();
    const input = document.getElementById('resultSelect');  
    let leagueChoice = input.value;

    document.querySelectorAll('.bootstrap_loader_container__obfJf').forEach(btn => btn.style.display = 'none');
    document.querySelectorAll('.result-class').forEach(btn => btn.style.display = 'none');
    document.getElementById(`rslt${leagueChoice}`).style.display = 'block';

  });
});
