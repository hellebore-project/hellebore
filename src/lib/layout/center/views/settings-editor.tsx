import { Container, Divider, FileInput, Space, Title } from "@mantine/core";
import { observer } from "mobx-react-lite";

const SPACE = <Space h="lg" />;

function renderSettingsEditor() {
    return (
        <div className="container">
            <Title order={1}>Settings</Title>

            <Divider my="sm" />
            {SPACE}

            <Title order={2}>Data</Title>
            <Container ml={0} pl={0} size="xs">
                <FileInput label="File" placeholder="..." />
            </Container>
        </div>
    );
}

export const SettingsEditor = observer(renderSettingsEditor);
