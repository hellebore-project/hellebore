import {
    Button,
    ComboboxItem,
    Container,
    Group,
    Modal,
    Space,
} from "@mantine/core";
import { observer } from "mobx-react-lite";

import { FILE_ENTITY_TYPES, ENTITY_TYPE_LABELS, ModalKey } from "@/domain";
import { SelectField } from "@/shared/select-field";
import { TextField } from "@/shared/text-field";
import { getService } from "@/client";
import { compareStrings } from "@/utils/string";

const ENTITY_TYPE_DROPDOWN_DATA: ComboboxItem[] = FILE_ENTITY_TYPES.map(
    (entityType) => ({
        label: ENTITY_TYPE_LABELS[entityType],
        value: entityType.toString(),
    }),
).sort((a, b) => compareStrings(a.label, b.label));

function renderEntryCreator() {
    const service = getService();

    return (
        <Modal
            title="Create a new entry"
            opened={service.view.currentModal == ModalKey.EntryCreator}
            onClose={() => service.view.closeModal()}
            portalProps={{ target: service.view.sharedPortalSelector }}
        >
            <Container size="xs">
                <form
                    onSubmit={(event) =>
                        service.view.entityCreator.submit(event)
                    }
                >
                    <SelectField
                        label="Entity"
                        placeholder="Select an entity type"
                        data={ENTITY_TYPE_DROPDOWN_DATA}
                        getValue={() =>
                            service.view.entityCreator.entityType?.toString() ??
                            null
                        }
                        onChange={(entityType) =>
                            service.view.entityCreator.setEntityType(
                                Number(entityType),
                            )
                        }
                    />
                    <Space h="xs" />
                    <TextField
                        label={"Title"}
                        placeholder="Enter a unique title"
                        getValue={() => service.view.entityCreator.title}
                        getError={() =>
                            service.view.entityCreator.isTitleUnique
                                ? null
                                : "Duplicate title"
                        }
                        onChange={(event) =>
                            (service.view.entityCreator.title =
                                event.currentTarget.value)
                        }
                    />
                    <Group justify="flex-end" mt="md">
                        <Button type="submit">Submit</Button>
                    </Group>
                </form>
            </Container>
        </Modal>
    );
}

export const EntryCreator = observer(renderEntryCreator);
