'use client';

export type Mode = "custom" | "random";

interface ModeSliderProps {
    mode: Mode;
    onChange: (mode: Mode) => void;
    label?: string;
    className?: string;
}

const ModeSlider = ({ mode, onChange, label = "Mode:", className = "" }: ModeSliderProps) => {
    return (
        <div className={`flex items-center gap-4 max-w-[300px] w-full ${className}`}>
            <p className="text-zinc-300 shrink-0">{label}</p>

            <div className="relative flex items-center bg-zinc-800/70 rounded-full w-full h-12 p-1 overflow-hidden">

                <div
                    className={`
                        absolute inset-0 p-1
                        transition-transform duration-300 ease-out mr-1
                        ${mode === "random" ? "translate-x-1/2" : "translate-x-0"}
                    `}
                >
                    <div className="h-full w-1/2 rounded-full bg-zinc-100/90" />
                </div>

                <button
                    type="button"
                    onClick={() => onChange("custom")}
                    className={`relative z-10 w-1/2 h-full rounded-full text-sm font-medium transition-colors cursor-pointer
                        ${mode === "custom" ? "text-zinc-900" : "text-zinc-400"}
                    `}
                >
                    Custom
                </button>

                <button
                    type="button"
                    onClick={() => onChange("random")}
                    className={`relative z-10 w-1/2 h-full rounded-full text-sm font-medium transition-colors cursor-pointer
                        ${mode === "random" ? "text-zinc-900" : "text-zinc-400"}
                    `}
                >
                    Random
                </button>
            </div>
        </div>
    );
};

export default ModeSlider;
