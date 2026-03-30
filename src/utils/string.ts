export function setCharAt(str: string, index: number, char: string) {
    if (index > str.length - 1) return str;
    return str.substring(0, index) + char + str.substring(index + 1);
}

export function compareStrings(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

export function pluralize(noun: string, suffix = "s") {
    return `${noun}${suffix}`;
}

export function toTitleCase(str: string) {
    return str
        .split("_")
        .map(
            (word) =>
                word.charAt(0).toUpperCase() + word.slice(1).toLowerCase(),
        )
        .join(" ");
}
