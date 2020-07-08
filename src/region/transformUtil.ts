export type Point = {
    x: number;
    y: number;
};

export const invertYCoordinate = ({ x, y }: Point, height: number): Point => ({
    x,
    y: height > 0 ? height - y : y,
});

export const rotatePoint = ({ x, y }: Point, rotationInDegrees: number): Point => {
    const radians = (rotationInDegrees * Math.PI) / 180;
    const cosine = Math.cos(radians);
    const sine = Math.sin(radians);

    // Formula to apply a rotation to a point is:
    // x' = x * cos(θ) - y * sin(θ)
    // y' = x * sin(θ) + y * cos(θ)
    return {
        x: x * cosine - y * sine,
        y: x * sine + y * cosine,
    };
};

export const translatePoint = ({ x, y }: Point, { dx = 0, dy = 0 }: { dx?: number; dy?: number }): Point => ({
    x: x + dx,
    y: y + dy,
});
