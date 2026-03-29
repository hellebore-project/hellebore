import { CentralViewType, EntryType, EntryViewType } from "@/constants";

import type { Id } from "../../common";
import type { IComponentService } from "./component";

export interface CentralPanelEntryInfo {
    id: Id;
    type: EntryType | null;
}

export interface CentralPanelInfo {
    id: string;
    type: CentralViewType;
    entry?: CentralPanelEntryInfo;
}

export interface EntryEditorInfo extends CentralPanelInfo {
    subType: EntryViewType;
    entry: CentralPanelEntryInfo;
}

export interface ICentralPanelContentService extends IComponentService {
    type: CentralViewType;
    details: CentralPanelInfo;
    activate(): void;
    cleanUp(): void;
}
