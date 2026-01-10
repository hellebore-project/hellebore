import { Container, Stack } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { SPACE } from "@/components/lib/common";

import { PropertyEditorService } from "./property-editor.service";
import { PropertyTable } from "./property-table";
import { TitleField } from "../title-field";

interface PropertyEditorProps {
    service: PropertyEditorService;
}

function renderPropertyEditor({ service }: PropertyEditorProps) {
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
