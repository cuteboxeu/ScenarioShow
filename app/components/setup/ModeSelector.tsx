'use client';

import { useTranslation } from "react-i18next";
import ModeSlider from "@/app/components/SettingsBoard/ModeSlider";
import { ShowMode } from "@/app/components/show.engine";

interface ModeSelectorProps {
    mode: ShowMode;
    onChange: (mode: ShowMode) => void;
}

const ModeSelector = ({ mode, onChange }: ModeSelectorProps) => {
    const { t } = useTranslation();

    return (
        <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-zinc-100">
                    {t("mode.title")}
                </h3>
                <p className="text-sm text-zinc-500">
                    {t("mode.subtitle")}
                </p>
            </div>

            <ModeSlider
                mode={mode}
                onChange={onChange}
                label={t("mode.label")}
                className="max-w-[360px]"
            />
        </section>
    );
};

export default ModeSelector;
