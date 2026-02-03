//makeScan.js

export function makeScan({ BatPos, BugPos, ScanHeightPerSec, MapRatioSplit }) {
  const ID = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  const GrowSpeed = ScanHeightPerSec / MapRatioSplit[1];

  const Aspect = MapRatioSplit[0] / MapRatioSplit[1];

  const DistanceX = (BugPos.X - BatPos.X) * Aspect;
  const DistanceY = BugPos.Y - BatPos.Y;
  const Distance = Math.hypot(DistanceX, DistanceY);

  const GrowLeft = Distance / GrowSpeed;

  return {
    ID,
    X: BatPos.X,
    Y: BatPos.Y,
    Radius: 0,
    GrowSpeed,
    GrowLeft,
    LifeLeft: 1.0,
  };
}
