import {
  CHARACTER_CATALOG,
} from "../../../shared/characters/characterCatalog";
import type { CharacterId } from "../../../shared/characters/characterCatalog";
import { CHARACTER_ASSETS } from "./characterAssets";

interface CharacterSelectProps {
  selectedId: CharacterId;
  onSelect: (id: CharacterId) => void;
  disabledIds?: readonly CharacterId[];
}

export function CharacterSelect({
  selectedId,
  onSelect,
  disabledIds = [],
}: CharacterSelectProps) {
  return (
    <fieldset className="character-picker">
      <legend>Choose your knight</legend>
      <div className="character-options">
        {CHARACTER_CATALOG.map((character) => {
          const isDisabled = disabledIds.includes(character.id);
          const isSelected = selectedId === character.id;

          return (
            <label
              className={`character-option ${isSelected ? "character-option--selected" : ""} ${isDisabled ? "character-option--disabled" : ""}`}
              key={character.id}
            >
              <input
                type="radio"
                name="character"
                value={character.id}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => onSelect(character.id)}
              />
              <img
                src={CHARACTER_ASSETS[character.id].faceRight.idle}
                alt=""
                aria-hidden="true"
              />
              <span className="character-option__copy">
                <strong>{character.name}</strong>
                <small>{character.title}</small>
                <span>{isDisabled ? "Chosen by rival" : character.description}</span>
              </span>
              <span className="character-check" aria-hidden="true">✓</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
