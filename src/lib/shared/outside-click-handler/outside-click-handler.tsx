import { observer } from "mobx-react-lite";
import {
    CSSProperties,
    HTMLAttributes,
    PropsWithChildren,
    useEffect,
} from "react";

import { OutsideClickHandlerState } from "./state";

interface OutsideClickHandlerSettings extends HTMLAttributes<HTMLDivElement> {
    state: OutsideClickHandlerState;
    display: string;
}

function renderOutsideClickHandler({
    state,
    display,
    children,
    style,
    ...rest
}: PropsWithChildren<OutsideClickHandlerSettings>) {
    useEffect(() => {
        if (state.disabled) state.removeEventListeners();
        else state.addMouseDownEventListener(state.capture);
        return () => state.removeEventListeners();
    }, [state.disabled]);

    const _style = { ...style } as CSSProperties;
    if (display !== "block") _style.display = display;
    else delete _style.display;

    return (
        <div ref={state.node} style={_style} {...rest}>
            {children}
        </div>
    );
}

export const OutsideClickHandler = observer(renderOutsideClickHandler);
