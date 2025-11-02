import { VerticalSelectionData } from "@/shared/vertical-selection";

export abstract class BaseContextMenu {
    menuData: VerticalSelectionData[];

    constructor(data: Partial<VerticalSelectionData>[]) {
        this.menuData = this._formatMenuData(data);
    }

    _formatMenuData(data: Partial<VerticalSelectionData>[]) {
        return data.map((d, i) => ({
            index: i,
            value: d.label,
            ...d,
        })) as VerticalSelectionData[];
    }
}
