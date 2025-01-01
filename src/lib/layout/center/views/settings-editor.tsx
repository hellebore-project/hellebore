import { Container, Title } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { DIVIDER, SPACE } from "@/shared/common";

function renderSettingsEditor() {
    // TODO
    return (
        <div className="container">
            <Title order={1}>Settings</Title>

            {DIVIDER}
            {SPACE}

            <Container ml={0} pl={0} size="xs">
                <Title order={2}>Section...</Title>
            </Container>
        </div>
    );
}

export const SettingsEditor = observer(renderSettingsEditor);
