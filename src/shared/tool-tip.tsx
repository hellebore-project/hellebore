import { Tooltip, TooltipProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

function renderToolTip({ children, ...rest }: TooltipProps) {
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
