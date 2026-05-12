<script lang="ts">
    import * as Dialog from "@/lib/components/dialog";
    import { ModalType } from "@/constants";

    import type { ModalProps } from "./modal-interface";
    import { ProjectCreator } from "./project-creator";
    import type { ProjectCreatorService } from "./project-creator";

    const { service }: ModalProps = $props();
</script>

<Dialog.Dialog
    open={service.open}
    onOpenChange={(isOpen) => service.onOpenChange(isOpen)}
>
    {#if service.modalKey !== null && service.content}
        <Dialog.DialogContent class="sm:max-w-xl">
            <Dialog.DialogHeader>
                <Dialog.DialogTitle>{service.content.title}</Dialog.DialogTitle>
            </Dialog.DialogHeader>

            {#if service.modalKey === ModalType.ProjectCreator}
                <ProjectCreator
                    service={service.content as ProjectCreatorService}
                />
            {/if}
        </Dialog.DialogContent>
    {/if}
</Dialog.Dialog>
