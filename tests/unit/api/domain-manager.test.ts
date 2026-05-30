import { describe, expect, test } from "vitest";

import {
    DomainManager,
    EntryManager,
    FolderManager,
    SessionManager,
    WordManager,
} from "@/api";

describe("domain manager contracts", () => {
    test("constructor wires all manager services", () => {
        const manager = new DomainManager();

        expect(manager.session).toBeInstanceOf(SessionManager);
        expect(manager.folders).toBeInstanceOf(FolderManager);
        expect(manager.entries).toBeInstanceOf(EntryManager);
        expect(manager.words).toBeInstanceOf(WordManager);
    });

    test("each DomainManager instance owns independent manager services", () => {
        const first = new DomainManager();
        const second = new DomainManager();

        expect(first).not.toBe(second);
        expect(first.session).not.toBe(second.session);
        expect(first.folders).not.toBe(second.folders);
        expect(first.entries).not.toBe(second.entries);
        expect(first.words).not.toBe(second.words);
    });
});
