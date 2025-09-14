import { ObservableReference } from "@/shared/observable-reference";

export class DOMReferenceManager {
    /*
        Central store of all observable references that are used in hooks.
        Since hooks need to be injected at the root of the application,
        any related references must be instantiated during app startup. 
    */

    // file navigator
    fileNavEditableText: ObservableReference<HTMLInputElement>;

    // word editor
    wordTableEditableCell: ObservableReference<HTMLInputElement>;

    constructor() {
        this.fileNavEditableText = new ObservableReference();
        this.wordTableEditableCell = new ObservableReference();
    }
}
