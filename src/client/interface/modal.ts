import { EventProducer } from "@/utils/event";

import { IViewManager } from "./view-manager";

export interface IModalContentManager extends IViewManager {
    TITLE: string;
    onClose: EventProducer<void, unknown>;
}
