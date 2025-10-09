import { makeAutoObservable, toJS } from "mobx";

import {
    BaseEntity,
    EntityType,
    PersonProperties,
    PersonProperty,
} from "@/domain";
import {
    PropertyFieldType,
    PropertyFieldData,
    TextPropertyFieldData,
} from "@/client";
import { Id } from "@/interface";
import { EventProducer } from "@/utils/event";

import { EntryInfoEditor } from "./info-editor";

type PrivateKeys = "_changed" | "_info";

type FieldDataCollection = Record<number, PropertyFieldData[]>;

interface PropertyEditorSettings {
    info: EntryInfoEditor;
}

export class PropertyEditor {
    private _entity: BaseEntity | null = null;
    fields: FieldDataCollection;
    private _changed = false;

    private _info: EntryInfoEditor;

    onChange: EventProducer<Id, void>;

    constructor({ info }: PropertyEditorSettings) {
        this.fields = this._generateFieldData();

        this._info = info;

        this.onChange = new EventProducer();

        makeAutoObservable<PropertyEditor, PrivateKeys>(this, {
            fields: false,
            _changed: false,
            _info: false,
            onChange: false,
        });
    }

    get data() {
        return toJS(this._entity);
    }

    set data(entity: BaseEntity | null) {
        this._entity = entity;
    }

    get changed() {
        return this._changed;
    }

    set changed(changed: boolean) {
        this._changed = changed;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    set(key: string, value: any) {
        try {
            if (this._info.entityType == EntityType.PERSON)
                this._setPersonProperty(key, value);
            else {
                console.error(
                    `Unable to set property ${key} for an entity of type ${this._info.entityType}.`,
                );
                return;
            }
        } catch (error) {
            console.error(error);
            return;
        }
        this._changed = true;
        this.onChange.produce(this._info.id);
    }

    initialize<E extends BaseEntity>(entity: E) {
        this.data = entity;
    }

    reset() {
        this.data = null;
        this._changed = false;
    }

    _generateFieldData(): FieldDataCollection {
        return {
            [EntityType.PERSON]: this._generatePersonFieldData(),
        };
    }

    /* Person */

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _setPersonProperty(key: string, value: any) {
        if (key == PersonProperty.NAME)
            (this._entity as PersonProperties).name = value;
        else throw `Unable to set property ${key} for a Person entity.`;
    }

    _generatePersonFieldData(): TextPropertyFieldData[] {
        return [
            {
                property: PersonProperty.NAME,
                label: "Full Name",
                type: PropertyFieldType.TEXT,
                getValue: () => (this._entity as PersonProperties).name,
                setValue: (name: string) => this.set(PersonProperty.NAME, name),
            },
        ];
    }
}
