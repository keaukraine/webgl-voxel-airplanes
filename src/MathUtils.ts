import { vec3 } from "gl-matrix";

/**
 * Intersection of the line through the points `p` and `q` with the plane
 * `ax + by + cz + d = 0`.
 *
 * Writes the intersection into `result` and returns it, or returns `null` when
 * the line runs parallel to the plane, in which case `result` is left untouched.
 * The intersection lies on the segment between `p` and `q` when the line
 * parameter `t` is within 0..1, otherwise it lies on the extension of the segment.
 */
export function findLinePlaneIntersectionCoords(
    px: number, py: number, pz: number,
    qx: number, qy: number, qz: number,
    a: number, b: number, c: number, d: number,
    result: vec3
): vec3 | null {
    // Denominator of the line parameter: zero when the line runs parallel to the plane.
    const tDenom = a * (qx - px) + b * (qy - py) + c * (qz - pz);
    if (tDenom === 0) {
        return null;
    }

    const t = -(a * px + b * py + c * pz + d) / tDenom;

    result[0] = px + t * (qx - px);
    result[1] = py + t * (qy - py);
    result[2] = pz + t * (qz - pz);
    return result;
}

/**
 * Shortest distance from the point `p` to the infinite line through `a` and `b`.
 */
export function distancePointToLine(
    px: number, py: number, pz: number,
    ax: number, ay: number, az: number,
    bx: number, by: number, bz: number
): number {
    const abx = bx - ax;
    const aby = by - ay;
    const abz = bz - az;
    const apx = px - ax;
    const apy = py - ay;
    const apz = pz - az;

    const abLength = Math.hypot(abx, aby, abz);
    if (abLength === 0) {
        return Math.hypot(apx, apy, apz);
    }

    // Distance is the length of the cross product divided by the line direction length.
    const crossX = apy * abz - apz * aby;
    const crossY = apz * abx - apx * abz;
    const crossZ = apx * aby - apy * abx;

    return Math.hypot(crossX, crossY, crossZ) / abLength;
}
