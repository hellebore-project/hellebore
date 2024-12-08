import { Tooltip, TooltipProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

export interface ToolTipSettings extends TooltipProps {}

function renderToolTip({ children, ...rest }: ToolTipSettings) {
    return (
        <Tooltip
            color="gray"
            position="bottom"
            withArrow
            openDelay={500}
            {...rest}
        >
            {children}
        </Tooltip>
    );
}

export const ToolTipWrapper = observer(renderToolTip);
