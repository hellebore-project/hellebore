export type HookFunction = () => void;

export interface Hook {
    name: string;
    componentKey: string;
    call: HookFunction;
}

export interface Hookable {
    hooks(): Generator<Hook>;
}
