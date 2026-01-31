export function doScan({ BatPos, BugPos }) {
  console.log("Bat position: " + BatPos + " / Bug position: " + BugPos);

  const ID = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  return {
    ID,
    X: BatPos.X,
    Y: BatPos.Y,
    GrowLeft: 0.6,
    LifeLeft: 2.0,
  };
}
