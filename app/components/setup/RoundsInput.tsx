'use client';

import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

interface RoundsInputProps {
    roundsCount: number;
    onAddRound: () => void;
    onRemoveRound: (index: number) => void;
}

const MAX_ROUNDS = 5;

const RoundsInput = ({ roundsCount, onAddRound, onRemoveRound }: RoundsInputProps) => {
    const { t } = useTranslation();
    const targetRef = useRef<number | null>(null);

    useEffect(() => {
        if (targetRef.current === null) return;
        if (targetRef.current === roundsCount) {
            targetRef.current = null;
            return;
        }
        if (targetRef.current > roundsCount) {
            if (roundsCount >= MAX_ROUNDS) {
                targetRef.current = null;
                return;
            }
            onAddRound();
            return;
        }
        onRemoveRound(roundsCount - 1);
    }, [onAddRound, onRemoveRound, roundsCount]);

    const handleChange = (nextValue: number) => {
        if (!Number.isFinite(nextValue)) return;
        const normalized = Math.min(MAX_ROUNDS, Math.max(1, Math.floor(nextValue)));
        targetRef.current = normalized;
        if (normalized > roundsCount) {
            if (roundsCount >= MAX_ROUNDS) return;
            onAddRound();
            return;
        }
        if (normalized < roundsCount) {
            onRemoveRound(roundsCount - 1);
        }
    };

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-zinc-100">
                    {t("rounds.title")}
                </h3>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
                <label className="text-sm text-zinc-500" htmlFor="rounds-count">
                    {t("rounds.label")}
                </label>
                <input
                    id="rounds-count"
                    type="number"
                    min={1}
                    max={MAX_ROUNDS}
                    step={1}
                    value={roundsCount}
                    onChange={(event) => handleChange(event.currentTarget.valueAsNumber)}
                    className="w-full sm:w-24 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl px-3 py-2 text-zinc-100 placeholder:text-zinc-500 outline-none min-h-[44px]"
                />
            </div>
        </section>
    );
};

export default RoundsInput;
