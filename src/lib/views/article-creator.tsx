import { Button, ComboboxItem, Container, Group } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { ALL_ENTITY_TYPES, ENTITY_TYPE_LABELS } from "../interface";
import SelectField from "../shared/select-field";
import TextField from "../shared/text-field";
import { getService } from "../services";

// TODO: sort the dropdown data alphabetically
const ENTITY_TYPE_DROPDOWN_DATA: ComboboxItem[] = ALL_ENTITY_TYPES.map(
    (entityType) => ({
        label: ENTITY_TYPE_LABELS[entityType],
        value: entityType.toString(),
    }),
);

function renderArticleCreator() {
    const service = getService();

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        service.view.createArticle();
    };

    return (
        <Container size="xs">
            <h1>Create a New Article</h1>
            <form onSubmit={onSubmit}>
                <SelectField
                    label="Entity"
                    placeholder="Select an entity type (optional)"
                    data={ENTITY_TYPE_DROPDOWN_DATA}
                    getValue={() => service.view.articleCreator.entityType}
                    onChange={(entityType) =>
                        service.view.articleCreator.setEntityType(
                            Number(entityType),
                        )
                    }
                />
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
                        service.view.articleCreator.setTitle(
                            event.currentTarget.value,
                        )
                    }
                />
                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Container>
    );
}

const ArticleCreator = observer(renderArticleCreator);

export default ArticleCreator;
