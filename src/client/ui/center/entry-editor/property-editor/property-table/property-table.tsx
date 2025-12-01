import "./property-table.css";

import { Card, CardProps, Grid, Stack, StackProps } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactNode } from "react";

import {
    PropertyEditor,
    PropertyFieldType,
    TextPropertyFieldData,
} from "@/client";
import { TextField } from "@/shared/text-field";

interface PropertyRowSettings extends PropsWithChildren {
    label: string;
}

interface PropertyTableSettings extends CardProps {
    service: PropertyEditor;
    stackSettings?: StackProps;
}

function renderTextPropertyField({
    label,
    getValue,
    setValue,
}: TextPropertyFieldData) {
    return (
        <TextField
            variant="unstyled"
            placeholder={label}
            getValue={getValue}
            onChange={(event) => setValue?.(event.currentTarget.value)}
        />
    );
}

const TextPropertyField = observer(renderTextPropertyField);

function renderPropertyFieldRow({ label, children }: PropertyRowSettings) {
    return (
        <Grid justify="flex-start" align="center">
            <Grid.Col span={3}>{label}</Grid.Col>
            <Grid.Col span={9}>{children}</Grid.Col>
        </Grid>
    );
}

const PropertyFieldRow = observer(renderPropertyFieldRow);

function renderPropertyTable({
    service,
    stackSettings,
    ...rest
}: PropertyTableSettings) {
    // TODO: delay accessing the field data;
    // the field data should be accessed by the individual PropertyFieldRows
    const data = service.fieldData;
    if (data.length == 0) return null;

    const rows = data.map((fieldData) => {
        let field: ReactNode = null;
        if (fieldData.type == PropertyFieldType.TEXT)
            field = (
                <TextPropertyField {...(fieldData as TextPropertyFieldData)} />
            );

        return (
            <PropertyFieldRow
                key={`${fieldData.property}-row`}
                label={fieldData.label}
            >
                {field}
            </PropertyFieldRow>
        );
    });

    return (
        <Card className="property-table" {...rest}>
            <Stack
                className="property-table-stack"
                align="stretch"
                gap="xs"
                {...stackSettings}
            >
                {rows}
            </Stack>
        </Card>
    );
}

export const PropertyTable = observer(renderPropertyTable);
