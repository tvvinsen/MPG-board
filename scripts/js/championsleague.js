const championsCalendar = new MatchCalendar({
  fetchUrl: 'https://proxy-football-api.onrender.com/api/eu-cl',
  idSuffix: 'Champions'
});

championsCalendar.load();

function changeJourneeChampions(direction) { championsCalendar.changeJournee(direction); }

const europaCalendar = new MatchCalendar({
  fetchUrl: 'https://proxy-football-api.onrender.com/api/eu-el',
  idSuffix: 'Europa'
});

europaCalendar.load();

function changeJourneeEuropa(direction) { europaCalendar.changeJournee(direction); }
