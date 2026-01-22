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
