import { ShowState, Player } from "./types/show.types";

export function getTotalScore(player: Player): number {
    return player.currentScores.reduce((sum, s) => sum + (s ?? 0), 0);
}

export function getRanking(state: ShowState) {
    const sorted = [...state.players]
        .map(p => ({
            playerId: p.id,
            name: p.name,
            totalScore: getTotalScore(p),
        }))
        .sort((a, b) => b.totalScore - a.totalScore);

    let place = 1;
    let lastScore: number | null = null;

    return sorted.map((row, i) => {
        if (lastScore !== null && row.totalScore < lastScore) place = i + 1;
        lastScore = row.totalScore;
        return { ...row, place };
    });
}

export function isCustomRoundFinished(state: ShowState): boolean {
    if (state.status !== "playing") return false;
    if (state.config.mode !== "custom") return false;
    if (state.currentRoundIndex === null) return false;

    const r = state.currentRoundIndex;
    return state.players.every(p => p.currentScores[r] === p.plannedScores[r]);
}

export function isCurrentPlayerFinished(state: ShowState): boolean {
    const r = state.currentRoundIndex;
    const p = state.currentPlayerIndex;

    if (r === null || p === null) return false;

    const player = state.players[p];
    return player.currentScores[r] === player.plannedScores[r];
}

