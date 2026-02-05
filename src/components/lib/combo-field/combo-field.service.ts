import { ComboboxStore, useCombobox } from "@mantine/core";
import { makeAutoObservable } from "mobx";

import { Hookable, IComponentService } from "@/interface";

type PrivateKeys = "_key";

export class ComboFieldService implements IComponentService, Hookable {
    private _key: string;

    _combobox: ComboboxStore | null = null;

    constructor(key: string) {
        this._key = key;
        makeAutoObservable<ComboFieldService, PrivateKeys>(this, {
            _key: false,
            hooks: false,
        });
    }

    get key() {
        return this._key;
    }

    get combobox() {
        return this._combobox;
    }

    set combobox(value: ComboboxStore | null) {
        this._combobox = value;
    }

    // HOOKS

    *hooks() {
        yield {
            name: "create-combobox-service",
            componentKey: this._key,
            call: this._createComboboxService.bind(this),
        };
    }

    private _createComboboxService() {
        const combobox = useCombobox({
            onDropdownClose: () => combobox.resetSelectedOption(),
        });
        this.combobox = combobox;
        return combobox;
    }
}
