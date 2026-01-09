import { makeAutoObservable } from "mobx";
import { createRef, RefObject, useEffect } from "react";

import { OutsideEventHandlerService } from "@/components/outside-event-handler";
import { EventProducer } from "@/utils/event-producer";

import {
    SpreadsheetColumnData,
    SpreadsheetFieldType,
} from "./spreadsheet.interface";

type PrivateKeys = "_sheetRef";

export class SpreadsheetReferenceService<K extends string, M> {
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

    constructor() {
        this._sheetRef = createRef();
        this.editableCellRef = null;

        this.outsideEvent = new OutsideEventHandlerService({
            enabled: true,
            ref: this._sheetRef,
        });
        this.fetchEditableColumn = new EventProducer();

        makeAutoObservable<SpreadsheetReferenceService<K, M>, PrivateKeys>(
            this,
            {
                // NOTE: making the sheet reference observable prevents
                // it from getting set by outside-event handler
                _sheetRef: false,
                outsideEvent: false,
                fetchEditableColumn: false,
            },
        );
    }

    get sheetRef() {
        return this._sheetRef;
    }

    // HOOKS

    hook() {
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

        this.outsideEvent.hook();
    }
}
