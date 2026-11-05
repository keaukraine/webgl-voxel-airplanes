import { easeInOutSine, easeTapZ } from "./Easings";

const DEFAULT_PLANE_COUNT = 4;
const DEFAULT_DURATION = 2500;
const DEFAULT_DROP_DEPTH = 30;
const DEFAULT_HORIZONTAL_OFFSET = 25;
const DEFAULT_BANKING_OFFSET = 0.35;

/**
 * Animated tap offsets for a fixed number of planes.
 *
 * Offsets and timers are stored in parallel arrays indexed by the plane's draw
 * order. Each tap starts an independent animation for the tapped plane; the
 * renderer reads the current offsets right before drawing that plane.
 */
export class PlaneTapAnimator {
    private readonly duration: number;
    private readonly dropDepth: number;
    private readonly horizontalOffset: number;
    private readonly bankingOffset: number;

    /** Animation progress in the 0..1 range, per plane. */
    private readonly timers: number[];
    /** Whether an animation is running, per plane. */
    private readonly running: boolean[];
    /** Current offsets added to the plane position, per plane. */
    private readonly offsetsX: number[];
    private readonly offsetsY: number[];
    private readonly offsetsZ: number[];
    /** Current random roll added to the plane banking, per plane. */
    private readonly offsetsBanking: number[];
    /** Random horizontal displacement and banking of the current animation, per plane. */
    private readonly randomX: number[];
    private readonly randomY: number[];
    private readonly randomBanking: number[];

    constructor(
        planeCount = DEFAULT_PLANE_COUNT,
        duration = DEFAULT_DURATION,
        dropDepth = DEFAULT_DROP_DEPTH,
        horizontalOffset = DEFAULT_HORIZONTAL_OFFSET,
        bankingOffset = DEFAULT_BANKING_OFFSET
    ) {
        this.duration = duration;
        this.dropDepth = dropDepth;
        this.horizontalOffset = horizontalOffset;
        this.bankingOffset = bankingOffset;

        this.timers = new Array(planeCount).fill(0);
        this.running = new Array(planeCount).fill(false);
        this.offsetsX = new Array(planeCount).fill(0);
        this.offsetsY = new Array(planeCount).fill(0);
        this.offsetsZ = new Array(planeCount).fill(0);
        this.offsetsBanking = new Array(planeCount).fill(0);
        this.randomX = new Array(planeCount).fill(0);
        this.randomY = new Array(planeCount).fill(0);
        this.randomBanking = new Array(planeCount).fill(0);
    }

    /** Starts the tap animation for the plane with the given draw order index. Does nothing while it is already running. */
    tap(index: number): void {
        if (index < 0 || index >= this.timers.length || this.running[index]) {
            return;
        }

        this.timers[index] = 0;
        this.running[index] = true;
        this.randomX[index] = (Math.random() * 2 - 1) * this.horizontalOffset;
        this.randomY[index] = (Math.random() * 2 - 1) * this.horizontalOffset;

        // Random direction, with a visible amount of roll.
        const bankingDirection = Math.random() > 0.5 ? 1 : -1;
        this.randomBanking[index] = bankingDirection * (0.5 + Math.random() * 0.5) * this.bankingOffset;
    }

    /** Advances all running animations by the given number of milliseconds. */
    update(deltaMs: number): void {
        for (let i = 0; i < this.timers.length; i++) {
            if (!this.running[i]) {
                continue;
            }

            this.timers[i] += deltaMs / this.duration;
            if (this.timers[i] >= 1) {
                this.timers[i] = 0;
                this.running[i] = false;
                this.offsetsX[i] = 0;
                this.offsetsY[i] = 0;
                this.offsetsZ[i] = 0;
                this.offsetsBanking[i] = 0;
                continue;
            }

            const t = this.timers[i];

            // Fast drop, small wobble, slow return to the original height.
            this.offsetsZ[i] = easeTapZ(t) * this.dropDepth;

            // Smooth in-out displacement and roll to the random position and back.
            const horizontalProgress = t < 0.5 ? t * 2 : (1 - t) * 2;
            const horizontalEase = easeInOutSine(horizontalProgress);
            this.offsetsX[i] = this.randomX[i] * horizontalEase;
            this.offsetsY[i] = this.randomY[i] * horizontalEase;
            this.offsetsBanking[i] = this.randomBanking[i] * horizontalEase;
        }
    }

    getOffsetX(index: number): number {
        return this.offsetsX[index] ?? 0;
    }

    getOffsetY(index: number): number {
        return this.offsetsY[index] ?? 0;
    }

    getOffsetZ(index: number): number {
        return this.offsetsZ[index] ?? 0;
    }

    getBankingOffset(index: number): number {
        return this.offsetsBanking[index] ?? 0;
    }
}
