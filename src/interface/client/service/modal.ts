import { MultiEventProducer } from "@/model";

import { IComponentService } from "./component";

export interface IModalContentManager extends IComponentService {
    title: string;
    onClose: MultiEventProducer<void, unknown>;
}
