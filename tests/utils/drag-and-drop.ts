type DropEffect = "none" | "copy" | "link" | "move";
type AllowedEffect =
    | "none"
    | "copy"
    | "copyLink"
    | "copyMove"
    | "link"
    | "linkMove"
    | "move"
    | "all"
    | "uninitialized";
type DragAndDropEvent = Event & {
    dataTransfer: DataTransfer;
};

export class DragAndDropFileList extends Array<File> implements FileList {
    private _files: File[] = [];

    constructor(files: File[]) {
        super();
        this._files = files;
    }

    get length(): number {
        return this._files.length;
    }

    item(index: number): File | null {
        return this._files[index] || null;
    }
}

export class DragAndDropDataTransfer implements DataTransfer {
    files: DragAndDropFileList;
    readonly items: DataTransferItemList = {} as DataTransferItemList;
    readonly types: readonly string[] = [];

    private _data: Map<string, string> = new Map<string, string>();
    dropEffect: DropEffect = "none";
    effectAllowed: AllowedEffect = "all";

    constructor(
        dropEffect: DropEffect = "none",
        effectAllowed: AllowedEffect = "all",
        files: File[] = [],
    ) {
        this.dropEffect = dropEffect;
        this.effectAllowed = effectAllowed;
        this.files = new DragAndDropFileList(files);
        this._data = new Map<string, string>();
    }

    getData(format: string): string {
        return this._data.get(format) ?? "";
    }

    setData(format: string, data: string): void {
        this._data.set(format, data);
    }

    clearData(format?: string): void {
        if (format) {
            this._data.delete(format);
        } else {
            this._data.clear();
        }
    }

    setDragImage(image: Element, x: number, y: number): void {
        // Not implemented
    }
}

export function dispatchDragEvent(
    target: HTMLElement,
    type: string,
    dataTransfer: DragAndDropDataTransfer | null = null,
) {
    const event = new Event(type, {
        bubbles: true,
        cancelable: true,
    }) as DragAndDropEvent;

    Object.defineProperty(event, "dataTransfer", {
        value: dataTransfer ?? new DragAndDropDataTransfer(),
    });

    target.dispatchEvent(event);
}
