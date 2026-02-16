const Key = "scores";
const MaxScores = 5;

export function getScores() {
  const Raw = localStorage.getItem(Key);
  const Parsed = Raw ? JSON.parse(Raw) : [];
  return Array.isArray(Parsed) ? Parsed : [];
}

export function addScore(Score) {
  const Scores = getScores();
  const NewList = [Score, ...Scores].slice(0, MaxScores);
  localStorage.setItem(Key, JSON.stringify(NewList));
}
