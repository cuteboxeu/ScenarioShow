"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    addPlayer,
    addRound,
    finishShow,
    nextRound,
    removePlayer,
    removeRound,
    renamePlayer,
    resetShowPreserveParticipants,
    setPlayerAvatar,
    setMode,
    setPlannedScore,
    setScoreRandom,
    startShow,
} from "./logic";
import { initialShowState } from "./initial";
import { defaultRng } from "./rng";
import { ShowState, ShowMode } from "./types/show.types";
import { ShowLoop } from "./loop";
import { ShowLoopStatus } from "./types/loop.types";

const STORAGE_KEY = "custom-show-show";
const DEFAULT_TICK_INTERVAL_MS = 300;

type PersistedShow = {
    state: ShowState;
    loop: {
        status: "running" | "paused" | "idle";
        tickIntervalMs: number;
    };
};

type PersistedLoop = PersistedShow["loop"];

function isValidPersistedState(state: ShowState): boolean {
    if (!state) return false;
    if (state.config?.mode !== "custom" && state.config?.mode !== "random") return false;
    if (!Number.isFinite(state.config?.roundsCount) || state.config.roundsCount < 0) return false;
    if (!Array.isArray(state.rounds) || !Array.isArray(state.players)) return false;
    if (state.rounds.length !== state.config.roundsCount) return false;

    for (let i = 0; i < state.rounds.length; i += 1) {
        const round = state.rounds[i];
        if (!round || round.index !== i) return false;
        if (typeof round.isActive !== "boolean" || typeof round.isFinished !== "boolean") return false;
    }

    for (const player of state.players) {
        if (!player || typeof player.id !== "string") return false;
        if (typeof player.name !== "string" || typeof player.avatarUrl !== "string") return false;
        if (!Array.isArray(player.plannedScores) || !Array.isArray(player.currentScores)) return false;
        if (player.plannedScores.length !== state.rounds.length) return false;
        if (player.currentScores.length !== state.rounds.length) return false;
        if (player.plannedScores.some(n => !Number.isFinite(n) || n < 0)) return false;
        if (player.currentScores.some(n => !Number.isFinite(n) || n < 0)) return false;
    }

    if (
        state.currentRoundIndex !== null &&
        (!Number.isInteger(state.currentRoundIndex) ||
            state.currentRoundIndex < 0 ||
            state.currentRoundIndex >= state.rounds.length)
    ) {
        return false;
    }

    if (
        state.currentPlayerIndex !== null &&
        (!Number.isInteger(state.currentPlayerIndex) ||
            state.currentPlayerIndex < 0 ||
            state.currentPlayerIndex >= state.players.length)
    ) {
        return false;
    }

    if (
        state.randomPlayerTicksRemaining !== null &&
        (!Number.isFinite(state.randomPlayerTicksRemaining) || state.randomPlayerTicksRemaining < 0)
    ) {
        return false;
    }

    if (
        (state.status === "setup" || state.status === "ready") &&
        (state.currentRoundIndex !== null || state.currentPlayerIndex !== null)
    ) {
        return false;
    }

    if (state.status === "playing" && state.currentRoundIndex === null) return false;
    if (state.status === "finished" && state.currentRoundIndex !== null) return false;

    return true;
}

