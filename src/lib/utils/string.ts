export function compareStrings(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

export function pluralize(noun: string, suffix = "s") {
    return `${noun}${suffix}`;
}
