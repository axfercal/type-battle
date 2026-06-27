import azureFaceRightIdle from "../../assets/BlueKnightIdle.png";
import azureFaceRightAttack from "../../assets/BlueKnightAttack.png";
import azureFaceLeftIdle from "../../assets/BlueKnightInvertedIdle.png";
import azureFaceLeftAttack from "../../assets/BlueKnightInvertedAttack.png";
import crimsonFaceRightIdle from "../../assets/RedKnightIdle.png";
import crimsonFaceRightAttack from "../../assets/RedKnightAttack.png";
import crimsonFaceLeftIdle from "../../assets/RedKnightInvertdIdle.png";
import crimsonFaceLeftAttack from "../../assets/RedKnightInvertedAttack.png";
import type { CharacterId } from "../../../shared/characters/characterCatalog";

interface CharacterPose {
  idle: string;
  attack: string;
}

export interface CharacterAssets {
  faceLeft: CharacterPose;
  faceRight: CharacterPose;
}

export const CHARACTER_ASSETS: Record<CharacterId, CharacterAssets> = {
  "azure-knight": {
    faceLeft: {
      idle: azureFaceLeftIdle,
      attack: azureFaceLeftAttack,
    },
    faceRight: {
      idle: azureFaceRightIdle,
      attack: azureFaceRightAttack,
    },
  },
  "crimson-knight": {
    faceLeft: {
      idle: crimsonFaceLeftIdle,
      attack: crimsonFaceLeftAttack,
    },
    faceRight: {
      idle: crimsonFaceRightIdle,
      attack: crimsonFaceRightAttack,
    },
  },
};
