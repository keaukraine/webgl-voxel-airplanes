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
export declare function findLinePlaneIntersectionCoords(px: number, py: number, pz: number, qx: number, qy: number, qz: number, a: number, b: number, c: number, d: number, result: vec3): vec3 | null;
/**
 * Shortest distance from the point `p` to the infinite line through `a` and `b`.
 */
export declare function distancePointToLine(px: number, py: number, pz: number, ax: number, ay: number, az: number, bx: number, by: number, bz: number): number;
