//makeScan.js

export function makeScan({ BatPos, BugPos, ScanHeightPerSec, MapRatioSplit }) {
  console.log("Bat position: " + BatPos + " / Bug position: " + BugPos);

  const ID = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  const GrowSpeed = ScanHeightPerSec / MapRatioSplit[1];

  return {
    ID,
    X: BatPos.X,
    Y: BatPos.Y,
    Radius: 0,
    GrowSpeed,
    GrowLeft: 1.0,
    LifeLeft: 1.0,
  };
}
