'use client';

import { forwardRef } from "react";
import { useTranslation } from "react-i18next";
import { Player } from "@/app/components/show.engine";

interface ScoreboardRowProps {
    rank: number;
    player: Player;
    totalScore: number;
    roundScore: number | null;
    isActive: boolean;
}

const ScoreboardRow = forwardRef<HTMLDivElement, ScoreboardRowProps>(
    ({ rank, player, totalScore, roundScore, isActive }, ref) => {
        const { t } = useTranslation();
        return (
            <div
                ref={ref}
                className={`grid grid-cols-[36px_1fr_80px_80px] items-center gap-3 rounded-2xl border px-3 py-3 transition-all sm:grid-cols-[48px_1fr_100px_100px]
                    ${isActive
                        ? "border-amber-400/60 bg-amber-500/10 shadow-lg shadow-amber-500/10"
                        : "border-zinc-800/70 bg-zinc-900/40"}
                `}
            >
                <div className="text-sm font-semibold text-zinc-300">{rank}</div>
                <div className="flex min-w-0 items-center gap-3">
                    <div className="relative h-9 w-9 shrink-0 sm:h-10 sm:w-10">
                        {isValidAvatarUrl(player.avatarUrl) ? (
                            <img
                                src={player.avatarUrl}
                                alt={t("participants.avatarAlt", {
                                    name: player.name || t("participants.defaultName"),
                                })}
                                className="h-full w-full rounded-full border border-zinc-700/60 object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center rounded-full border border-zinc-700/60 bg-zinc-800 text-xs font-semibold uppercase text-zinc-200">
                                {getInitials(player.name)}
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-zinc-100">
                            {player.name || t("participants.unnamed")}
                        </div>
                        <div className="text-xs text-zinc-500">{t("scoreboard.liveScore")}</div>
                    </div>
                </div>
                <div
                    className={`text-right text-base font-semibold tabular-nums sm:text-lg
                        ${isActive ? "text-amber-100" : "text-zinc-200"}
                    `}
                >
                    {roundScore !== null ? roundScore : "--"}
                </div>
                <div className="text-right text-base font-semibold tabular-nums text-zinc-100 sm:text-lg">
                    {totalScore}
                </div>
            </div>
        );
    }
);

ScoreboardRow.displayName = "ScoreboardRow";

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

export default ScoreboardRow;
