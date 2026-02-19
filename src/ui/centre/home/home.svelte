<script lang="ts">
    import { Input } from "@/lib/components/input";
    import type { HomeProps } from "./home.interface";

    let { service }: HomeProps = $props(); 
</script>

<div class="flex flex-row justify-center py-6">
    <div class="w-2/3">
        <Input
            class="tracking-tight text-foreground"
            variant="ghost"
            size="h1"
            placeholder="Project name"
            value={service.projectName}
            oninput={(e) => service.projectName = e.currentTarget.value}
        />
        <hr class="mt-3 border-border" />
    </div>
</div>
