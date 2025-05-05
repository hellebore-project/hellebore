export function numericEnumMapping(enum_: { [key: string]: string | number }) {
    const mapping: { [key: string]: number } = {};
    for (const value of Object.values(enum_).filter(
        (v) => typeof v === "number",
    ))
        mapping[enum_[value]] = value as number;
    return mapping;
}
