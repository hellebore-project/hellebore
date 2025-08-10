import { createRef, RefObject } from "react";
import { addEventListener } from "consolidated-events";

type StateEventHandler = () => void;
type RemoveEventListener = () => void;

interface OutsideEventHandlerServiceArguments {
    onOutsideEvent: (e: Event) => void;
    node?: RefObject<HTMLDivElement>;
    capture?: boolean;
    enabled?: boolean;
}

export class OutsideEventHandlerService {
    node: RefObject<HTMLDivElement>;

    capture: boolean;
    enabled: boolean;

    onOutsideEvent: (e: Event) => void;
    onEnable: StateEventHandler | null = null;
    onDisable: StateEventHandler | null = null;
    removeMouseDown: RemoveEventListener | null = null;
    removeMouseUp: RemoveEventListener | null = null;

    constructor({
        onOutsideEvent,
        node,
        capture = true,
        enabled = true,
    }: OutsideEventHandlerServiceArguments) {
        this.node = node ?? createRef();
        this.onOutsideEvent = onOutsideEvent;
        this.capture = capture;
        this.enabled = enabled;
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
    }

    isDescendant(element: Node | undefined | null) {
        if (!this.node || !element) return false;
        return this.node.current?.contains(element);
    }

    // Use mousedown/mouseup to enforce that clicks remain outside the root's
    // descendant tree, even when dragged. This should also get triggered on
    // touch devices.

    onMouseDown(e: Event) {
        if (!this.isDescendant(e.target as Node)) {
            if (this.removeMouseUp) {
                this.removeMouseUp();
                this.removeMouseUp = null;
            }
            this.removeMouseUp = addEventListener(
                document,
                "mouseup",
                this.onMouseUp,
                { capture: this.capture },
            );
        }
    }

    onMouseUp(e: Event) {
        if (this.removeMouseUp) {
            this.removeMouseUp();
            this.removeMouseUp = null;
        }

        if (!this.isDescendant(e.target as Node)) {
            this.onOutsideEvent(e);
        }
    }

    addMouseDownEventListener(useCapture: boolean) {
        this.removeMouseDown = addEventListener(
            document,
            "mousedown",
            this.onMouseDown,
            { capture: useCapture },
        );
    }

    removeEventListeners() {
        if (this.removeMouseDown) this.removeMouseDown();
        if (this.removeMouseUp) this.removeMouseUp();
    }
}
