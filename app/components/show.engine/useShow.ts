"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
    addPlayer,
    addRound,
    nextRound,
    removePlayer,
    removeRound,
    renamePlayer,
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

const STORAGE_KEY = "custom-show-show";
const DEFAULT_TICK_INTERVAL_MS = 300;

type PersistedShow = {
    state: ShowState;
    loop: {
        status: "running" | "paused";
        tickIntervalMs: number;
    };
};

type PersistedLoop = PersistedShow["loop"];

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
        if (parsed.state.status === "finished") {
            localStorage.removeItem(STORAGE_KEY);
            return null;
        }
        if (parsed.loop.status !== "running" && parsed.loop.status !== "paused") {
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
    const loopRef = useRef<ShowLoop | null>(null);
    const allowPersistRef = useRef(false);
    const tickIntervalRef = useRef<number>(DEFAULT_TICK_INTERVAL_MS);

    const getPersistedLoop = useCallback((): PersistedLoop => {
        const status = loopRef.current?.getStatus();
        return {
            status: status === "running" ? "running" : "paused",
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
                { tickIntervalMs, autoNextRound: true },
                {
                    onTick: (nextState) => {
                        setState(nextState);
                        persistState(nextState);
                    },
                    onRoundFinished: (nextState) => {
                        persistState(nextState);
                    },
                    onShowFinished: (nextState) => {
                        setState(nextState);
                        persistState(nextState);
                        stopLoop();
                    },
                }
            );
            loopRef.current = loop;
            return loop;
        },
        [persistState, stopLoop]
    );

    useEffect(() => {
        const persisted = readPersisted();
        initialPersistedRef.current = persisted;
        if (persisted) {
            tickIntervalRef.current = persisted.loop.tickIntervalMs;
            setState(persisted.state);
        } else {
            tickIntervalRef.current = DEFAULT_TICK_INTERVAL_MS;
        }
        allowPersistRef.current = true;
        setHydrated(true);
    }, []);

    useEffect(() => {
        if (!hydrated) return;
        const persisted = initialPersistedRef.current;
        if (!persisted) return;
        if (
            persisted.state.status === "playing" &&
            persisted.state.config.mode === "custom"
        ) {
            const loop = createLoop(persisted.state, persisted.loop);
            loop.syncState(persisted.state);
            if (persisted.loop.status === "running") {
                loop.start();
            }
        }
    }, [createLoop, hydrated]);

    useEffect(() => {
        if (!loopRef.current) return;
        loopRef.current.syncState(state);
        if (state.status !== "playing") {
            stopLoop();
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
        if (nextState.status === "playing" && nextState.config.mode === "custom") {
            const loop = createLoop(nextState);
            loop.syncState(nextState);
            loop.start();
            persistState(nextState);
        }
    }, [createLoop, persistState, state, updateState]);

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
        }
    }, [state, stopLoop, updateState]);

    const pauseShow = useCallback(() => {
        if (loopRef.current) {
            loopRef.current.pause();
        }
        allowPersistRef.current = true;
        persistState(state);
    }, [persistState, state]);

    const resumeShow = useCallback(() => {
        if (state.status !== "playing" || state.config.mode !== "custom") return;
        const loop = createLoop(state);
        loop.syncState(state);
        if (loop.getStatus() === "paused") {
            loop.resume();
        } else {
            loop.start();
        }
        allowPersistRef.current = true;
        persistState(state);
    }, [createLoop, persistState, state]);

    const stopShow = useCallback(() => {
        stopLoop();
        allowPersistRef.current = true;
        persistState(state);
    }, [persistState, state, stopLoop]);

    const resetShowHandler = useCallback(() => {
        stopLoop();
        if (typeof window !== "undefined") {
            localStorage.removeItem(STORAGE_KEY);
        }
        tickIntervalRef.current = DEFAULT_TICK_INTERVAL_MS;
        allowPersistRef.current = false;
        setState(initialShowState);
    }, [stopLoop]);

    return {
        hydrated,
        state,
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
        resetShow: resetShowHandler,
    };
}
