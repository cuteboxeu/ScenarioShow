'use client';

import { useShow } from "@/app/components/show.engine";
import ShowSetupScreen from "@/app/components/setup/ShowSetupScreen";
import Scoreboard from "./Scoreboard";
import ControlPanel from "./ControlPanel";

const ShowScreen = () => {
    const {
        hydrated,
        state,
        loopStatus,
        tickIntervalMs,
        setMode,
        addPlayer,
        removePlayer,
        renamePlayer,
        addRound,
        removeRound,
        setPlannedScore,
        startShow,
        pauseShow,
        resumeShow,
        nextRound,
        finishShow,
        resetShow,
        setParticipantAvatar,
        setShowSpeed,
    } = useShow();

    if (!hydrated) return null;

    if (state.status === "setup" || state.status === "ready") {
        return (
            <ShowSetupScreen
                hydrated={hydrated}
                state={state}
                setMode={setMode}
                addPlayer={addPlayer}
                removePlayer={removePlayer}
                renamePlayer={renamePlayer}
                addRound={addRound}
                removeRound={removeRound}
                setPlannedScore={setPlannedScore}
                startShow={startShow}
                setParticipantAvatar={setParticipantAvatar}
            />
        );
    }

    if (state.status !== "playing" && state.status !== "finished") return null;

    const activePlayer =
        state.currentPlayerIndex !== null
            ? state.players[state.currentPlayerIndex] ?? null
            : null;

    return (
        <section className="relative min-h-screen w-full overflow-x-hidden text-zinc-100 flex items-center">
            <div className="pointer-events-none absolute inset-0" />
            <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8 lg:flex-row lg:items-stretch">
                <div className="flex min-w-0 flex-1 flex-col">
                    <Scoreboard
                        players={state.players}
                        currentRoundIndex={state.currentRoundIndex}
                        activePlayerId={activePlayer?.id ?? null}
                        status={state.status}
                        tickIntervalMs={tickIntervalMs}
                    />
                </div>
                <ControlPanel
                    state={state}
                    loopStatus={loopStatus}
                    activePlayer={activePlayer}
                    startShow={startShow}
                    pauseShow={pauseShow}
                    resumeShow={resumeShow}
                    nextRound={nextRound}
                    finishShow={finishShow}
                    resetShow={resetShow}
                    setShowSpeed={setShowSpeed}
                />
            </div>
        </section>
    );
};

export default ShowScreen;
