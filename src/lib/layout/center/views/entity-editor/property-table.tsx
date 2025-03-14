import { Card, CardProps, Grid, Stack, StackProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { FieldData, FieldType } from "@/interface";
import { TextField } from "../../../../shared/text-field";

interface PropertyFieldSettings extends FieldData {}

interface PropertyRowSettings {
    data: FieldData;
}

interface PropertyTableSettings extends CardProps {
    getData: () => FieldData[];
    stack?: StackProps;
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
    getData,
    stack,
    ...rest
}: PropertyTableSettings) {
    const rows = getData().map((fieldData) => (
        <PropertyFieldRow key={`${fieldData.property}-row`} data={fieldData} />
    ));
    if (rows.length == 0) return null;
    return (
        <Card {...rest}>
            <Stack align="stretch" gap="xs" {...stack}>
                {rows}
            </Stack>
        </Card>
    );
}

export const PropertyTable = observer(renderPropertyTable);
