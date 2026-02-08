import { MultiEventProducer } from "@/utils/event-producer";

import { IComponentService } from "./component";

export interface IModalContentManager extends IComponentService {
    title: string;
    onClose: MultiEventProducer<void, unknown>;
}
