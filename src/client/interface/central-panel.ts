import { Id } from "@/interface";

import { CentralViewType } from "../constants";
import { IViewManager } from "./view";

export interface CentralPanelInfo {
    type: CentralViewType;
    entry?: { id: Id };
}

export interface ICentralPanelContentService extends IViewManager {
    type: CentralViewType;
    details: CentralPanelInfo;
    activate(): void;
    cleanUp(): void;
}
