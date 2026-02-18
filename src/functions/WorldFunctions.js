// WorldFunctions.js

export function moveMap({ BatX, BatY }) {
  // Measure distance between map centre and bat position.
  const DistX = 0.5 - BatX;
  const DistY = 0.5 - BatY;

  // Return distance as percent.
  return {
    MapPercentX: DistX * 100,
    MapPercentY: DistY * 100,
  };
}

export function makeScan({ BatPos, BugPos, ScanHeightPerSec, MapRatioSplit }) {
  const ID = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  const GrowSpeed = ScanHeightPerSec / MapRatioSplit[1];
  const Aspect = MapRatioSplit[0] / MapRatioSplit[1];
  const DistX = (BugPos.X - BatPos.X) * Aspect;
  const DistY = BugPos.Y - BatPos.Y;
  const Distance = Math.hypot(DistX, DistY);
  const GrowLeft = Distance / GrowSpeed;

  return {
    ID,
    X: BatPos.X,
    Y: BatPos.Y,
    Radius: 0,
    GrowSpeed,
    GrowLeft,
    LifeLeft: 3,
  };
}
