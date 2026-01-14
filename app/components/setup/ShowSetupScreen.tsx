'use client';

import { useTranslation } from "react-i18next";
import { useShow } from "@/app/components/show.engine";
import ModeSelector from "./ModeSelector";
import ParticipantsList from "./ParticipantsList";
import RoundsInput from "./RoundsInput";
import CustomScoresTable from "./CustomScoresTable";

const ShowSetupScreen = () => {
    const { t } = useTranslation();
    const {
        hydrated,
        state,
        setMode,
        addPlayer,
        removePlayer,
        renamePlayer,
        addRound,
        removeRound,
        setPlannedScore,
        startShow,
        setParticipantAvatar,
    } = useShow();

    if (!hydrated) return null;
    if (state.status !== "setup" && state.status !== "ready") return null;

    return (
        <div className="flex flex-col gap-6 px-4 py-6 sm:p-6 rounded-3xl bg-zinc-900/60 backdrop-blur-xl shadow-2xl border border-zinc-800 w-full min-w-[300px]">
            <div>
                <h1 className="text-2xl font-semibold text-zinc-100">
                    {t("app.title")}
                </h1>

                <h2 className="text-lg text-zinc-400">
                    {t("app.settings")}
                </h2>
            </div>

            <ModeSelector
                mode={state.config.mode}
                onChange={setMode}
            />

            <ParticipantsList
                participants={state.players}
                onAdd={addPlayer}
                onRemove={removePlayer}
                onRename={renamePlayer}
                onSetAvatar={setParticipantAvatar}
            />

            <RoundsInput
                roundsCount={state.rounds.length}
                onAddRound={addRound}
                onRemoveRound={removeRound}
            />

            {state.config.mode === "custom" && state.rounds.length > 0 && (
                <CustomScoresTable
                    participants={state.players}
                    roundsCount={state.rounds.length}
                    onSetPlannedScore={setPlannedScore}
                />
            )}

            <div className="flex flex-col gap-3 pt-2 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-zinc-500">
                    {state.status === "ready" ? t("app.ready") : t("app.setupHint")}
                </div>

                <button
                    type="button"
                    onClick={startShow}
                    disabled={state.status !== "ready"}
                    className={`px-5 py-2 rounded-full text-sm font-semibold transition-colors w-full md:w-auto min-h-[44px]
                        ${state.status === "ready"
                            ? "bg-zinc-100 text-zinc-900 hover:bg-white"
                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"}
                    `}
                >
                    {t("app.startShow")}
                </button>
            </div>
        </div>
    );
};

export default ShowSetupScreen;
