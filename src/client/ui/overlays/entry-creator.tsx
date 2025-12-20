import { Button, ComboboxItem, Container, Group, Space } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { EntryCreatorService } from "@/client/services";
import { FILE_ENTITY_TYPES, ENTITY_TYPE_LABELS } from "@/domain";
import { SelectField } from "@/shared/select-field";
import { TextField } from "@/shared/text-field";
import { compareStrings } from "@/utils/string";

const ENTITY_TYPE_DROPDOWN_DATA: ComboboxItem[] = FILE_ENTITY_TYPES.map(
    (entityType) => ({
        label: ENTITY_TYPE_LABELS[entityType],
        value: entityType.toString(),
    }),
).sort((a, b) => compareStrings(a.label, b.label));

interface EntryCreatorProps {
    service: EntryCreatorService;
}

function renderEntryCreator({ service }: EntryCreatorProps) {
    return (
        <Container size="xs">
            <form onSubmit={(event) => service.submit(event)}>
                <SelectField
                    label="Entity"
                    placeholder="Select an entity type"
                    data={ENTITY_TYPE_DROPDOWN_DATA}
                    getValue={() => service.entityType?.toString() ?? null}
                    onChange={(entityType) =>
                        (service.entityType = Number(entityType))
                    }
                    comboboxProps={{
                        portalProps: {
                            target: service.fetchPortalSelector.produceOne(),
                        },
                    }}
                />
                <Space h="xs" />
                <TextField
                    label={"Title"}
                    placeholder="Enter a unique title"
                    getValue={() => service.entryTitle}
                    getError={() =>
                        service.isTitleUnique ? null : "Duplicate title"
                    }
                    onChange={(event) =>
                        (service.entryTitle = event.currentTarget.value)
                    }
                />
                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Container>
    );
}

export const EntryCreator = observer(renderEntryCreator);
