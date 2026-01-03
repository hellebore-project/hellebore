import { observer } from "mobx-react-lite";

import { PortalManager } from "@/client/services";

interface PortalContainerProps {
    service: PortalManager;
}

function renderPortalContainer({ service }: PortalContainerProps) {
    return <div id={service.id} />;
}

export const PortalContainer = observer(renderPortalContainer);
