const Key = "scores";
const MaxScores = 5;

function getDate() {
  const doPad = (Input) => String(Input).padStart(2, "0");
  const Now = new Date();

  return `${Now.getFullYear()}-${doPad(Now.getMonth() + 1)}-${doPad(Now.getDate())} ${doPad(Now.getHours())}:${doPad(Now.getMinutes())}`;
}

export function getScores() {
  const Raw = localStorage.getItem(Key);
  const Parsed = Raw ? JSON.parse(Raw) : [];
  return Array.isArray(Parsed) ? Parsed : [];
}

export function addScore(Points) {
  const Scores = getScores();

  const Score = {
    points: Points,
    date: getDate(),
  };

  const NewList = [Score, ...Scores].slice(0, MaxScores);
  localStorage.setItem(Key, JSON.stringify(NewList));
}
