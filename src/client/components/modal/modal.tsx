import { Modal as MantineModal } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { ModalType } from "@/client/constants";

import { ProjectCreator, ProjectCreatorService } from "./project-creator";
import { EntryCreator, EntryCreatorService } from "./entry-creator";
import { ModalManager } from "./modal.service";

interface ModalManagerProps {
    service: ModalManager;
}

function renderModalContent({ service }: ModalManagerProps) {
    if (!service.modalKey) return null;

    if (service.modalKey == ModalType.ProjectCreator) {
        const contentService = service.content as ProjectCreatorService;
        return <ProjectCreator service={contentService} />;
    }

    if (service.modalKey == ModalType.EntryCreator) {
        const contentService = service.content as EntryCreatorService;
        return <EntryCreator service={contentService} />;
    }

    throw `Modal key ${service.modalKey} not recognized.`;
}

const ModalContent = observer(renderModalContent);

function renderModal({ service }: ModalManagerProps) {
    if (!service.modalKey || !service.content) return null;

    return (
        <MantineModal
            title={service.content.title}
            opened={service.modalKey !== null}
            onClose={() => service.close()}
            portalProps={{ target: service.fetchPortalSelector.produce() }}
        >
            <ModalContent service={service} />
        </MantineModal>
    );
}

export const Modal = observer(renderModal);
