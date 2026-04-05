import { PersonProperty, PropertyFieldType } from "@/constants";
import type { PersonProperties } from "@/interface";
import type {
    PropertyChangeEvent,
    PropertyFieldData,
    TextPropertyFieldData,
} from "@/interface";
import { EventProducer } from "@/utils/event-producer";

export class Person implements PersonProperties {
    private _name: string = $state("");

    onChange: EventProducer<PropertyChangeEvent, void>;

    constructor(properties: PersonProperties) {
        this._name = properties.name;
        this.onChange = new EventProducer();
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
        this.onChange.produce({ property: PersonProperty.NAME, value });
    }

    toJSON(): PersonProperties {
        return { name: this._name };
    }

    buildFieldData(): PropertyFieldData[] {
        const fields: TextPropertyFieldData[] = [
            {
                property: PersonProperty.NAME,
                label: "Full Name",
                type: PropertyFieldType.Text,
                getValue: () => this._name,
                setValue: (value: string) => {
                    this.name = value;
                },
            },
        ];
        return fields;
    }
}
