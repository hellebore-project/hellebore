import { MultiEventProducer } from "@/utils/event-producer";

import type { IComponentService } from "./component";

export interface IModalContentManager extends IComponentService {
    title: string;
    onClose: MultiEventProducer<void, unknown>;
}
