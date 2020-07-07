export type Point = {
    x: number;
    y: number;
};

export const invertYCoordinate = ({ x, y }: Point, height: number): Point => ({
    x,
    y: height > 0 ? height - y : y,
});

export const rotatePoint = ({ x, y }: Point, rotationInDegrees: number): Point => {
    const { cos, sin } = Math;
    const angle = (rotationInDegrees * Math.PI) / 180;

    return {
        x: x * cos(angle) - y * sin(angle),
        y: x * sin(angle) + y * cos(angle),
    };
};

export const translatePoint = ({ x, y }: Point, { dx = 0, dy = 0 }: { dx?: number; dy?: number }): Point => ({
    x: x + dx,
    y: y + dy,
});
