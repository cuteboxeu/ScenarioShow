'use client';

import { Player, ShowState } from "@/app/components/show.engine";
import { ShowLoopStatus } from "@/app/components/show.engine/types/loop.types";
import { useTranslation } from "react-i18next";

interface ControlPanelProps {
    state: ShowState;
    loopStatus: ShowLoopStatus;
    activePlayer: Player | null;
    startShow: () => void;
    pauseShow: () => void;
    resumeShow: () => void;
    nextRound: () => void;
    finishShow: () => void;
    resetShow: () => void;
    setShowSpeed?: (ms: number) => void;
}

const ControlPanel = ({
    state,
    loopStatus,
    activePlayer,
    startShow,
    pauseShow,
    resumeShow,
    nextRound,
    finishShow,
    resetShow,
    setShowSpeed,
}: ControlPanelProps) => {
    const { t } = useTranslation();
    const isPlaying = state.status === "playing";
    const canStart = state.status === "setup" || state.status === "ready";
    const randomRoundFinished =
        state.config.mode === "random" &&
        state.currentRoundIndex !== null &&
        state.rounds[state.currentRoundIndex]?.isFinished;
    const canPause = isPlaying && loopStatus === "running" && !randomRoundFinished;
    const canResume = isPlaying && loopStatus !== "running" && !randomRoundFinished;

    const currentRoundNumber =
        state.currentRoundIndex !== null ? state.currentRoundIndex + 1 : null;

    const showRoundTransition = isPlaying && (
        (state.config.mode === "custom" &&
            state.currentPlayerIndex === null &&
            state.currentRoundIndex !== null) ||
        (state.config.mode === "random" &&
            state.currentRoundIndex !== null &&
            state.rounds[state.currentRoundIndex]?.isFinished)
    );

    const nextRoundNumber =
        state.currentRoundIndex !== null ? state.currentRoundIndex + 2 : null;
    const isLastRound =
        state.currentRoundIndex !== null &&
        state.currentRoundIndex + 1 >= state.rounds.length;

    return (
        <aside className="flex w-full flex-col gap-4 rounded-3xl border border-zinc-800 bg-zinc-900/70 p-4 shadow-2xl backdrop-blur-xl sm:p-6 lg:w-[340px]">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-zinc-100">
                        {t("control.title")}
                    </h3>
                    <p className="text-sm text-zinc-400">
                        {state.status === "finished"
                            ? t("control.wrapUp")
                            : state.currentRoundIndex !== null
                                ? t("control.roundOf", {
                                    current: state.currentRoundIndex + 1,
                                    total: state.rounds.length,
                                })
                                : t("control.showControls")}
                    </p>
                </div>
                {state.config.mode === "random" && state.status === "playing" && (
                    <div className="rounded-full border border-amber-400/50 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-amber-200">
                        {t("control.randomMode")}
                    </div>
                )}
            </div>

            {state.status === "finished" ? (
                <div className="rounded-2xl border border-amber-400/40 bg-amber-500/10 px-4 py-4 text-amber-100">
                    <div className="text-lg font-semibold">{t("control.finishedTitle")}</div>
                    <div className="mt-1 text-sm text-amber-100/80">
                        {t("control.finishedHint")}
                    </div>
                    <button
                        type="button"
                        onClick={resetShow}
                        className="mt-4 w-full rounded-2xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white min-h-[44px]"
                    >
                        {t("control.reset")}
                    </button>
                </div>
            ) : (
                <>
                    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {t("control.showControls")}
                        </div>
                        <div className="mt-3 flex flex-col gap-2">
                            {canStart && (
                                <button
                                    type="button"
                                    onClick={startShow}
                                    className="w-full rounded-2xl bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white min-h-[44px]"
                                >
                                    {t("control.start")}
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={pauseShow}
                                disabled={!canPause}
                                className={`w-full rounded-2xl px-4 py-2 text-sm font-semibold transition-colors min-h-[44px]
                                    ${canPause
                                        ? "bg-zinc-800 text-zinc-100 hover:bg-zinc-700"
                                        : "bg-zinc-900 text-zinc-600 cursor-not-allowed"}
                                `}
                            >
                                {t("control.pause")}
                            </button>
                            <button
                                type="button"
                                onClick={resumeShow}
                                disabled={!canResume}
                                className={`w-full rounded-2xl px-4 py-2 text-sm font-semibold transition-colors min-h-[44px]
                                    ${canResume
                                        ? "bg-emerald-500/90 text-zinc-900 hover:bg-emerald-400"
                                        : "bg-zinc-900 text-zinc-600 cursor-not-allowed"}
                                `}
                            >
                                {loopStatus === "idle"
                                    ? t("control.startRound")
                                    : t("control.resume")}
                            </button>
                            {isPlaying && (
                                <button
                                    type="button"
                                    onClick={finishShow}
                                    className="w-full rounded-2xl bg-rose-500/90 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-rose-400 min-h-[44px]"
                                >
                                    {t("control.finishEarly")}
                                </button>
                            )}
                        </div>
                    </section>

                    <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4">
                        <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            {t("control.speedControl")}
                        </div>
                        <div className="mt-3">
                            <input
                                type="range"
                                min={120}
                                max={800}
                                step={20}
                                defaultValue={620}
                                onChange={(event) => {
                                    const min = 120;
                                    const max = 800;
                                    const value = Number(event.currentTarget.value);
                                    const inverted = max - (value - min);
                                    setShowSpeed?.(inverted);
                                }}
                                className="w-full accent-amber-400"
                            />
                            <div className="mt-2 flex items-center justify-between text-xs text-zinc-500">
                                <span>{t("control.slower")}</span>
                                <span>{t("control.faster")}</span>
                            </div>
                        </div>
                    </section>

                    {activePlayer && (
                        <section className="rounded-2xl border border-zinc-800/80 bg-zinc-950/40 p-4">
                            <div className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                                {t("control.nowRevealingTitle")}
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                                {isValidAvatarUrl(activePlayer.avatarUrl) ? (
                                    <img
                                        src={activePlayer.avatarUrl}
                                        alt={t("participants.avatarAlt", {
                                            name: activePlayer.name || t("participants.defaultName"),
                                        })}
                                        className="h-10 w-10 rounded-full border border-zinc-700/60 object-cover"
                                    />
                                ) : (
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-800 text-xs font-semibold uppercase text-zinc-200">
                                        {getInitials(activePlayer.name)}
                                    </div>
                                )}
                                <div>
                                    <div className="text-sm font-semibold text-zinc-100">
                                        {t("control.nowRevealingName", {
                                            name: activePlayer.name || t("participants.unnamed"),
                                        })}
                                    </div>
                                    <div className="text-xs text-zinc-500">
                                        {t("control.currentParticipant")}
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {showRoundTransition && (
                        <section className="rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-100">
                            <div className="text-sm font-semibold">
                                {t("control.roundFinished", { number: currentRoundNumber })}
                            </div>
                            <button
                                type="button"
                                onClick={nextRound}
                                className="mt-3 w-full rounded-2xl bg-amber-400 px-4 py-2 text-sm font-semibold text-zinc-900 transition-colors hover:bg-amber-300 min-h-[44px]"
                            >
                                {isLastRound
                                    ? t("control.finishShow")
                                    : nextRoundNumber
                                        ? t("control.continueRound", { number: nextRoundNumber })
                                        : t("control.continue")}
                            </button>
                        </section>
                    )}
                </>
            )}
        </aside>
    );
};

function getInitials(name: string) {
    const trimmed = name.trim();
    if (!trimmed) return "?";
    const parts = trimmed.split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1]?.[0] ?? "" : "";
    return `${first}${last}`.toUpperCase();
}

function isValidAvatarUrl(avatarUrl?: string) {
    if (!avatarUrl) return false;
    try {
        const parsed = new URL(avatarUrl);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
        return false;
    }
}

export default ControlPanel;
