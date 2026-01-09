import "./outside-event-handler.css";

import { observer } from "mobx-react-lite";
import { HTMLAttributes, PropsWithChildren } from "react";

import { OutsideEventHandlerService } from "./outside-event-handler.service";

interface OutsideEventHandlerProps extends HTMLAttributes<HTMLDivElement> {
    service: OutsideEventHandlerService;
}

function renderOutsideEventHandler({
    service,
    children,
    className = "",
    style,
    ...rest
}: PropsWithChildren<OutsideEventHandlerProps>) {
    if (style && style.display == "block") delete style.display;

    return (
        <div
            className={`outside-event-handler ${className}`}
            ref={service.ref}
            style={style}
            {...rest}
        >
            {children}
        </div>
    );
}

export const OutsideEventHandler = observer(renderOutsideEventHandler);
