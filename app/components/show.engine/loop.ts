import { ShowState, Rng } from "./types/show.types";
import { tickCustomScores, nextRound } from "./logic";
import { isCustomRoundFinished } from "./selectors";
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

    stop() {
        this.clear();
        this.status = "stopped";
    }

    private tick = () => {
        if (this.status !== "running") return;

        const nextState = tickCustomScores(this.state, this.rng);

        this.state = nextState;
        this.handlers.onTick(nextState);

        if (isCustomRoundFinished(nextState)) {
            this.handlers.onRoundFinished?.(nextState);

            if (this.options.autoNextRound) {
                const advanced = nextRound(nextState);
                this.state = advanced;
                this.handlers.onTick(advanced);

                if (advanced.status === "finished") {
                    this.handlers.onShowFinished?.(advanced);
                    this.stop();
                    return;
                }
            }
        }

        this.schedule();
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
