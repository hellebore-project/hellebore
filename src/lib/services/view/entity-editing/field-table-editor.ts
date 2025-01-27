import { makeAutoObservable, toJS } from "mobx";

import {
    BaseEntity,
    EntityType,
    FieldData,
    FieldType,
    PersonData,
    PersonProperty,
} from "@/interface";
import { ArticleInfoEditor } from "./info-editor";

type FieldDataCollection = { [type: number]: FieldData[] };
type ChangeHandler = () => void;

interface ArticleFieldTableServiceSettings {
    info: ArticleInfoEditor;
    onChange: ChangeHandler;
}

export class ArticleFieldTableEditor {
    fields: FieldDataCollection;
    entity: BaseEntity | null = null;
    changed: boolean = false;

    info: ArticleInfoEditor;

    onChange: ChangeHandler;

    constructor({ info, onChange }: ArticleFieldTableServiceSettings) {
        makeAutoObservable(this, {
            fields: false,
            onChange: false,
            info: false,
        });
        this.info = info;
        this.onChange = onChange;
        this.fields = this._generateFieldData();
    }

    get entityData() {
        return toJS(this.entity);
    }

    set entityData(entity: BaseEntity | null) {
        this.entity = entity;
    }

    setProperty(key: string, value: any) {
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
        this.entityData = entity;
    }

    sync() {
        this.changed = false;
    }

    reset() {
        this.entityData = null;
    }

    _generateFieldData(): FieldDataCollection {
        return {
            [EntityType.PERSON]: this._generatePersonFieldData(),
        };
    }

    /* Person */

    _setPersonProperty(key: string, value: any) {
        if (key == PersonProperty.NAME) (<PersonData>this.entity).name = value;
        else throw `Unable to set property ${key} for a Person entity.`;
    }

    _generatePersonFieldData(): FieldData[] {
        return [
            {
                property: PersonProperty.NAME,
                label: "Full Name",
                type: FieldType.TEXT,
                getValue: () => (<PersonData>this.entity).name,
                setValue: (name: string) =>
                    this.setProperty(PersonProperty.NAME, name),
            },
        ];
    }
}
