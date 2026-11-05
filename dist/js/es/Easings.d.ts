/**
 * Easing functions.
 *
 * All functions take progress in the 0..1 range and return eased progress,
 * usually also in the 0..1 range. `easeTapZ` is the exception: it returns a
 * signed displacement.
 */
export declare function easeInQuad(t: number): number;
export declare function easeOutQuad(t: number): number;
export declare function easeInOutQuad(t: number): number;
export declare function easeInCubic(t: number): number;
export declare function easeOutCubic(t: number): number;
export declare function easeInOutCubic(t: number): number;
export declare function easeInOutSine(t: number): number;
/**
 * Vertical displacement for a tapped plane: a fast drop to -1, a small wobble
 * above the original position and a slow settle back to 0.
 *
 * Values are in approximately [-1, 0.13] and both ends are 0.
 */
export declare function easeTapZ(t: number): number;
