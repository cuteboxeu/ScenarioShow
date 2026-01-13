import { ShowState } from "./types/show.types";

export const initialShowState: ShowState = {
  status: "setup",
  config: {
    mode: "random",
    roundsCount: 0,
  },
  players: [],
  rounds: [],
  currentRoundIndex: null,
  currentPlayerIndex: null,
};
