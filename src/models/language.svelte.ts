import type { LanguageProperties } from "@/interface";
import type { PropertyChangeEvent, PropertyFieldData } from "@/interface";
import { EventProducer } from "@/utils/event-producer";

export class Language implements LanguageProperties {
    onChange: EventProducer<PropertyChangeEvent, void>;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(properties: LanguageProperties) {
        this.onChange = new EventProducer();
    }

    toJSON(): LanguageProperties {
        return {};
    }

    buildFieldData(): PropertyFieldData[] {
        return [];
    }
}
