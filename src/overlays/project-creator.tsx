import { Button, Container, Group, Modal } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { ModalKey } from "@/constants";
import { getService } from "@/services";
import { FileField } from "@/shared/file-field";
import { TextField } from "@/shared/text-field";

function renderProjectLoader() {
    const service = getService();

    const onSubmit: React.FormEventHandler<HTMLFormElement> = async (event) => {
        event.preventDefault();
        const name = service.view.projectCreator.name;
        const dbFilePath = service.view.projectCreator.dbFilePath;
        service.view.createProject(name, dbFilePath);
    };

    return (
        <Modal
            title="Create a new project"
            opened={service.view.currentModal == ModalKey.ProjectCreator}
            onClose={() => service.view.closeModal()}
            portalProps={{ target: service.view.sharedPortalSelector }}
        >
            <Container size="xs">
                <form onSubmit={onSubmit}>
                    <TextField
                        label="Name"
                        placeholder="My Wiki"
                        getValue={() => service.view.projectCreator.name}
                        onChange={(event) =>
                            (service.view.projectCreator.name =
                                event.currentTarget.value)
                        }
                    />
                    <FileField
                        label="File"
                        mode="save"
                        getValue={() => service.view.projectCreator.dbFilePath}
                        onChangeFile={(path) =>
                            (service.view.projectCreator.dbFilePath = path)
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