function readPersisted(): PersistedShow | null {
    if (typeof window === "undefined") return null;
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as PersistedShow;
        if (!parsed?.state || !parsed?.loop) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        if (!isValidPersistedState(parsed.state)) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        if (parsed.state.status === "finished") {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        if (
            parsed.loop.status !== "running" &&
            parsed.loop.status !== "paused" &&
            parsed.loop.status !== "idle"
        ) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        if (!Number.isFinite(parsed.loop.tickIntervalMs)) {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        return parsed;
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return null;
    }
}

export function useShow() {
    const initialPersistedRef = useRef<PersistedShow | null>(null);
    const [state, setState] = useState<ShowState>(initialShowState);
    const [hydrated, setHydrated] = useState(false);
    const [loopStatus, setLoopStatus] = useState<ShowLoopStatus>("idle");
    const [tickIntervalMs, setTickIntervalMs] = useState(DEFAULT_TICK_INTERVAL_MS);
    const loopRef = useRef<ShowLoop | null>(null);
    const allowPersistRef = useRef(false);
    const tickIntervalRef = useRef<number>(DEFAULT_TICK_INTERVAL_MS);

    const getPersistedLoop = useCallback((): PersistedLoop => {
        const status = loopRef.current?.getStatus();
        return {
            status: status === "running" ? "running" : status === "paused" ? "paused" : "idle",
            tickIntervalMs: tickIntervalRef.current,
        };
    }, []);

    const persistState = useCallback(
        (nextState: ShowState) => {
            if (typeof window === "undefined") return;
            if (!allowPersistRef.current) return;
            if (nextState.status === "finished") {
                localStorage.removeItem(STORAGE_KEY);
                allowPersistRef.current = false;
                return;
            }
            const payload: PersistedShow = { state: nextState, loop: getPersistedLoop() };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        },
        [getPersistedLoop]
    );

    const stopLoop = useCallback(() => {
        if (!loopRef.current) return;
        loopRef.current.stop();
        loopRef.current = null;
    }, []);

    const createLoop = useCallback(
        (seedState: ShowState, loopInfo?: PersistedLoop) => {
            if (loopRef.current) return loopRef.current;
            const tickIntervalMs = loopInfo?.tickIntervalMs ?? tickIntervalRef.current;
            tickIntervalRef.current = tickIntervalMs;
            const loop = new ShowLoop(
                seedState,
                defaultRng,
                { tickIntervalMs, autoNextRound: false },
                {
                    onTick: (nextState) => {
                        setState(nextState);
                        persistState(nextState);
                    },
                    onRoundFinished: (nextState) => {
                        persistState(nextState);
                        const status = loopRef.current?.getStatus();
                        if (status) {
                            setLoopStatus(status);
                        }
                    },
                    onShowFinished: (nextState) => {
                        setState(nextState);
                        persistState(nextState);
                        setLoopStatus("stopped");
                        stopLoop();
                    },
                }
            );
            loopRef.current = loop;
            setLoopStatus(loop.getStatus());
            return loop;
        },
        [persistState, stopLoop]
    );

    useEffect(() => {
        const persisted = readPersisted();
        initialPersistedRef.current = persisted;
        if (persisted) {
            tickIntervalRef.current = persisted.loop.tickIntervalMs;
            setTickIntervalMs(persisted.loop.tickIntervalMs);
            setState(persisted.state);
        } else {
            tickIntervalRef.current = DEFAULT_TICK_INTERVAL_MS;
            setTickIntervalMs(DEFAULT_TICK_INTERVAL_MS);
        }
        allowPersistRef.current = true;
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        const persisted = initialPersistedRef.current;
        if (!persisted) return;
        if (persisted.state.status === "playing") {
            const loop = createLoop(persisted.state, persisted.loop);
            loop.syncState(persisted.state);
            if (persisted.loop.status === "running") {
                loop.start();
                setLoopStatus(loop.getStatus());
            }
            if (persisted.loop.status === "paused") {
                setLoopStatus("paused");
            }
            if (persisted.loop.status === "idle") {
                setLoopStatus("idle");
            }
        }
    }, [createLoop, hydrated]);

    useEffect(() => {
        if (!loopRef.current) return;
        loopRef.current.syncState(state);
        if (state.status !== "playing") {
            stopLoop();
            setLoopStatus("stopped");
        }
    }, [state, stopLoop]);

    useEffect(() => {
        return () => {
            stopLoop();
        };
    }, [stopLoop]);

    useEffect(() => {
        const handleBeforeUnload = () => {
            persistState(state);
        };
        window.addEventListener("beforeunload", handleBeforeUnload);
        return () => {
            window.removeEventListener("beforeunload", handleBeforeUnload);
        };
    }, [persistState, state]);

    const updateState = useCallback(
        (nextState: ShowState) => {
            setState(nextState);
            allowPersistRef.current = true;
            persistState(nextState);
        },
        [persistState]
    );

    const setModeHandler = useCallback(
        (mode: ShowMode) => {
            updateState(setMode(state, mode));
        },
        [state, updateState]
    );

    const addPlayerHandler = useCallback(
        (name: string) => {
            updateState(addPlayer(state, name, ""));
        },
        [state, updateState]
    );

    const removePlayerHandler = useCallback(
        (id: string) => {
            updateState(removePlayer(state, id));
        },
        [state, updateState]
    );

    const renamePlayerHandler = useCallback(
        (id: string, name: string) => {
            updateState(renamePlayer(state, id, name));
        },
        [state, updateState]
    );

    const setParticipantAvatarHandler = useCallback(
        (id: string, avatarUrl: string) => {
            updateState(setPlayerAvatar(state, id, avatarUrl));
        },
        [state, updateState]
    );

    const addRoundHandler = useCallback(() => {
        updateState(addRound(state));
    }, [state, updateState]);

    const removeRoundHandler = useCallback(
        (index: number) => {
            updateState(removeRound(state, index));
        },
        [state, updateState]
    );

    const setPlannedScoreHandler = useCallback(
        (playerId: string, round: number, score: number) => {
            updateState(setPlannedScore(state, playerId, round, score));
        },
        [state, updateState]
    );

    const startShowHandler = useCallback(() => {
        const nextState = startShow(state);
        if (nextState === state) return;
        updateState(nextState);
        if (nextState.status === "playing") {
            persistState(nextState);
            setLoopStatus("idle");
        }
    }, [persistState, state, updateState]);

    const setScoreRandomHandler = useCallback(
        (playerId: string, score: number) => {
            updateState(setScoreRandom(state, playerId, score));
        },
        [state, updateState]
    );

    const nextRoundHandler = useCallback(() => {
        const nextState = nextRound(state);
        updateState(nextState);
        if (nextState.status !== "playing") {
            stopLoop();
            setLoopStatus("stopped");
            return;
        }
        const loop = createLoop(nextState);
        loop.syncState(nextState);
        if (loop.getStatus() === "paused") {
            loop.resume();
        } else {
            loop.start();
        }
        setLoopStatus(loop.getStatus());
    }, [createLoop, state, stopLoop, updateState]);

    const pauseShow = useCallback(() => {
        if (loopRef.current) {
            loopRef.current.pause();
            setLoopStatus(loopRef.current.getStatus());
        }
        allowPersistRef.current = true;
        persistState(state);
    }, [persistState, state]);

    const resumeShow = useCallback(() => {
        if (state.status !== "playing") return;
        const loop = createLoop(state);
        loop.syncState(state);
        if (loop.getStatus() === "paused") {
            loop.resume();
        } else {
            loop.start();
        }
        setLoopStatus(loop.getStatus());
        allowPersistRef.current = true;
        persistState(state);
    }, [createLoop, persistState, state]);

    const stopShow = useCallback(() => {
        stopLoop();
        setLoopStatus("stopped");
        allowPersistRef.current = true;
        persistState(state);
    }, [persistState, state, stopLoop]);

    const finishShowHandler = useCallback(() => {
        if (state.status !== "playing") return;
        stopLoop();
        setLoopStatus("stopped");
        updateState(finishShow(state));
    }, [state, stopLoop, updateState]);

    const resetShowHandler = useCallback(() => {
        stopLoop();
        tickIntervalRef.current = DEFAULT_TICK_INTERVAL_MS;
        setTickIntervalMs(DEFAULT_TICK_INTERVAL_MS);
        const nextState = resetShowPreserveParticipants(state);
        updateState(nextState);
        setLoopStatus("idle");
    }, [resetShowPreserveParticipants, state, stopLoop, updateState]);

    const setShowSpeedHandler = useCallback(
        (ms: number) => {
            if (!Number.isFinite(ms) || ms <= 0) return;
            tickIntervalRef.current = ms;
            setTickIntervalMs(ms);
            if (loopRef.current) {
                loopRef.current.setTickIntervalMs(ms);
                setLoopStatus(loopRef.current.getStatus());
            }
            allowPersistRef.current = true;
            persistState(state);
        },
        [persistState, state]
    );

    return {
        hydrated,
        state,
        loopStatus,
        tickIntervalMs,
        setMode: setModeHandler,
        addPlayer: addPlayerHandler,
        removePlayer: removePlayerHandler,
        renamePlayer: renamePlayerHandler,
        setParticipantAvatar: setParticipantAvatarHandler,
        addRound: addRoundHandler,
        removeRound: removeRoundHandler,
        setPlannedScore: setPlannedScoreHandler,
        startShow: startShowHandler,
        setScoreRandom: setScoreRandomHandler,
        nextRound: nextRoundHandler,
        pauseShow,
        resumeShow,
        stopShow,
        finishShow: finishShowHandler,
        resetShow: resetShowHandler,
        setShowSpeed: setShowSpeedHandler,
    };
}
