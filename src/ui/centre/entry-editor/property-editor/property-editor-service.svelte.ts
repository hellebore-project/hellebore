import { EntryType } from "@/constants";
import type {
    BaseEntity,
    ChangeEntryEvent,
    IComponentService,
    LanguageProperties,
    PersonProperties,
    PropertyFieldData,
} from "@/interface";
import { MultiEventProducer } from "@/utils/event-producer";

import { Language, Person } from "@/models";
import type { EntryInfoService } from "../entry-info-service.svelte";
import { PropertyTableService } from "./property-table";

interface PropertyEditorServiceArgs {
    info: EntryInfoService;
}

export class PropertyEditorService implements IComponentService {
    // STATE VARIABLES
    private _entity: Person | Language | null = $state(null);
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

    get id() {
        return `property-editor-${this.info.entryId}`;
    }

    get entity(): BaseEntity | null {
        return this._entity;
    }

    get fieldData(): PropertyFieldData[] {
        return this.table.rows;
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

    load(properties: BaseEntity) {
        let entity: Person | Language;

        switch (this.info.entryType as EntryType) {
            case EntryType.Person:
                entity = new Person(properties as PersonProperties);
                break;
            case EntryType.Language:
                entity = new Language(properties as LanguageProperties);
                break;
            default:
                return;
        }

        entity.onChange.subscribe(() => {
            this._changed = true;
            this.onChange.produce({ id: this.info.entryId });
        });

        this._entity = entity;
        this.table.rows = entity.buildFieldData();
    }
}
