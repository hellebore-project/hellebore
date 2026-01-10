import "./property-table.css";

import { Card, CardProps, Grid, Stack, StackProps } from "@mantine/core";
import { observer } from "mobx-react-lite";
import { PropsWithChildren, ReactNode } from "react";

import { PropertyFieldType, TextPropertyFieldData } from "@/interface";
import { TextField } from "@/components/lib/text-field";

import { PropertyEditorService } from "../property-editor.service";

interface PropertyRowProps extends PropsWithChildren {
    label: string;
}

interface PropertyTableProps extends CardProps {
    service: PropertyEditorService;
    stackProps?: StackProps;
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

function renderPropertyFieldRow({ label, children }: PropertyRowProps) {
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
    stackProps,
    ...rest
}: PropertyTableProps) {
    const data = service.fieldData;
    if (data.length == 0) return null;

    const rows = data.map((fieldData) => {
        let field: ReactNode = null;
        if (fieldData.type == PropertyFieldType.TEXT)
            field = (
                <TextPropertyField {...(fieldData as TextPropertyFieldData)} />
            );
        else
            console.error(
                `Unable to render field ${fieldData.label} in the property table; ` +
                    `field type ${fieldData.type} not recognized.`,
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
                {...stackProps}
            >
                {rows}
            </Stack>
        </Card>
    );
}

export const PropertyTable = observer(renderPropertyTable);
