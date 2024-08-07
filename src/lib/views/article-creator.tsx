import { Button, Container, Group } from "@mantine/core";
import { observer } from "mobx-react-lite";

import Dropdown from "../shared/dropdown";
import { EntityType } from "../interface/entities";
import TextField from "../shared/text-field";
import { getService } from "../services";

function renderArticleCreator() {
    const service = getService();

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        let article = await service.view.articleCreator.submit();
        if (article) service.view.openArticleEditor(article);
    };

    return (
        <Container size="xs">
            <h1>Create a New Article</h1>
            <form onSubmit={onSubmit}>
                <Dropdown
                    label="Entity"
                    placeholder="Select an entity type (optional)"
                    items={Object.values(EntityType)}
                    getValue={() => service.view.articleCreator.entityType}
                    onChange={(entityType) =>
                        service.view.articleCreator.setEntityType(
                            entityType as EntityType,
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
