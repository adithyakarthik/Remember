// Deterministic vibrant gradient for a folder, derived from its name so the
// same heading always gets the same colour and the folder grid looks lively.
const GRADIENTS: [string, string][] = [
  ["#FF9F45", "#E23670"], // sunset (brand)
  ["#8B5CF6", "#EC4899"], // grape → pink
  ["#0D9488", "#84CC16"], // teal → lime
  ["#06B6D4", "#4F46E5"], // cyan → indigo
  ["#F59E0B", "#EF4444"], // amber → red
  ["#EC4899", "#FB7185"], // pink → coral
  ["#22C55E", "#0D9488"], // green → teal
  ["#6366F1", "#A855F7"], // indigo → violet
];

export function folderGradient(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  const [a, b] = GRADIENTS[hash % GRADIENTS.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}
