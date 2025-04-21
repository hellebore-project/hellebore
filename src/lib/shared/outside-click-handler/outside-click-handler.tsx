import "./outside-click-handler.css";

import { observer } from "mobx-react-lite";
import { HTMLAttributes, PropsWithChildren, useEffect } from "react";

import { OutsideClickHandlerService } from "./outside-click-handler-service";

interface OutsideClickHandlerSettings extends HTMLAttributes<HTMLDivElement> {
    service: OutsideClickHandlerService;
}

function renderOutsideClickHandler({
    service,
    children,
    className = "",
    style,
    ...rest
}: PropsWithChildren<OutsideClickHandlerSettings>) {
    useEffect(() => {
        if (service.enabled) {
            service.addMouseDownEventListener(service.capture);
            return () => service.removeEventListeners();
        } else {
            service.removeEventListeners();
        }
    }, [service.enabled]);

    if (style && style.display == "block") {
        const { display, ...styleRest } = style;
        style = styleRest;
    }

    return (
        <div
            className={`outside-click-handler ${className}`}
            ref={service.node}
            style={style}
            {...rest}
        >
            {children}
        </div>
    );
}

export const OutsideClickHandler = observer(renderOutsideClickHandler);
