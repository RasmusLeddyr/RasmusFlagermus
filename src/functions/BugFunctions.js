// BugFunctions.js

// BUG MOVER [
export function getRandomPos(BoxSize) {
  // Convert BoxSize to 0-1 space, then set half of it as padding.
  const Padding = BoxSize / 100 / 2;

  // Generate a random number within padding.
  const Random = () => Padding + Math.random() * (1 - Padding * 2);

  // Return a random number for X and Y.
  return { X: Random(), Y: Random() };
}
// ]

// BUG TOUCH CHECKER [
export function testTouch(BatPos, BatScale, BugPos, BugScale) {
  // Get distance between bat and bug.
  const DistX = BatPos.X - BugPos.X;
  const DistY = BatPos.Y - BugPos.Y;
  const Distance = Math.hypot(DistX, DistY);

  // Calculate touch distance by combining bix sizes, turned to 0-1 space radiuses.
  const TouchDist = (BatScale + BugScale) / 100 / 2 ;

  // If Distance is equal to or below TouchDist; return true. Else; return false.
  if (Distance <= TouchDist) {
    return true;
  } else {
    return false;
  }
}
// ]
