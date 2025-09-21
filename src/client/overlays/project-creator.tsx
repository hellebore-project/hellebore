import { Button, Container, Group, Modal } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService, ModalKey } from "@/client";
import { FileField } from "@/shared/file-field";
import { TextField } from "@/shared/text-field";

function renderProjectLoader() {
    const service = getService();

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        const name = service.projectCreator.name;
        const dbFilePath = service.projectCreator.dbFilePath;
        service.createProject(name, dbFilePath);
    };

    return (
        <Modal
            title="Create a new project"
            opened={service.currentModal == ModalKey.ProjectCreator}
            onClose={() => service.closeModal()}
            portalProps={{ target: service.sharedPortalSelector }}
        >
            <Container size="xs">
                <form onSubmit={onSubmit}>
                    <TextField
                        label="Name"
                        placeholder="My Wiki"
                        getValue={() => service.projectCreator.name}
                        onChange={(event) =>
                            (service.projectCreator.name =
                                event.currentTarget.value)
                        }
                    />
                    <FileField
                        label="File"
                        mode="save"
                        getValue={() => service.projectCreator.dbFilePath}
                        onChangeFile={(path) =>
                            (service.projectCreator.dbFilePath = path)
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

export const ProjectCreator = observer(renderProjectLoader);
