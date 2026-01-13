export type ShowMode = "random" | "custom";

export type ShowStatus = "setup" | "ready" | "playing" | "finished";

export type Player = {
    id: string;
    name: string;
    avatarUrl: string;

    plannedScores: number[];
    currentScores: number[];
};

export type Round = {
    index: number;
    isActive: boolean;
    isFinished: boolean;
};

export type ShowConfig = {
    mode: ShowMode;
    roundsCount: number;
};

export type ShowState = {
    status: ShowStatus;
    config: ShowConfig;
    players: Player[];
    rounds: Round[];
    currentRoundIndex: number | null;
};

export type Rng = () => number;
