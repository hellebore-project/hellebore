import { Group, Text } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { FooterManager } from "@/client/services";

interface FooterProps {
    service: FooterManager;
}

function renderFooter({ service }: FooterProps) {
    return (
        <Group pl={8} h={25}>
            <Text size="xs" lineClamp={1}>
                {service.text}
            </Text>
        </Group>
    );
}

export const Footer = observer(renderFooter);
