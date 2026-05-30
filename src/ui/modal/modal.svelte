<script lang="ts">
    import { ModalType } from "@/constants";
    import * as Dialog from "@/lib/components/dialog";

    import type { ModalProps } from "./modal-interface";
    import { EntryCreator } from "./entry-creator";
    import type { EntryCreatorService } from "./entry-creator";
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
            {:else if service.modalKey === ModalType.EntryCreator}
                <EntryCreator
                    service={service.content as EntryCreatorService}
                />
            {/if}
        </Dialog.DialogContent>
    {/if}
</Dialog.Dialog>
