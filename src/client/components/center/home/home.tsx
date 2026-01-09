import { Box } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { DIVIDER, SPACE } from "@/components/common";
import { TextField } from "@/components/text-field";

import { HomeManager } from "./home.service";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };

interface HomeProps {
    service: HomeManager;
}

function renderHome({ service }: HomeProps) {
    if (!service.domain.hasProject) return null;
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
