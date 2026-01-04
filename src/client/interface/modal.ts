import { MultiEventProducer } from "@/utils/event-producer";

import { IViewManager } from "./view";

export interface IModalContentManager extends IViewManager {
    TITLE: string;
    onClose: MultiEventProducer<void, unknown>;
}
