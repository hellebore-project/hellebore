import { Hookable } from "@/interface";
import { ComboFieldService } from "@/components/lib/combo-field";

export class EntryCreatorReferenceService implements Hookable {
    readonly key = "entry-creator-reference";
    entryTypeSelect: ComboFieldService;

    constructor() {
        this.entryTypeSelect = new ComboFieldService(
            `${this.key}-entry-type-select`,
        );
    }

    *hooks() {
        yield* this.entryTypeSelect.hooks();
    }
}
