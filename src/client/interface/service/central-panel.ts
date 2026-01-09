import { CentralViewType } from "@/client/constants";
import { IComponentService, Id } from "@/interface";

export interface CentralPanelInfo {
    type: CentralViewType;
    entry?: { id: Id };
}

export interface ICentralPanelContentService extends IComponentService {
    type: CentralViewType;
    details: CentralPanelInfo;
    activate(): void;
    cleanUp(): void;
}
