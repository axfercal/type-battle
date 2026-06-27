const sampleTexts = [
  "The quick brown fox jumps over the lazy dog.",
  "Pack my box with five dozen liquor jugs.",
  "How vexingly quick daft zebras jump.",
  "The five boxing wizards jump quickly.",
  "Bright vixens jump; dozy fowl quack.",
];

export function getRandomText(): string {
  return sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
