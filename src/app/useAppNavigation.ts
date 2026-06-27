import { useReducer } from "react";
import type { AppScreen, NavigationAction } from "./appTypes";

function navigationReducer(
  _screen: AppScreen,
  action: NavigationAction,
): AppScreen {
  switch (action.type) {
    case "OPEN_MAIN_MENU":
      return "main-menu";
    case "OPEN_SOLO":
      return "solo";
    case "OPEN_MULTIPLAYER":
      return "multiplayer";
  }
}

export function useAppNavigation() {
  const [screen, dispatch] = useReducer(navigationReducer, "main-menu");

  return {
    screen,
    openMainMenu: () => dispatch({ type: "OPEN_MAIN_MENU" }),
    openSolo: () => dispatch({ type: "OPEN_SOLO" }),
    openMultiplayer: () => dispatch({ type: "OPEN_MULTIPLAYER" }),
  };
}
