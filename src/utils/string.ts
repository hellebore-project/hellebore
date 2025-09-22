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
    str = str.replace("_", " ");
    let titleCase = "";
    for (const word of str.split(" ")) {
        if (word == "") continue;
        const capital = word.substring(0, 1).toUpperCase();
        titleCase += capital + word.substring(1);
    }
    return titleCase;
}
