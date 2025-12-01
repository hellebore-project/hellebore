import { Container, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { PropertyEditor as PropertyEditorService } from "@/client/services";
import { SPACE } from "@/shared/common";

import { PropertyTable } from "./property-table";
import { TitleField } from "../title-field";

interface PropertyEditorSettings {
    service: PropertyEditorService;
}

function renderPropertyEditor({ service }: PropertyEditorSettings) {
    return (
        <Container className="property-editor">
            <Stack
                className="property-editor-stack"
                justify="flex-start"
                gap={0}
            >
                <TitleField service={service.info} />
                {SPACE}
                <PropertyTable service={service} />
            </Stack>
        </Container>
    );
}

export const PropertyEditor = observer(renderPropertyEditor);
