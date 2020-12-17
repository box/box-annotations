export default function useMountId(callback?: (uuid: string) => void): string {
    if (callback) {
        callback('123');
    }

    return '123';
}
