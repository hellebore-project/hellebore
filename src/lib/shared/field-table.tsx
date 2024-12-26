import { Card, Grid, Stack, StackProps } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { FieldData, FieldType } from "@/interface";
import { TextField } from "./text-field";

interface FieldSettings extends FieldData {}

interface FieldRowSettings {
    data: FieldData;
}

interface FieldTableSettings extends StackProps {
    getData: () => FieldData[];
}

function renderField({ label, type, getValue, setValue }: FieldSettings) {
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

const Field = observer(renderField);

function renderFieldRow({ data }: FieldRowSettings) {
    return (
        <Grid justify="flex-start" align="center">
            <Grid.Col span={3}>{data.label}</Grid.Col>
            <Grid.Col span={9}>
                <Field {...data} />
            </Grid.Col>
        </Grid>
    );
}

const FieldRow = observer(renderFieldRow);

function renderFieldTable({ getData, ...rest }: FieldTableSettings) {
    const rows = getData().map((fieldData) => (
        <FieldRow key={`${fieldData.property}-row`} data={fieldData} />
    ));
    if (rows.length == 0) return null;
    return (
        <Card>
            <Stack align="stretch" gap="xs" {...rest}>
                {rows}
            </Stack>
        </Card>
    );
}

export const FieldTable = observer(renderFieldTable);
