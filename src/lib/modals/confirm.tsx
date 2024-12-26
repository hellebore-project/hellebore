import { Container, Group, Modal, Text } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { ModalKey } from "@/interface";
import { getService } from "@/services";
import { FormButton, FormButtonSettings } from "@/shared/form-button";

export interface ConfirmModalSettings {
    modalKey: ModalKey;
    title: string;
    prompt?: string;
    submit?: FormButtonSettings;
    cancel?: FormButtonSettings;
}

function renderConfirmModal({
    modalKey,
    title,
    prompt,
    submit,
    cancel,
}: ConfirmModalSettings) {
    const service = getService();

    if (!submit) submit = {};

    if (!submit.label) submit.label = "Submit";

    if (submit.onClick) {
        const _onClick = submit.onClick;
        submit.onClick = (event) => {
            event.preventDefault();
            _onClick(event);
        };
    }

    if (!cancel) cancel = {};

    if (!cancel.label) cancel.label = "Cancel";

    if (!cancel.onClick)
        cancel.onClick = (event) => {
            event.preventDefault();
            service.view.closeModal();
        };
    else {
        const _onClick = cancel.onClick;
        cancel.onClick = (event) => {
            event.preventDefault();
            _onClick(event);
        };
    }

    return (
        <Modal
            title={title}
            opened={service.view.modalKey == modalKey}
            onClose={() => service.view.closeModal()}
        >
            <Container size="xs">
                <Text>{prompt}</Text>
                <Group justify="flex-end" mt="md">
                    <FormButton type="button" {...cancel} />
                    <FormButton type="submit" {...submit} />
                </Group>
            </Container>
        </Modal>
    );
}

export const ConfirmModal = observer(renderConfirmModal);
