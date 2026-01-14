'use client';

import { useCallback, useLayoutEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getTotalScore, Player, ShowStatus } from "@/app/components/show.engine";
import ScoreboardRow from "./ScoreboardRow";

interface ScoreboardProps {
    players: Player[];
    currentRoundIndex: number | null;
    activePlayerId: string | null;
    status: ShowStatus;
    tickIntervalMs: number;
}

const Scoreboard = ({
    players,
    currentRoundIndex,
    activePlayerId,
    status,
    tickIntervalMs
}: ScoreboardProps) => {
    const { t } = useTranslation();
    const sorted = useMemo(() => {
        return [...players]
            .map((player, originalIndex) => ({
                player,
                totalScore: getTotalScore(player),
                roundScore:
                    currentRoundIndex !== null
                        ? player.currentScores[currentRoundIndex] ?? 0
                        : null,
                originalIndex,
            }))
            .sort((a, b) => {
                const diff = b.totalScore - a.totalScore;
                if (diff !== 0) return diff;
                return a.originalIndex - b.originalIndex;
            });
    }, [players, currentRoundIndex]);

    const rowRefs = useRef(new Map<string, HTMLDivElement>());
    const positionsRef = useRef(new Map<string, DOMRect>());
    const signatureRef = useRef<string | null>(null);

    const setRowRef = useCallback((id: string) => {
        return (node: HTMLDivElement | null) => {
            if (node) {
                rowRefs.current.set(id, node);
            } else {
                rowRefs.current.delete(id);
            }
        };
    }, []);

    useLayoutEffect(() => {
        const signature = sorted.map(entry => entry.player.id).join("|");
        const prev = positionsRef.current;
        const next = new Map<string, DOMRect>();
        const shouldAnimate =
            signatureRef.current !== null && signatureRef.current !== signature;
        const duration = Math.max(60, Math.min(420, tickIntervalMs * 0.8));

        rowRefs.current.forEach((node, id) => {
            const rect = node.getBoundingClientRect();
            next.set(id, rect);
            const prevRect = prev.get(id);
            if (!prevRect || !shouldAnimate) return;
            const deltaY = prevRect.top - rect.top;
            if (deltaY === 0) return;
            node.getAnimations().forEach(animation => animation.cancel());
            node.animate(
                [
                    { transform: `translateY(${deltaY}px)` },
                    { transform: "translateY(0)" },
                ],
                {
                    duration,
                    easing: "cubic-bezier(0.2, 0, 0, 1)",
                }
            );
        });

        positionsRef.current = next;
        signatureRef.current = signature;
    }, [sorted, tickIntervalMs]);

    return (
        <div className="flex min-h-0 flex-1 flex-col rounded-3xl border border-zinc-800 bg-zinc-900/60 p-4 shadow-2xl backdrop-blur-xl sm:p-6">
            <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h2 className="text-xl font-semibold text-zinc-100 sm:text-2xl">
                        {t("scoreboard.title")}
                    </h2>
                    <p className="text-sm text-zinc-400">
                        {status === "finished"
                            ? t("scoreboard.final")
                            : currentRoundIndex !== null
                                ? t("scoreboard.roundLabel", { number: currentRoundIndex + 1 })
                                : t("scoreboard.inProgress")}
                    </p>
                </div>
                <div className="text-xs uppercase tracking-[0.2em] text-zinc-500">
                    {t("scoreboard.totalPoints")}
                </div>
            </div>

            <div className="mt-4 grid grid-cols-[36px_1fr_80px_80px] gap-3 text-xs font-semibold uppercase tracking-wide text-zinc-500 sm:grid-cols-[48px_1fr_100px_100px]">
                <div>{t("scoreboard.rank")}</div>
                <div>{t("scoreboard.participant")}</div>
                <div className="text-right">{t("scoreboard.round")}</div>
                <div className="text-right">{t("scoreboard.total")}</div>
            </div>

            <div className="mt-3 flex min-h-0 flex-col gap-2 overflow-y-auto">
                {sorted.map((entry, index) => (
                    <ScoreboardRow
                        key={entry.player.id}
                        ref={setRowRef(entry.player.id)}
                        rank={index + 1}
                        player={entry.player}
                        totalScore={entry.totalScore}
                        roundScore={entry.roundScore}
                        isActive={entry.player.id === activePlayerId}
                    />
                ))}
            </div>
        </div>
    );
};

export default Scoreboard;
