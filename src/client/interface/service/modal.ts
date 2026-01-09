import { IComponentService } from "@/interface";
import { MultiEventProducer } from "@/utils/event-producer";

export interface IModalContentManager extends IComponentService {
    title: string;
    onClose: MultiEventProducer<void, unknown>;
}
