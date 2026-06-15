import { expect, test, vi } from "vitest";

import { Id } from "@/interface";
import { MentionDropdownService } from "@/lib/components/rich-text-editor/mention/mention-dropdown-service.svelte";

test("keyboard arrows update selected index and enter selects highlighted item", () => {
    const command = vi.fn();

    const service = new MentionDropdownService<{ id: Id }>({
        items: [
            { label: "first", data: { id: "entry1" } },
            { label: "second", data: { id: "entry2" } },
            { label: "third", data: { id: "entry3" } },
        ],
        command,
    } as never);

    expect(service.selectedIndex).toBe(0);

    service.onKeyDown({
        event: new KeyboardEvent("keydown", { key: "ArrowDown" }),
    } as never);
    expect(service.selectedIndex).toBe(1);

    service.onKeyDown({
        event: new KeyboardEvent("keydown", { key: "ArrowUp" }),
    } as never);
    expect(service.selectedIndex).toBe(0);

    service.onKeyDown({
        event: new KeyboardEvent("keydown", { key: "Enter" }),
    } as never);
    expect(command).toHaveBeenCalledWith({
        label: "first",
        data: { id: "entry1" },
    });
});
