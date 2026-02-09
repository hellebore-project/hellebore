import { CentralViewType } from "@/constants";

import type { Id } from "../../common";
import type { IComponentService } from "./component";

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
