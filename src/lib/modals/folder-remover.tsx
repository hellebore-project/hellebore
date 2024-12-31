import { observer } from "mobx-react-lite";

import { ModalKey } from "@/interface";
import { getService } from "@/services";
import { ConfirmModal } from "@/shared/confirm";

function renderFolderRemover() {
    const service = getService();
    const id = service.view.folderRemover.id;
    let prompt = "";
    if (id !== null) {
        const folderName =
            service.domain.folders.getInfo(id)?.name ?? "unknown";
        prompt = `Are you sure that you want to delete the '${folderName}' folder and its contents? This action is irreversible.`;
    }

    return (
        <ConfirmModal
            modalKey={ModalKey.FOLDER_REMOVER}
            title="Delete folder"
            prompt={prompt}
            submit={{
                label: "Delete",
                color: "red",
                onClick: () => {
                    if (id !== null) service.view.deleteFolder(id);
                },
            }}
            cancel={{
                color: "blue",
            }}
        />
    );
}

export const FolderRemover = observer(renderFolderRemover);
