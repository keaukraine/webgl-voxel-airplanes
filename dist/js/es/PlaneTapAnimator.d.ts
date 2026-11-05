/**
 * Animated tap offsets for a fixed number of planes.
 *
 * Offsets and timers are stored in parallel arrays indexed by the plane's draw
 * order. Each tap starts an independent animation for the tapped plane; the
 * renderer reads the current offsets right before drawing that plane.
 */
export declare class PlaneTapAnimator {
    private readonly duration;
    private readonly dropDepth;
    private readonly horizontalOffset;
    private readonly bankingOffset;
    /** Animation progress in the 0..1 range, per plane. */
    private readonly timers;
    /** Whether an animation is running, per plane. */
    private readonly running;
    /** Current offsets added to the plane position, per plane. */
    private readonly offsetsX;
    private readonly offsetsY;
    private readonly offsetsZ;
    /** Current random roll added to the plane banking, per plane. */
    private readonly offsetsBanking;
    /** Random horizontal displacement and banking of the current animation, per plane. */
    private readonly randomX;
    private readonly randomY;
    private readonly randomBanking;
    constructor(planeCount?: number, duration?: number, dropDepth?: number, horizontalOffset?: number, bankingOffset?: number);
    /** Starts the tap animation for the plane with the given draw order index. Does nothing while it is already running. */
    tap(index: number): void;
    /** Advances all running animations by the given number of milliseconds. */
    update(deltaMs: number): void;
    getOffsetX(index: number): number;
    getOffsetY(index: number): number;
    getOffsetZ(index: number): number;
    getBankingOffset(index: number): number;
}
