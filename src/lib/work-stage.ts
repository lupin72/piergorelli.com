/**
 * Geometry shared by the Work stage drawings (WorkStage.astro) and their live layer
 * (scripts/rd/work-stage.ts). All coordinates live in a 800×500 viewBox.
 */

/** Skeleton of the K (stem, arm, leg) with its top-left corner at x,y and height s. Stroked s × 0.16 wide. */
export const kPath = (x: number, y: number, s: number) =>
  `M${x + s * 0.08} ${y}V${y + s}M${x + s * 0.1} ${y + s * 0.62}L${x + s * 0.66} ${y}M${x + s * 0.3} ${y + s * 0.42}L${x + s * 0.72} ${y + s}`;

/** Terrain contour lines for the piergorelli.com hero: a hill at (hx, hy) that the pointer can move. */
export function contours(hx = 560, lift = 1) {
  return Array.from({ length: 9 }, (_, i) => {
    let d = "";
    for (let x = 0; x <= 800; x += 20) {
      const y = 330 + i * 16 - Math.exp(-((x - hx) ** 2) / 9000) * (90 - i * 6) * lift + Math.sin(x / 60 + i) * 4;
      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)}`;
    }
    return d;
  });
}
