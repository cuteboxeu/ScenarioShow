import { ShowState } from "./show.types";

export type ShowLoopStatus = "idle" | "running" | "paused" | "stopped";

export type ShowLoopOptions = {
    tickIntervalMs: number;
    autoNextRound: boolean;
};

export type ShowLoopHandlers = {
    onTick: (nextState: ShowState) => void;
    onRoundFinished?: (state: ShowState) => void;
    onShowFinished?: (state: ShowState) => void;
};
