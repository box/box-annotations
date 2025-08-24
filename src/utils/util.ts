export function checkValue(value: number): boolean {
    return value >= 0 && value <= 100; // Values cannot be negative or larger than 100%
}


export function getVideoCurrentTimeInMilliseconds(video: HTMLVideoElement): number {
    return (video?.currentTime ?? 0) * 1000;
}