import { Button, Container, Group } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { ProjectCreatorService } from "@/client/services/modal/project-creator";
import { FileField } from "@/shared/file-field";
import { TextField } from "@/shared/text-field";

function renderProjectLoader() {
    const projectCreator = getService().modal.content as ProjectCreatorService;

    return (
        <Container size="xs">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    projectCreator.submit();
                }}
            >
                <TextField
                    label="Name"
                    placeholder="My Wiki"
                    getValue={() => projectCreator.name}
                    onChange={(event) =>
                        (projectCreator.name = event.currentTarget.value)
                    }
                />
                <FileField
                    label="File"
                    mode="save"
                    getValue={() => projectCreator.dbFilePath}
                    onChangeFile={(path) => (projectCreator.dbFilePath = path)}
                />
                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Container>
    );
}

export const ProjectCreator = observer(renderProjectLoader);
