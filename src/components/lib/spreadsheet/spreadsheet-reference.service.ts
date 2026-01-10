import { makeAutoObservable } from "mobx";
import { createRef, RefObject, useEffect } from "react";

import { OutsideEventHandlerService } from "@/components/lib/outside-event-handler";
import { Hookable, IComponentService } from "@/interface";
import { EventProducer } from "@/model";

import {
    SpreadsheetColumnData,
    SpreadsheetFieldType,
} from "./spreadsheet.interface";

type PrivateKeys = "_key" | "_sheetRef";

export class SpreadsheetReferenceService<K extends string, M>
    implements IComponentService, Hookable
{
    private _key: string;
    /**
     * Reference to the parent of the the table element.
     * Set at render-time by the outside-event handler.
     */
    private _sheetRef: RefObject<HTMLDivElement>;
    /**
     * Reference to the editable cell in the table.
     * Must be obserable for the useEffect hook to work correctly.
     */
    editableCellRef: RefObject<HTMLInputElement> | null;

    outsideEvent: OutsideEventHandlerService;
    fetchEditableColumn: EventProducer<void, SpreadsheetColumnData<K> | null>;

    constructor(key: string) {
        this._key = key;
        this._sheetRef = createRef();
        this.editableCellRef = null;

        this.outsideEvent = new OutsideEventHandlerService({
            key: `${this._key}-outside-event-handler`,
            enabled: true,
            ref: this._sheetRef,
        });
        this.fetchEditableColumn = new EventProducer();

        makeAutoObservable<SpreadsheetReferenceService<K, M>, PrivateKeys>(
            this,
            {
                _key: false,
                // NOTE: making the sheet reference observable prevents
                // it from getting set by outside-event handler
                _sheetRef: false,
                outsideEvent: false,
                fetchEditableColumn: false,
                hooks: false, // don't convert to a flow
            },
        );
    }

    get key() {
        return this._key;
    }

    get sheetRef() {
        return this._sheetRef;
    }

    // HOOKS

    *hooks() {
        yield {
            name: "focus-editable-cell",
            componentKey: this.key,
            call: this._focusEditableCellOnRender.bind(this),
        };
        yield* this.outsideEvent.hooks();
    }

    private _focusEditableCellOnRender() {
        const ref = this.editableCellRef;
        useEffect(() => {
            if (ref?.current) {
                if (document.activeElement === ref.current) return;

                // focus the cell field once it has been added to the DOM
                // so that the user can immediately start editing it
                ref.current.focus();

                const col = this.fetchEditableColumn.produce();
                if (col?.type === SpreadsheetFieldType.SELECT)
                    ref.current.click(); // expand the dropdown
            }
        }, [ref]);
    }
}
