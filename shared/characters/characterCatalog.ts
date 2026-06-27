export const CHARACTER_IDS = ["azure-knight", "crimson-knight"] as const;

export type CharacterId = (typeof CHARACTER_IDS)[number];

export interface CharacterDefinition {
  id: CharacterId;
  name: string;
  title: string;
  description: string;
}

export const CHARACTER_CATALOG: readonly CharacterDefinition[] = [
  {
    id: "azure-knight",
    name: "Azure Knight",
    title: "The Steadfast",
    description: "A calm duelist in blue steel.",
  },
  {
    id: "crimson-knight",
    name: "Crimson Knight",
    title: "The Relentless",
    description: "A fierce challenger in scarlet armor.",
  },
];

export function getCharacterDefinition(id: CharacterId): CharacterDefinition {
  const character = CHARACTER_CATALOG.find((candidate) => candidate.id === id);
  if (!character) throw new Error(`Unknown character: ${id}`);
  return character;
}

export function getOpponentCharacterId(id: CharacterId): CharacterId {
  return id === "azure-knight" ? "crimson-knight" : "azure-knight";
}

export function isCharacterId(value: unknown): value is CharacterId {
  return typeof value === "string" && CHARACTER_IDS.some((id) => id === value);
}
