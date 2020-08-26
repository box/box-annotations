import { Position } from '../@types';

export type Shape = {
    height: number;
    width: number;
    x: number;
    y: number;
};

export const centerShape = (shape: Shape): Position => {
    const { height, width } = shape;

    return {
        x: width / 2,
        y: height / 2,
    };
};

export function checkValue(value: number): boolean {
    return value >= 0 && value <= 100; // Values cannot be negative or larger than 100%
}
