import type { PropertyFieldData } from "@/interface";

export class PropertyTableService {
    private _rows: PropertyFieldData[] = $state([]);

    constructor(rows?: PropertyFieldData[]) {
        this._rows = rows ?? [];
    }

    get rows(): PropertyFieldData[] {
        return this._rows;
    }

    set rows(rows: PropertyFieldData[]) {
        this._rows = rows;
    }
}
