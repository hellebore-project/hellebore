import { getService } from "@/client";
import { Tooltip, TooltipProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

export type ToolTipSettings = TooltipProps;

function renderToolTip({ children, ...rest }: ToolTipSettings) {
    const service = getService();
    return (
        <Tooltip
            color="gray"
            position="bottom"
            withArrow
            openDelay={500}
            portalProps={{ target: service.sharedPortalSelector }}
            {...rest}
        >
            {children}
        </Tooltip>
    );
}

export const ToolTipWrapper = observer(renderToolTip);
