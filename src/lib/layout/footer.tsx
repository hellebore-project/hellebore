import { Grid, Text } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";

const COLUMN_STYLE = { display: "flex", alignItems: "center" };

function renderFooter() {
    const service = getService();
    return (
        <Grid justify="flex-start" align="center" gutter={{ base: 0 }}>
            <Grid.Col span={1} pl={8} h={25} style={COLUMN_STYLE}>
                <Text size="xs">{service.view.home.projectName}</Text>
            </Grid.Col>
        </Grid>
    );
}

export const Footer = observer(renderFooter);
