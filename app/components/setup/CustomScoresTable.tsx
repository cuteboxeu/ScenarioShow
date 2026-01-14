'use client';

import { useTranslation } from "react-i18next";
import { Player } from "@/app/components/show.engine";

interface CustomScoresTableProps {
    participants: Player[];
    roundsCount: number;
    onSetPlannedScore: (participantId: string, roundIndex: number, score: number) => void;
}

const CustomScoresTable = ({
    participants,
    roundsCount,
    onSetPlannedScore,
}: CustomScoresTableProps) => {
    const { t } = useTranslation();
    const roundIndices = Array.from({ length: roundsCount }, (_, index) => index);
    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-zinc-100">
                    {t("scores.title")}
                </h3>
                <p className="text-sm text-zinc-500">
                    {t("scores.subtitle")}
                </p>
            </div>

            <div className="overflow-x-auto">
                <table className="min-w-max border-separate border-spacing-y-2">
                    <thead>
                        <tr className="text-left text-xs uppercase tracking-wide text-zinc-500">
                            <th className="px-3 py-1">{t("scores.participant")}</th>
                            {roundIndices.map((roundIndex) => (
                                <th key={roundIndex} className="px-3 py-1 whitespace-nowrap min-w-[72px]">
                                    {t("scores.round", { number: roundIndex + 1 })}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {participants.map((participant) => (
                            <tr key={participant.id} className="bg-zinc-800/60">
                                <td className="px-3 py-2 rounded-l-2xl border border-zinc-700/60 border-r-0 text-zinc-100">
                                    {participant.name || t("participants.unnamed")}
                                </td>
                                {roundIndices.map((roundIndex) => (
                                    <td
                                        key={`${participant.id}-${roundIndex}`}
                                        className="px-3 py-2 border border-zinc-700/60 border-l-0 border-r-0 last:rounded-r-2xl last:border-l-0 last:border-r"
                                    >
                                        <input
                                            type="number"
                                            min={0}
                                            step={1}
                                            value={participant.plannedScores[roundIndex] ?? 0}
                                            onChange={(event) => {
                                                const next = event.currentTarget.valueAsNumber;
                                                if (!Number.isFinite(next) || next < 0) return;
                                                onSetPlannedScore(participant.id, roundIndex, next);
                                            }}
                                            className="w-20 min-w-[64px] bg-transparent text-zinc-100 placeholder:text-zinc-500 outline-none min-h-[44px]"
                                        />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {participants.length === 0 && (
                <div className="text-sm text-zinc-500">
                    {t("scores.empty")}
                </div>
            )}
        </section>
    );
};

export default CustomScoresTable;
