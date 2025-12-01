import { Box } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { DIVIDER, SPACE } from "@/shared/common";
import { TextField } from "@/shared/text-field";
import { HomeManager } from "@/client/services";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };

interface HomeSettings {
    service: HomeManager;
}

function renderHome({ service }: HomeSettings) {
    const clientManager = getService();
    if (!clientManager.domain.hasProject) return null;
    return (
        <Box className="home">
            <TextField
                variant="unstyled"
                mx="12"
                placeholder="Wiki"
                getValue={() => service.projectName}
                getError={() => {
                    if (service.projectName == "") return "Empty title";
                    return null;
                }}
                onChange={(event) =>
                    (service.projectName = event.currentTarget.value)
                }
                styles={TITLE_FIELD_STYLES}
            />
            {DIVIDER}
            {SPACE}
        </Box>
    );
}

export const Home = observer(renderHome);
