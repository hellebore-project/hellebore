<script lang="ts">
    import { Input } from "@/lib/components/input";
    import type { HomeProps } from "./home.interface";

    let { service }: HomeProps = $props(); 
</script>

<div class="flex flex-row justify-center">
    <div class="w-2/3">
        <Input
            variant="ghost"
            placeholder="Project name"
            value={service.projectName}
            oninput={(e) => service.projectName = e.currentTarget.value}
        />
    </div>
</div>
