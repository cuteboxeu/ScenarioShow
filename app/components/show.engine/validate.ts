import { ShowState } from "./types/show.types";

export function canStartShow(state: ShowState): boolean {
    if (state.players.length < 2) return false;
    if (state.rounds.length < 1) return false;
    if (state.status !== "setup" && state.status !== "ready") return false;

    const roundsLenOk = state.rounds.length === state.config.roundsCount;
    if (!roundsLenOk) return false;

    const playersLenOk = state.players.every(p =>
        p.plannedScores.length === state.rounds.length &&
        p.currentScores.length === state.rounds.length
    );
    if (!playersLenOk) return false;

    if (state.config.mode === "custom") {
        return state.players.every(p => p.plannedScores.every(n => Number.isFinite(n) && n >= 0));
    }

    return true;
}

export function recomputeStatus(state: ShowState): ShowState {
    if (state.status !== "setup" && state.status !== "ready") return state;

    const ready =
        state.players.length >= 2 &&
        state.rounds.length >= 1 &&
        state.rounds.length === state.config.roundsCount &&
        state.players.every(p =>
            p.plannedScores.length === state.rounds.length &&
            p.currentScores.length === state.rounds.length
        ) && (
            state.config.mode !== "custom" ||
            state.players.every(p => p.plannedScores.every(n => Number.isFinite(n) && n >= 0)));

    return ready ? { ...state, status: "ready" } : { ...state, status: "setup" };
}
