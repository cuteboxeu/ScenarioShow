'use client';

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Player } from "@/app/components/show.engine";

interface ParticipantsListProps {
    participants: Player[];
    onAdd: (name: string) => void;
    onRemove: (id: string) => void;
    onRename: (id: string, name: string) => void;
    onSetAvatar: (id: string, avatarUrl: string) => void;
}

const ParticipantsList = ({
    participants,
    onAdd,
    onRemove,
    onRename,
    onSetAvatar,
}: ParticipantsListProps) => {
    const { t } = useTranslation();
    const [name, setName] = useState("");

    const handleAdd = () => {
        const trimmed = name.trim().slice(0, 25);
        if (!trimmed) return;
        onAdd(trimmed);
        setName("");
    };

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-zinc-100">
                    {t("participants.title")}
                </h3>
                <p className="text-sm text-zinc-500">
                    {t("participants.minHint")}
                </p>
            </div>

            <div className="flex flex-col gap-2">
                {participants.map((participant, index) => (
                    <div
                        key={participant.id}
                        className="flex flex-col gap-2 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl px-3 py-2"
                    >
                        <div className="flex items-center gap-3">
                            <div className="text-xs text-zinc-500 w-10 shrink-0">
                                #{index + 1}
                            </div>
                            <div className="relative w-10 h-10 shrink-0">
                                {isValidAvatarUrl(participant.avatarUrl) ? (
                                    <img
                                        src={participant.avatarUrl}
                                        alt={t("participants.avatarAlt", {
                                            name: participant.name || t("participants.defaultName"),
                                        })}
                                        className="w-10 h-10 rounded-full object-cover border border-zinc-700/60"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-full bg-zinc-700/70 text-zinc-200 flex items-center justify-center text-xs font-semibold uppercase border border-zinc-700/60">
                                        {getInitials(participant.name)}
                                    </div>
                                )}
                            </div>
                            <input
                                type="text"
                                value={participant.name}
                                maxLength={25}
                                onChange={(event) => onRename(participant.id, event.target.value.slice(0, 25))}
                                placeholder={t("participants.namePlaceholder")}
                                className="flex-1 min-w-0 bg-transparent text-zinc-100 placeholder:text-zinc-500 outline-none min-h-[44px]"
                            />
                            <button
                                type="button"
                                onClick={() => onRemove(participant.id)}
                                className="text-xs font-semibold uppercase tracking-wide transition-colors text-zinc-300 hover:text-white min-h-[44px]"
                            >
                                {t("participants.remove")}
                            </button>
                        </div>
                        <input
                            type="url"
                            value={participant.avatarUrl ?? ""}
                            onChange={(event) => onSetAvatar(participant.id, event.target.value)}
                            placeholder={t("participants.avatarPlaceholder")}
                            className="w-full bg-zinc-800/60 text-zinc-100 placeholder:text-zinc-500 outline-none border border-zinc-700/60 rounded-2xl px-3 py-2 min-h-[44px]"
                        />
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    maxLength={25}
                    onKeyDown={(event) => {
                        if (event.key === "Enter") {
                            event.preventDefault();
                            handleAdd();
                        }
                    }}
                    placeholder={t("participants.addPlaceholder")}
                    className="flex-1 bg-zinc-800/60 border border-zinc-700/60 rounded-2xl px-4 py-2 text-zinc-100 placeholder:text-zinc-500 outline-none min-h-[44px]"
                />
                <button
                    type="button"
                    onClick={handleAdd}
                    className="px-4 py-2 rounded-2xl text-sm font-semibold bg-zinc-100 text-zinc-900 hover:bg-white transition-colors min-h-[44px] w-full md:w-auto"
                >
                    {t("participants.addButton")}
                </button>
            </div>
        </section>
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

export default ParticipantsList;
