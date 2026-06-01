import type { ModalType } from "@/constants";
import { MultiEventProducer } from "@/utils/event-producer";

import type { IComponentService } from "./component";

export interface IModalContentManager extends IComponentService {
    title: string;
    type: ModalType;
    onClose: MultiEventProducer<void, unknown>;
}
