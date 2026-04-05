import { EntryType, PersonProperty, PropertyFieldType } from "@/constants";
import type {
    BaseEntity,
    PropertyFieldData,
    TextPropertyFieldData,
    ChangeEntryEvent,
} from "@/interface";
import { MultiEventProducer } from "@/utils/event-producer";

import type { EntryInfoService } from "../entry-info-service.svelte";
import { PropertyTableService } from "./property-table";

interface PropertyEditorServiceArgs {
    info: EntryInfoService;
}

export class PropertyEditorService {
    // STATE VARIABLES
    private _entity: BaseEntity | null = $state(null);
    private _fieldData: PropertyFieldData[] = $state([]);
    private _changed = $state(false);

    // SERVICES
    info: EntryInfoService;
    table: PropertyTableService;

    // EVENTS
    onChange: MultiEventProducer<ChangeEntryEvent, unknown>;

    constructor({ info }: PropertyEditorServiceArgs) {
        this.info = info;
        this.table = new PropertyTableService();
        this.onChange = new MultiEventProducer();
    }

    get key() {
        return `property-editor-${this.info.entryId}`;
    }

    get entity(): BaseEntity | null {
        return this._entity;
    }

    set entity(entity: BaseEntity | null) {
        this._entity = entity;
    }

    get fieldData(): PropertyFieldData[] {
        return this._fieldData;
    }

    get changed(): boolean {
        return this._changed;
    }

    set changed(changed: boolean) {
        this._changed = changed;
    }

    get tableService(): PropertyTableService {
        return this.table;
    }

    load<E extends BaseEntity>(entity: E) {
        this._entity = entity;
        this._fieldData = this._generateFieldData(entity);
        this.table.rows = this._fieldData;
    }

    private _generateFieldData(entity: BaseEntity): PropertyFieldData[] {
        const entityType = this.info.entryType as EntryType;
        switch (entityType) {
            case EntryType.Person:
                return this._generatePersonFieldData(entity);
        }
        return [];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getProperty(key: string): any {
        if (this._entity === null) {
            console.error(`Accessed property ${key} of a nonexistent entity.`);
            return null;
        }
        if (!Object.hasOwn(this._entity, key)) {
            console.error(
                `Accessed nonexistent property ${key} of entry ${this.info.entryId}.`,
            );
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return (this._entity as any)[key];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setProperty(key: string, value: any) {
        try {
            if (this.info.entryType === EntryType.Person) {
                this._setPersonProperty(key, value);
            } else {
                console.error(
                    `Unable to set property ${key} for an entity of type ${this.info.entryType}.`,
                );
                return;
            }
        } catch (error) {
            console.error(error);
            return;
        }

        this._changed = true;
        this.onChange.produce({ id: this.info.entryId });
    }

    private _generatePersonFieldData(
        entity: BaseEntity,
    ): TextPropertyFieldData[] {
        return [
            {
                property: PersonProperty.NAME,
                label: "Full Name",
                type: PropertyFieldType.Text,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                getValue: () => (entity as any).name,
                setValue: (name: string) =>
                    this.setProperty(PersonProperty.NAME, name),
            },
        ];
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private _setPersonProperty(key: string, value: any) {
        if (this._entity === null) return;
        if (key === PersonProperty.NAME) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (this._entity as any).name = value;
        } else {
            throw `Unable to set property ${key} for a Person entity.`;
        }
    }
}
