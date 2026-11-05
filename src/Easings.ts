/**
 * Easing functions.
 *
 * All functions take progress in the 0..1 range and return eased progress,
 * usually also in the 0..1 range. `easeTapZ` is the exception: it returns a
 * signed displacement.
 */

export function easeInQuad(t: number): number {
    return t * t;
}

export function easeOutQuad(t: number): number {
    return t * (2 - t);
}

export function easeInOutQuad(t: number): number {
    return t < 0.5
        ? 2 * t * t
        : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function easeInCubic(t: number): number {
    return t * t * t;
}

export function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeInOutSine(t: number): number {
    return -(Math.cos(Math.PI * t) - 1) / 2;
}

/** Peak of the damped sine below, used to normalize its first dip to -1. */
const TAP_Z_PEAK = 0.715;

/**
 * Vertical displacement for a tapped plane: a fast drop to -1, a small wobble
 * above the original position and a slow settle back to 0.
 *
 * Values are in approximately [-1, 0.13] and both ends are 0.
 */
export function easeTapZ(t: number): number {
    const wave = -Math.sin(t * Math.PI * 3) * (1 - t) * (1 - t) / TAP_Z_PEAK;

    // Keep the overshoot above the original position subtle.
    return wave > 0 ? wave * 0.35 : wave;
}
