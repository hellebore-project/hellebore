import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MentionDropdownService } from "@/lib/components/rich-text-editor/mention/mention-dropdown-service.svelte";

describe("MentionDropdownService", () => {
    let service;
    let suggestionMock;

    beforeEach(() => {
        suggestionMock = {
            items: [
                { id: 1, label: "John Doe" },
                { id: 2, label: "Jane Smith" },
            ],
            command: vi.fn(),
        };
        service = new MentionDropdownService(suggestionMock);
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should initialize with given suggestions", () => {
        expect(service.items).toHaveLength(2);
        expect(service.items[0].label).toBe("John Doe");
    });

    it("should select an item and call the command", () => {
        service.select(service.items[0]);
        expect(suggestionMock.command).toHaveBeenCalledWith(service.items[0]);
    });

    it("should navigate suggestions with ArrowDown", () => {
        const event = { key: "ArrowDown", preventDefault: vi.fn() };
        service.onKeyDown({ event });
        expect(service.selectedIndex).toBe(1);
    });

    it("should navigate suggestions with ArrowUp", () => {
        service.selectedIndex = 1;
        const event = { key: "ArrowUp", preventDefault: vi.fn() };
        service.onKeyDown({ event });
        expect(service.selectedIndex).toBe(0);
    });
});
