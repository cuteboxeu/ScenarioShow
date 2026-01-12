'use client';

import { useState } from "react";
import ModeSlider, { type Mode } from "./ModeSlider";

const SettingsBoard = () => {
    const [mode, setMode] = useState<Mode>("custom");

    return (
        <div className="flex flex-col gap-6 p-6 rounded-3xl bg-zinc-900/60 backdrop-blur-xl shadow-2xl border border-zinc-800 w-full min-w-[300px]">

            <div>
                <h1 className="text-2xl font-semibold text-zinc-100">
                    Scenario Show
                </h1>

                <h2 className="text-lg text-zinc-400">
                    Settings
                </h2>
            </div>

            <ModeSlider
                mode={mode}
                onChange={setMode}
            />
        </div>
    );
};

export default SettingsBoard;
