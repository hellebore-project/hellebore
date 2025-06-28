import { Group, Text } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";

function renderFooter() {
    const service = getService();
    return (
        <Group pl={8} h={25}>
            <Text size="xs" lineClamp={1}>
                {service.domain.projectName ?? ""}
            </Text>
        </Group>
    );
}

export const Footer = observer(renderFooter);
