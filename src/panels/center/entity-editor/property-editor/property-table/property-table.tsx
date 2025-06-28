import "./property-table.css";

import { Card, CardProps, Grid, Stack, StackProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { FieldData, FieldType } from "@/interface";
import { TextField } from "src/shared/text-field";
import { getService } from "src/services";

interface PropertyFieldSettings extends FieldData {}

interface PropertyRowSettings {
    data: FieldData;
}

interface PropertyTableSettings extends CardProps {
    stackSettings?: StackProps;
}

function renderPropertyField({
    label,
    type,
    getValue,
    setValue,
}: PropertyFieldSettings) {
    if (type == FieldType.TEXT) {
        return (
            <TextField
                variant="unstyled"
                placeholder={label}
                getValue={getValue}
                onChange={(event) => setValue?.(event.currentTarget.value)}
            />
        );
    }
    return "";
}

const PropertyField = observer(renderPropertyField);

function renderPropertyFieldRow({ data }: PropertyRowSettings) {
    return (
        <Grid justify="flex-start" align="center">
            <Grid.Col span={3}>{data.label}</Grid.Col>
            <Grid.Col span={9}>
                <PropertyField {...data} />
            </Grid.Col>
        </Grid>
    );
}

const PropertyFieldRow = observer(renderPropertyFieldRow);

function renderPropertyTable({
    stackSettings,
    ...rest
}: PropertyTableSettings) {
    const data = getService().view.entityEditor.fieldData;
    if (data.length == 0) return null;
    const rows = data.map((fieldData) => (
        <PropertyFieldRow key={`${fieldData.property}-row`} data={fieldData} />
    ));

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
