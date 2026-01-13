import { ShowState, Player, Round, Rng, ShowMode } from "./types/show.types";
import { createId } from "./id";
import { canStartShow, recomputeStatus } from "./validate";

export function setMode(state: ShowState, mode: ShowMode): ShowState {
    if (state.status !== "setup") return state;

    const reset: ShowState = {
        ...state,
        config: { mode, roundsCount: 0 },
        rounds: [],
        currentRoundIndex: null,
        players: state.players.map(p => ({
            ...p,
            plannedScores: [],
            currentScores: [],
        })),
    };

    return recomputeStatus(reset);
}

export function addPlayer(state: ShowState, name: string, avatarUrl: string): ShowState {
    if (state.status !== "setup") return state;

    const roundsLen = state.rounds.length;

    const player: Player = {
        id: createId(),
        name,
        avatarUrl,
        plannedScores: Array.from({ length: roundsLen }, () => 0),
        currentScores: Array.from({ length: roundsLen }, () => (state.config.mode === "random" ? 0 : 0)),
    };

    const next = { ...state, players: [...state.players, player] };
    return recomputeStatus(next);
}

export function removePlayer(state: ShowState, playerId: string): ShowState {
    if (state.status !== "setup") return state;
    const next = { ...state, players: state.players.filter(p => p.id !== playerId) };
    return recomputeStatus(next);
}

export function renamePlayer(state: ShowState, playerId: string, name: string): ShowState {
    if (state.status !== "setup") return state;

    const next = {
        ...state,
        players: state.players.map(p => (p.id === playerId ? { ...p, name } : p)),
    };

    return recomputeStatus(next);
}

export function addRound(state: ShowState): ShowState {
    if (state.status !== "setup") return state;

    const roundIndex = state.rounds.length;

    const round: Round = { index: roundIndex, isActive: false, isFinished: false };

    const next: ShowState = {
        ...state,
        config: { ...state.config, roundsCount: state.config.roundsCount + 1 },
        rounds: [...state.rounds, round],
        players: state.players.map(p => ({
            ...p,
            plannedScores: [...p.plannedScores, 0],
            currentScores: [...p.currentScores, 0],
        })),
    };

    return recomputeStatus(next);
}

export function removeRound(state: ShowState, roundIndex: number): ShowState {
    if (state.status !== "setup") return state;
    if (roundIndex < 0 || roundIndex >= state.rounds.length) return state;

    const nextRounds = state.rounds
        .filter(r => r.index !== roundIndex)
        .map((r, i) => ({ ...r, index: i }));

    const next: ShowState = {
        ...state,
        config: { ...state.config, roundsCount: nextRounds.length },
        rounds: nextRounds,
        players: state.players.map(p => ({
            ...p,
            plannedScores: p.plannedScores.filter((_, i) => i !== roundIndex),
            currentScores: p.currentScores.filter((_, i) => i !== roundIndex),
        })),
    };

    return recomputeStatus(next);
}

export function setPlannedScore(state: ShowState, playerId: string, roundIndex: number, score: number): ShowState {
    if (state.status !== "setup") return state;
    if (state.config.mode !== "custom") return state;
    if (roundIndex < 0 || roundIndex >= state.rounds.length) return state;
    if (!Number.isFinite(score) || score < 0) return state;

    const next: ShowState = {
        ...state,
        players: state.players.map(p =>
            p.id === playerId
                ? {
                    ...p,
                    plannedScores: p.plannedScores.map((s, i) => (i === roundIndex ? score : s)),
                }
                : p
        ),
    };

    return recomputeStatus(next);
}

export function startShow(state: ShowState): ShowState {
    if (!canStartShow(state)) return state;

    const next: ShowState = {
        ...state,
        status: "playing",
        currentRoundIndex: 0,
        rounds: state.rounds.map((r, i) => ({
            ...r,
            isActive: i === 0,
            isFinished: false,
        })),
        players:
            state.config.mode === "custom"
                ? state.players.map(p => ({ ...p, currentScores: p.currentScores.map(() => 0) }))
                : state.players,
    };

    return next;
}

export function setScoreRandom(state: ShowState, playerId: string, score: number): ShowState {
    if (state.status !== "playing") return state;
    if (state.config.mode !== "random") return state;
    if (state.currentRoundIndex === null) return state;
    if (!Number.isFinite(score) || score < 0) return state;

    const r = state.currentRoundIndex;

    return {
        ...state,
        players: state.players.map(p =>
            p.id === playerId
                ? { ...p, currentScores: p.currentScores.map((s, i) => (i === r ? score : s)) }
                : p
        ),
    };
}

export function tickCustomScores(state: ShowState, rng: Rng): ShowState {
    if (state.status !== "playing") return state;
    if (state.config.mode !== "custom") return state;
    if (state.currentRoundIndex === null) return state;

    const r = state.currentRoundIndex;

    const nextPlayers = state.players.map(p => {
        const current = p.currentScores[r];
        const target = p.plannedScores[r];

        const nextValue = calculateNextTowardsTarget(current, target, rng);

        if (nextValue === current) return p;

        return {
            ...p,
            currentScores: p.currentScores.map((v, i) => (i === r ? nextValue : v)),
        };
    });

    return { ...state, players: nextPlayers };
}

export function calculateNextTowardsTarget(current: number, target: number, rng: Rng): number {
    if (current >= target) return target;

    const remaining = target - current;

    const maxStep = Math.max(1, Math.ceil(remaining / 3));
    const step = Math.floor(rng() * maxStep) + 1;

    return Math.min(current + step, target);
}

export function nextRound(state: ShowState): ShowState {
    if (state.status !== "playing") return state;
    if (state.currentRoundIndex === null) return state;

    const curr = state.currentRoundIndex;
    const next = curr + 1;

    if (next >= state.rounds.length) {
        return {
            ...state,
            status: "finished",
            currentRoundIndex: null,
            rounds: state.rounds.map(r => ({ ...r, isActive: false, isFinished: true })),
        };
    }

    return {
        ...state,
        currentRoundIndex: next,
        rounds: state.rounds.map((r, i) => ({
            ...r,
            isActive: i === next,
            isFinished: i < next,
        })),
    };
}

export function resetShow(state: ShowState): ShowState {
    return { ...state, ...state, status: "setup" };
}
