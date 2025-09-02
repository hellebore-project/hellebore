import { makeAutoObservable, toJS } from "mobx";

import { EntityType, FieldType, PersonProperty } from "@/constants";
import {
    BaseEntity,
    EntityChangeHandler,
    FieldData,
    PersonProperties,
} from "@/interface";
import { EntityInfoEditor } from "./info-editor";

type FieldDataCollection = { [type: number]: FieldData[] };

interface PropertyEditorSettings {
    info: EntityInfoEditor;
    onChange: EntityChangeHandler;
}

export class PropertyEditor {
    private _entity: BaseEntity | null = null;

    fields: FieldDataCollection;
    changed: boolean = false;

    info: EntityInfoEditor;

    onChange: EntityChangeHandler;

    constructor({ info, onChange }: PropertyEditorSettings) {
        makeAutoObservable(this, {
            fields: false,
            onChange: false,
            info: false,
        });
        this.info = info;
        this.onChange = onChange;
        this.fields = this._generateFieldData();
    }

    get data() {
        return toJS(this._entity);
    }

    set data(entity: BaseEntity | null) {
        this._entity = entity;
    }

    set(key: string, value: any) {
        try {
            if (this.info.entityType == EntityType.PERSON)
                this._setPersonProperty(key, value);
            else {
                console.error(
                    `Unable to set property ${key} for an entity of type ${this.info.entityType}.`,
                );
                return;
            }
        } catch (error) {
            console.error(error);
            return;
        }
        this.changed = true;
        this.onChange();
    }

    initialize<E extends BaseEntity>(entity: E) {
        this.data = entity;
    }

    afterSync() {
        this.changed = false;
    }

    reset() {
        this.data = null;
    }

    _generateFieldData(): FieldDataCollection {
        return {
            [EntityType.PERSON]: this._generatePersonFieldData(),
        };
    }

    /* Person */

    _setPersonProperty(key: string, value: any) {
        if (key == PersonProperty.NAME)
            (<PersonProperties>this._entity).name = value;
        else throw `Unable to set property ${key} for a Person entity.`;
    }

    _generatePersonFieldData(): FieldData[] {
        return [
            {
                property: PersonProperty.NAME,
                label: "Full Name",
                type: FieldType.TEXT,
                getValue: () => (<PersonProperties>this._entity).name,
                setValue: (name: string) => this.set(PersonProperty.NAME, name),
            },
        ];
    }
}
