export function range(
    size: number,
    startAt: number = 0,
): ReadonlyArray<number> {
    return [...Array(size).keys()].map((i) => i + startAt);
}

export function pop<T>(set: Set<T>): T | null {
    for (const value of set) {
        set.delete(value);
        return value;
    }
    return null;
}
