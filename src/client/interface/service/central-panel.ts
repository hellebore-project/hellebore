import { CentralViewType } from "@/client/constants";
import { Id } from "@/interface";

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
