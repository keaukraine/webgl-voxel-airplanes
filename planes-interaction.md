# Goal

Add touch interaction with planes.


## Implementation

Add this function to `MathUtils.ts` file:

This code is in Kotlin, port it to TS.
```
    /**
     * Intersection of the line through the points `p` and `q` with the plane `ax + by + cz + d = 0`.
     *
     * Writes the intersection into [result] and returns it, or returns `null` when the line runs
     * parallel to the plane, in which case [result] is left untouched. The intersection lies on
     * the segment between `p` and `q` when the line parameter `t` is within 0..1, otherwise it
     * lies on the extension of the segment.
     */
    fun findLinePlaneIntersectionCoords(
        px: Float, py: Float, pz: Float,
        qx: Float, qy: Float, qz: Float,
        a: Float, b: Float, c: Float, d: Float,
        result: Vec3
    ): Vec3? {
        // Denominator of the line parameter: zero when the line runs parallel to the plane.
        val tDenom = a * (qx - px) + b * (qy - py) + c * (qz - pz)
        if (tDenom == 0f) {
            return null
        }

        val t = -(a * px + b * py + c * pz + d) / tDenom

        result.x = px + t * (qx - px)
        result.y = py + t * (qy - py)
        result.z = pz + t * (qz - pz)
        return result
    }
```

Make a separate utils TS file with easings.

Detect taps only when `statePlane === PlaneState.NORMAL`.

Interactions:

1. Detect taps by checking intersections from camera position with horizontal plane at height z=0.
2. Measure distance to every plane. When it is within certain radius to plane, it is a hit.
3. Animate plane which has been tapped - move down and back to its position by applying offset and easing. Easing is fast down (-Z), then wobble a little then slower up to original position (+Z).
4. Also can apply small random X+Y offset which will use simpler easing - smooth in-out one.
5. Make a separate class which will have arrays of position offsets+timers for each plane (up to 4 planes).
