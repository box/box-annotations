export function checkValue(value: number): boolean {
    return value >= 0 && value <= 100; // Values cannot be negative or larger than 100%
}
