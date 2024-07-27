import { ViewKey } from "../../constants";

export interface HeaderArgs {
    burgerOpen: boolean;
    burgerToggle: () => void;
}

export interface ContentPaneArgs {
    viewKey: ViewKey;
    setView: (viewKey: ViewKey) => void;
}

export interface BaseViewArgs {
    setView: (viewKey: ViewKey) => void;
}

export interface HomeArgs extends BaseViewArgs {}
