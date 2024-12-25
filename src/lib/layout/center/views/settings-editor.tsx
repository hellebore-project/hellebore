import { Container, Divider, Space, Title } from "@mantine/core";
import { observer } from "mobx-react-lite";

const SPACE = <Space h="lg" />;

function renderSettingsEditor() {
    // TODO
    return (
        <div className="container">
            <Title order={1}>Settings</Title>

            <Divider my="sm" />
            {SPACE}

            <Container ml={0} pl={0} size="xs">
                <Title order={2}>Section...</Title>
            </Container>
        </div>
    );
}

export const SettingsEditor = observer(renderSettingsEditor);
