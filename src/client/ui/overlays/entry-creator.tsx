import { Button, ComboboxItem, Container, Group, Space } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { EntryCreatorService } from "@/client/services/modal/entry-creator";
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

function renderEntryCreator() {
    const entryCreator = getService().modal.content as EntryCreatorService;

    return (
        <Container size="xs">
            <form onSubmit={(event) => entryCreator.submit(event)}>
                <SelectField
                    label="Entity"
                    placeholder="Select an entity type"
                    data={ENTITY_TYPE_DROPDOWN_DATA}
                    getValue={() => entryCreator.entityType?.toString() ?? null}
                    onChange={(entityType) =>
                        (entryCreator.entityType = Number(entityType))
                    }
                />
                <Space h="xs" />
                <TextField
                    label={"Title"}
                    placeholder="Enter a unique title"
                    getValue={() => entryCreator.entryTitle}
                    getError={() =>
                        entryCreator.isTitleUnique ? null : "Duplicate title"
                    }
                    onChange={(event) =>
                        (entryCreator.entryTitle = event.currentTarget.value)
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
