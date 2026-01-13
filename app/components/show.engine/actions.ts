import { ShowMode, ShowState } from "./types/show.types";

export type SetModeAction = {
    type: "SET_MODE";
    payload: {
        mode: ShowMode;
    };
};

export type AddPlayerAction = {
    type: "ADD_PLAYER";
    payload: {
        name: string;
    };
};

export type RemovePlayerAction = {
    type: "REMOVE_PLAYER";
    payload: {
        playerId: string;
    };
};

export type RenamePlayerAction = {
    type: "RENAME_PLAYER";
    payload: {
        playerId: string;
        name: string;
    };
};

export type AddRoundAction = {
    type: "ADD_ROUND";
};

export type RemoveRoundAction = {
    type: "REMOVE_ROUND";
    payload: {
        roundIndex: number;
    };
};

export type SetPlannedScoreAction = {
    type: "SET_PLANNED_SCORE";
    payload: {
        playerId: string;
        roundIndex: number;
        score: number;
    };
};

export type StartShowAction = {
    type: "START_SHOW";
};

export type SetScoreAction = {
    type: "SET_SCORE";
    payload: {
        playerId: string;
        score: number;
    };
};

export type NextRoundAction = {
    type: "NEXT_ROUND";
};

export type FinishShowAction = {
    type: "FINISH_SHOW";
};

export type ResetShowAction = {
    type: "RESET_SHOW";
};

export type LoadShowAction = {
    type: "LOAD_SHOW";
    payload: {
        state: ShowState;
    };
};


export type ShowAction =
    | SetModeAction
    | AddPlayerAction
    | RemovePlayerAction
    | RenamePlayerAction
    | AddRoundAction
    | RemoveRoundAction
    | SetPlannedScoreAction
    | StartShowAction
    | SetScoreAction
    | NextRoundAction
    | FinishShowAction
    | ResetShowAction
    | LoadShowAction;
