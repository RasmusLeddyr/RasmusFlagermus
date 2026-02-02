//doScan.js

export function doScan({ BatPos, BugPos }) {
  console.log("Bat position: " + BatPos + " / Bug position: " + BugPos);

  const ID = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  return {
    ID,
    X: BatPos.X,
    Y: BatPos.Y,
    GrowLeft: 1.0,
    LifeLeft: 1.0,
  };
}
