export function moveMap({ BatX, BatY }) {
  const DistX = 0.5 - BatX;
  const DistY = 0.5 - BatY;

  return {
    MapPercentX: DistX * 100,
    MapPercentY: DistY * 100,
  };
}
