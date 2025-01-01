import { observer } from "mobx-react-lite";
import { PropsWithChildren, useEffect } from "react";

import { OutsideClickHandlerState } from "./state";

interface OutsideClickHandlerSettings {
    state: OutsideClickHandlerState;
    display: string;
}

function renderOutsideClickHandler({
    state,
    display,
    children,
}: PropsWithChildren<OutsideClickHandlerSettings>) {
    useEffect(() => {
        if (state.disabled) state.removeEventListeners();
        else state.addMouseDownEventListener(state.capture);
        return () => state.removeEventListeners();
    }, [state.disabled]);

    return (
        <div
            ref={state.node}
            style={display !== "block" ? { display } : undefined}
        >
            {children}
        </div>
    );
}

export const OutsideClickHandler = observer(renderOutsideClickHandler);
