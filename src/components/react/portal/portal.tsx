import { observer } from "mobx-react-lite";

import { PortalManager } from "./portal.service";

interface PortalContainerProps {
    service: PortalManager;
}

function renderPortalContainer({ service }: PortalContainerProps) {
    return <div id={service.id} />;
}

export const PortalContainer = observer(renderPortalContainer);
