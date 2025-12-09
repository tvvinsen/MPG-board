// France
const ligue1Calendar = new MatchCalendar({
  fetchUrl: 'https://proxy-football-api.onrender.com/api/fr-l1',
  idSuffix: ''
});
ligue1Calendar.load();
function changeJournee(direction) { ligue1Calendar.changeJournee(direction); }

// Angleterre
const plCalendar = new MatchCalendar({
  fetchUrl: 'https://proxy-football-api.onrender.com/api/en-pl',
  idSuffix: 'PL'
});
plCalendar.load();
function changeJourneePL(direction) { plCalendar.changeJournee(direction); }

// Allemagne
const bl1Calendar = new MatchCalendar({
  fetchUrl: 'https://proxy-football-api.onrender.com/api/de-bl1',
  idSuffix: 'BL1'
});
bl1Calendar.load();
function changeJourneeBL1(direction) { bl1Calendar.changeJournee(direction); }

// Espagne
const spainCalendar = new MatchCalendar({
  fetchUrl: 'https://proxy-football-api.onrender.com/api/sp-pd',
  idSuffix: 'PD'
});
spainCalendar.load();
function changeJourneePD(direction) { spainCalendar.changeJournee(direction); }

// Italie
const italiaCalendar = new MatchCalendar({
  fetchUrl: 'https://proxy-football-api.onrender.com/api/it-sa',
  idSuffix: 'SA'
});
italiaCalendar.load();
function changeJourneeSA(direction) { italiaCalendar.changeJournee(direction); }

// Pays-Bas
const paysbasCalendar = new MatchCalendar({
  fetchUrl: 'https://proxy-football-api.onrender.com/api/pb-ded',
  idSuffix: 'DED'
});
paysbasCalendar.load();
function changeJourneeDED(direction) { paysbasCalendar.changeJournee(direction); }

// Portugal
const portugalCalendar = new MatchCalendar({
  fetchUrl: 'https://proxy-football-api.onrender.com/api/pt-ppl',
  idSuffix: 'PPL'
});
portugalCalendar.load();
function changeJourneePPL(direction) { portugalCalendar.changeJournee(direction); }
