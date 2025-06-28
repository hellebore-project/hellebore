import { Container, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { SPACE } from "src/shared/common";
import { TitleField } from "../title-field";
import { PropertyTable } from "./property-table";

function renderPropertyEditor() {
    return (
        <Container className="property-editor">
            <Stack
                className="property-editor-stack"
                justify="flex-start"
                gap={0}
            >
                <TitleField />
                {SPACE}
                <PropertyTable />
            </Stack>
        </Container>
    );
}

export const PropertyEditor = observer(renderPropertyEditor);
