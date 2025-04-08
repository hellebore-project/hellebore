import {
    Button,
    ComboboxItem,
    Container,
    Group,
    Modal,
    Space,
} from "@mantine/core";
import { observer } from "mobx-react-lite";

import {
    ARTICLE_ENTITY_TYPES,
    ENTITY_TYPE_LABELS,
    ModalKey,
} from "@/interface";
import { SelectField } from "@/shared/select-field";
import { TextField } from "@/shared/text-field";
import { getService } from "@/services";
import { compareStrings } from "@/utils/string";

const ENTITY_TYPE_DROPDOWN_DATA: ComboboxItem[] = ARTICLE_ENTITY_TYPES.map(
    (entityType) => ({
        label: ENTITY_TYPE_LABELS[entityType],
        value: entityType.toString(),
    }),
).sort((a, b) => compareStrings(a.label, b.label));

function renderArticleCreator() {
    const service = getService();

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        service.view.createArticle();
    };

    return (
        <Modal
            title="Create a new article"
            opened={service.view.currentModal == ModalKey.ArticleCreator}
            onClose={() => service.view.closeModal()}
        >
            <Container size="xs">
                <form onSubmit={onSubmit}>
                    <SelectField
                        label="Entity"
                        placeholder="Select an entity type (optional)"
                        data={ENTITY_TYPE_DROPDOWN_DATA}
                        getValue={() =>
                            service.view.articleCreator.entityType?.toString() ??
                            null
                        }
                        onChange={(entityType) =>
                            service.view.articleCreator.setEntityType(
                                Number(entityType),
                            )
                        }
                    />
                    <Space h="xs" />
                    <TextField
                        label={"Title"}
                        placeholder="Enter a unique title"
                        getValue={() => service.view.articleCreator.title}
                        getError={() =>
                            service.view.articleCreator.isTitleUnique
                                ? null
                                : "Duplicate title"
                        }
                        onChange={(event) =>
                            (service.view.articleCreator.title =
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

export const ArticleCreator = observer(renderArticleCreator);
