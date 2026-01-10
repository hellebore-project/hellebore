import { IComponentService } from "@/interface";
import { MultiEventProducer } from "@/model";

export interface IModalContentManager extends IComponentService {
    title: string;
    onClose: MultiEventProducer<void, unknown>;
}
