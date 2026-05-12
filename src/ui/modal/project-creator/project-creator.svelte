<script lang="ts">
    import { save } from "@tauri-apps/plugin-dialog";

    import { Button } from "@/lib/components/button";
    import * as Dialog from "@/lib/components/dialog";
    import { Input } from "@/lib/components/input";
    import { Label } from "@/lib/components/label";

    import type { ProjectCreatorProps } from "./project-creator-interface";

    const { service }: ProjectCreatorProps = $props();

    async function openSaveDialog() {
        const path = await save();
        if (path) service.dbFilePath = path;
    }

    function onNameInput(event: Event) {
        service.name = (event.currentTarget as HTMLInputElement).value;
    }

    async function onSubmit(event: Event) {
        event.preventDefault();
        await service.submit();
    }
</script>

<form class="grid gap-4" onsubmit={onSubmit}>
    <div class="grid gap-2">
        <Label for="project-name">Name</Label>
        <Input
            id="project-name"
            placeholder="My Wiki"
            value={service.name}
            oninput={onNameInput}
        />
    </div>

    <div class="grid gap-2">
        <Label for="project-path">File</Label>
        <div class="flex gap-2">
            <Input
                id="project-path"
                class="cursor-pointer"
                readonly
                value={service.dbFilePath}
                onclick={openSaveDialog}
            />
            <Button type="button" variant="outline" onclick={openSaveDialog}
                >Browse</Button
            >
        </div>
    </div>

    <Dialog.DialogFooter>
        <Button type="submit">Submit</Button>
    </Dialog.DialogFooter>
</form>
