/* eslint-disable @typescript-eslint/no-explicit-any */

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
    ChangeEntryEvent,
} from "@/client";
import { EventProducer } from "@/utils/event";

import { EntryInfoService } from "./info-editor";

type PrivateKeys = "_changed";

interface PropertyEditorServiceArgs {
    info: EntryInfoService;
}

export class PropertyEditorService {
    private _entity: BaseEntity | null = null;
    private _fieldData: PropertyFieldData[];
    private _changed = false;

    info: EntryInfoService;

    onChange: EventProducer<ChangeEntryEvent, unknown>;

    constructor({ info }: PropertyEditorServiceArgs) {
        this._fieldData = [];

        this.info = info;

        this.onChange = new EventProducer();

        makeAutoObservable<PropertyEditorService, PrivateKeys>(this, {
            _changed: false,
            info: false,
            onChange: false,
        });
    }

    // PROPERTIES

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

    get fieldData(): PropertyFieldData[] {
        return this._fieldData;
    }

    // LOADING

    load<E extends BaseEntity>(entity: E) {
        this.data = entity;
        this._fieldData = this._generateFieldData();
    }

    _generateFieldData(): PropertyFieldData[] {
        const entityType = this.info.entityType as EntityType;
        switch (entityType) {
            case EntityType.PERSON:
                return this._generatePersonFieldData();
        }
        return [];
    }

    // ENTRY PROPERTY FETCHING

    getProperty(key: string): any {
        if (this._entity === null) {
            console.error(`Accessed property ${key} of a nonexistent entity.`);
            return null;
        }
        if (!Object.hasOwn(this._entity, key)) {
            console.error(
                `Accessed nonexistent property ${key} of entry ${this.info.id}.`,
            );
            return null;
        }

        return (this._entity as any)[key];
    }

    // ENTRY PROPERTY MUTATION

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

        this._changed = true;
        this.onChange.produce({ id: this.info.id });
    }

    _setProperty(key: string, value: any) {
        let isSet = true;

        switch (this.info.entityType) {
            case EntityType.PERSON:
                this._setPersonProperty(key, value);
                break;

            default:
                isSet = false;
        }

        if (!isSet)
            console.error(
                `Unable to set property ${key} for an entity of type ${this.info.entityType}.`,
            );
    }

    // PERSON

    _generatePersonFieldData(): TextPropertyFieldData[] {
        return [
            {
                property: PersonProperty.NAME,
                label: "Full Name",
                type: PropertyFieldType.TEXT,
                getValue: () => (this._entity as PersonProperties).name,
                setValue: (name: string) =>
                    this.setProperty(PersonProperty.NAME, name),
            },
        ];
    }

    _setPersonProperty(key: string, value: any) {
        if (key == PersonProperty.NAME)
            (this._entity as PersonProperties).name = value;
        else throw `Unable to set property ${key} for a Person entity.`;
    }
}
