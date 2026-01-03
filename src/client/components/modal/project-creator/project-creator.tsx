import { Button, Container, Group } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { FileField } from "@/shared/file-field";
import { TextField } from "@/shared/text-field";

import { ProjectCreatorService } from "./project-creator.service";

interface ProjectCreatorProps {
    service: ProjectCreatorService;
}

function renderProjectLoader({ service }: ProjectCreatorProps) {
    return (
        <Container size="xs">
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    service.submit();
                }}
            >
                <TextField
                    label="Name"
                    placeholder="My Wiki"
                    getValue={() => service.name}
                    onChange={(event) =>
                        (service.name = event.currentTarget.value)
                    }
                />
                <FileField
                    label="File"
                    mode="save"
                    getValue={() => service.dbFilePath}
                    onChangeFile={(path) => (service.dbFilePath = path)}
                />
                <Group justify="flex-end" mt="md">
                    <Button type="submit">Submit</Button>
                </Group>
            </form>
        </Container>
    );
}

export const ProjectCreator = observer(renderProjectLoader);
