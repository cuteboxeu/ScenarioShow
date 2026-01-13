import { ShowState, Rng } from "./types/show.types";
import { tickCustomOneByOne, nextPlayer, nextRound } from "./logic";
import { isCurrentPlayerFinished, isCustomRoundFinished } from "./selectors";
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

        const nextState = tickCustomOneByOne(this.state, this.rng);
        if (nextState !== this.state) {
            this.state = nextState;
            this.handlers.onTick(nextState);
        }

        if (isCurrentPlayerFinished(this.state)) {
            const advancedPlayer = nextPlayer(this.state);
            if (advancedPlayer !== this.state) {
                this.state = advancedPlayer;
                this.handlers.onTick(advancedPlayer);
            }
        }

        if (isCustomRoundFinished(this.state)) {
            this.handlers.onRoundFinished?.(this.state);

            if (this.options.autoNextRound) {
                const advanced = nextRound(this.state);
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
