import { ShowState, Rng } from "./types/show.types";
import { tickCustomOneByOne, tickRandomOneByOne, nextPlayer, nextRound } from "./logic";
import { isCurrentPlayerFinished, isCustomRoundFinished, isRandomRoundFinished } from "./selectors";
import { ShowLoopHandlers, ShowLoopOptions, ShowLoopStatus } from "./types/loop.types";

export class ShowLoop {
    private timerId: number | null = null;
    private status: ShowLoopStatus = "idle";

    private state: ShowState;
    private rng: Rng;
    private options: ShowLoopOptions;
    private handlers: ShowLoopHandlers;

    constructor(
        initialState: ShowState,
        rng: Rng,
        options: ShowLoopOptions,
        handlers: ShowLoopHandlers
    ) {
        this.state = initialState;
        this.rng = rng;
        this.options = options;
        this.handlers = handlers;
    }

    getStatus(): ShowLoopStatus {
        return this.status;
    }

    syncState(state: ShowState) {
        this.state = state;
    }

    start() {
        if (this.status === "running") return;

        this.status = "running";
        this.schedule();
    }

    pause() {
        if (this.status !== "running") return;
        this.clear();
        this.status = "paused";
    }

    resume() {
        if (this.status !== "paused") return;
        this.status = "running";
        this.schedule();
    }

    setTickIntervalMs(ms: number) {
        if (!Number.isFinite(ms) || ms <= 0) return;
        this.options.tickIntervalMs = ms;
        if (this.status === "running") {
            this.clear();
            this.schedule();
        }
    }

    stop() {
        this.clear();
        this.status = "stopped";
    }

    private tick = () => {
        if (this.status !== "running") return;

        const prevState = this.state;
        const prevCustomFinished = isCustomRoundFinished(prevState);
        const prevRandomFinished = isRandomRoundFinished(prevState);

        let nextState = prevState;
        if (prevState.config.mode === "custom") {
            nextState = tickCustomOneByOne(prevState, this.rng);
        } else if (prevState.config.mode === "random") {
            nextState = tickRandomOneByOne(prevState, this.rng);
        }

        if (nextState !== prevState) {
            this.state = nextState;
            this.handlers.onTick(nextState);
        }

        if (this.state.config.mode === "custom") {
            if (isCurrentPlayerFinished(this.state)) {
                const advancedPlayer = nextPlayer(this.state);
                if (advancedPlayer !== this.state) {
                    this.state = advancedPlayer;
                    this.handlers.onTick(advancedPlayer);
                }
            }

            const nowCustomFinished = isCustomRoundFinished(this.state);
            if (!prevCustomFinished && nowCustomFinished) {
                this.handlers.onRoundFinished?.(this.state);
            }
        }

        if (this.state.config.mode === "random") {
            const nowRandomFinished = isRandomRoundFinished(this.state);
            if (!prevRandomFinished && nowRandomFinished) {
                if (!this.options.autoNextRound) {
                    this.pause();
                    this.handlers.onRoundFinished?.(this.state);
                } else {
                    this.handlers.onRoundFinished?.(this.state);
                    const advanced = nextRound(this.state);
                    this.state = advanced;
                    this.handlers.onTick(advanced);
                }
            }
        }

        if (this.options.autoNextRound && isCustomRoundFinished(this.state)) {
            const advanced = nextRound(this.state);
            this.state = advanced;
            this.handlers.onTick(advanced);

            if (advanced.status === "finished") {
                this.handlers.onShowFinished?.(advanced);
                this.stop();
                return;
            }
        }

        if (this.status === "running") {
            this.schedule();
        }
    };

    private schedule() {
        this.timerId = window.setTimeout(
            this.tick,
            this.options.tickIntervalMs
        );
    }

    private clear() {
        if (this.timerId !== null) {
            clearTimeout(this.timerId);
            this.timerId = null;
        }
    }
}
