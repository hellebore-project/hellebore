import { Modal as MantineModal } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { ModalType } from "@/client/constants";
import { getService } from "@/client/services";

import { ProjectCreator } from "./project-creator";
import { EntryCreator } from "./entry-creator";

function renderModalContent() {
    const modalManager = getService().modal;
    if (!modalManager.modalKey) return null;

    if (modalManager.modalKey == ModalType.ProjectCreator)
        return <ProjectCreator />;

    if (modalManager.modalKey == ModalType.EntryCreator)
        return <EntryCreator />;

    throw `Modal key ${modalManager.modalKey} not recognized.`;
}

const ModalContent = observer(renderModalContent);

function renderModal() {
    const clientManager = getService();
    const modalManager = clientManager.modal;

    if (!modalManager.modalKey || !modalManager.content) return null;

    return (
        <MantineModal
            title={modalManager.content.TITLE}
            opened={modalManager.modalKey !== null}
            onClose={() => modalManager.close()}
            portalProps={{ target: clientManager.sharedPortalSelector }}
        >
            <ModalContent />
        </MantineModal>
    );
}

export const Modal = observer(renderModal);
