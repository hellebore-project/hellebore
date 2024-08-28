import { makeAutoObservable, toJS } from "mobx";

import {
    BaseEntity,
    EntityType,
    FieldData,
    FieldType,
    IdentifiedPerson,
} from "../../interface";

type FieldDataCollection = { [type: number]: FieldData[] };
type ChangeHandler = () => void;

interface ArticleFieldTableServiceSettings {
    onChange: ChangeHandler;
}

export class ArticleFieldTableService {
    fieldData: FieldDataCollection;
    entity: BaseEntity | null = null;
    changed: boolean = false;

    onChange: ChangeHandler;

    constructor({ onChange }: ArticleFieldTableServiceSettings) {
        makeAutoObservable(this, { fieldData: false, onChange: false });
        this.onChange = onChange;
        this.fieldData = this.generateFieldData();
    }

    get entityData() {
        return toJS(this.entity);
    }

    set entityData(entity: BaseEntity | null) {
        this.entity = entity;
    }

    typedEntity<E extends BaseEntity>(): E {
        return this.entity as E;
    }

    generateFieldData(): FieldDataCollection {
        const collection = {
            [EntityType.PERSON]: this.generatePersonFieldData(),
        };

        for (let array of Object.values(collection)) {
            for (let fieldData of array) {
                if (fieldData.hasOwnProperty("setValue")) {
                    const _setValue = fieldData.setValue;
                    fieldData.setValue = (value: any) => {
                        _setValue?.(value);
                        this.changed = true;
                        this.onChange();
                    };
                }
            }
        }

        return collection;
    }

    generatePersonFieldData(): FieldData[] {
        return [
            {
                key: "name",
                label: "Full Name",
                type: FieldType.TEXT,
                getValue: () => (<IdentifiedPerson>this.entity).data.name,
                setValue: (name: string) =>
                    ((<IdentifiedPerson>this.entity).data.name = name),
            },
        ];
    }
}

export default ArticleFieldTableService;
