import "./outside-event-handler.css";

import { observer } from "mobx-react-lite";
import { HTMLAttributes, PropsWithChildren, useEffect } from "react";

import { OutsideEventHandlerService } from "./outside-event-handler.service";

interface OutsideEventHandlerSettings extends HTMLAttributes<HTMLDivElement> {
    service: OutsideEventHandlerService;
}

function renderOutsideEventHandler({
    service,
    children,
    className = "",
    style,
    ...rest
}: PropsWithChildren<OutsideEventHandlerSettings>) {
    useEffect(() => {
        if (service.enabled) {
            service.addMouseDownEventListener(service.capture);
            return () => service.removeEventListeners();
        } else {
            service.removeEventListeners();
        }
    }, [service.enabled]);

    if (style && style.display == "block") delete style.display;

    return (
        <div
            className={`outside-event-handler ${className}`}
            ref={service.node}
            style={style}
            {...rest}
        >
            {children}
        </div>
    );
}

export const OutsideEventHandler = observer(renderOutsideEventHandler);
