import { VerticalSelectionData } from "@/shared/vertical-selection";

export abstract class BaseContextMenu {
    itemData: VerticalSelectionData[];

    constructor() {
        this.itemData = this._formatMenuData(this._generateMenuData());
    }

    private _formatMenuData(data: Partial<VerticalSelectionData>[]) {
        return data.map((d, i) => ({
            index: i,
            value: d.label,
            ...d,
        })) as VerticalSelectionData[];
    }

    protected abstract _generateMenuData(): Partial<VerticalSelectionData>[];
}
