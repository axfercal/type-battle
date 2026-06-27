export type AppScreen = "main-menu" | "solo" | "multiplayer";

export type NavigationAction =
  | { type: "OPEN_MAIN_MENU" }
  | { type: "OPEN_SOLO" }
  | { type: "OPEN_MULTIPLAYER" };
