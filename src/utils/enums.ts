export function numericEnumMapping(enum_: Record<string, string | number>) {
    const mapping: Record<string, number> = {};
    for (const value of Object.values(enum_).filter(
        (v) => typeof v === "number",
    ))
        mapping[enum_[value]] = value as number;
    return mapping;
}
