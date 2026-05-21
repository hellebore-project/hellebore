import { beforeEach, describe, expect, it, vi } from "vitest";

import { FileTreeService } from "@/lib/components/file-tree/file-tree-service.svelte";

interface TestData {
    kind: string;
}

describe("FileTreeService", () => {
    let service: FileTreeService<TestData>;

    beforeEach(() => {
        service = new FileTreeService<TestData>({ id: "file-tree-test" });
        service.onSelectLeafNode.subscribe(() => undefined);
    });

    it("loads nodes and sorts children with folders first then alphabetical within type", () => {
        service.load(
            [
                {
                    id: "folder-b",
                    parentId: "root",
                    text: "Bravo",
                    data: { kind: "folder" },
                },
                {
                    id: "folder-a",
                    parentId: "root",
                    text: "Alpha",
                    data: { kind: "folder" },
                },
                {
                    id: "nested-folder",
                    parentId: "folder-a",
                    text: "Zulu",
                    data: { kind: "folder" },
                },
            ],
            [
                {
                    id: "leaf-c",
                    parentId: "root",
                    text: "Charlie",
                    data: { kind: "leaf" },
                },
                {
                    id: "leaf-b",
                    parentId: "root",
                    text: "Beta",
                    data: { kind: "leaf" },
                },
                {
                    id: "leaf-a",
                    parentId: "folder-a",
                    text: "Alpha Leaf",
                    data: { kind: "leaf" },
                },
            ],
        );

        const rootChildren = service
            .getChildNodes(service.rootNodeId)
            .map((n) => n.id);
        expect(rootChildren).toStrictEqual([
            "folder-a",
            "folder-b",
            "leaf-b",
            "leaf-c",
        ]);

        const folderAChildren = service
            .getChildNodes("folder-a")
            .map((n) => n.id);
        expect(folderAChildren).toStrictEqual(["nested-folder", "leaf-a"]);
    });

    it("computes selectedFolderId for no selection, folder selection, and leaf selection", () => {
        service.load(
            [
                {
                    id: "folder-a",
                    parentId: "root",
                    text: "Alpha",
                    data: { kind: "folder" },
                },
            ],
            [
                {
                    id: "leaf-a",
                    parentId: "folder-a",
                    text: "Leaf",
                    data: { kind: "leaf" },
                },
            ],
        );

        expect(service.selectedFolderId).toBe(service.rootNodeId);

        const folder = service.getNode("folder-a");
        const leaf = service.getNode("leaf-a");
        expect(folder).toBeDefined();
        expect(leaf).toBeDefined();
        if (!folder || !leaf)
            throw new Error("expected fixture nodes to exist");

        service.selectNode(folder);
        expect(service.selectedFolderId).toBe("folder-a");

        service.selectNode(leaf);
        expect(service.selectedFolderId).toBe("folder-a");
    });

    it("prevents invalid moves and performs successful move through finalize event", async () => {
        service.load(
            [
                {
                    id: "folder-a",
                    parentId: "root",
                    text: "A",
                    data: { kind: "folder" },
                },
                {
                    id: "folder-b",
                    parentId: "folder-a",
                    text: "B",
                    data: { kind: "folder" },
                },
                {
                    id: "folder-c",
                    parentId: "root",
                    text: "C",
                    data: { kind: "folder" },
                },
            ],
            [
                {
                    id: "leaf-x",
                    parentId: "folder-a",
                    text: "Leaf X",
                    data: { kind: "leaf" },
                },
            ],
        );

        const finalizeMove = vi.fn(async () => true);
        service.onFinalizeNodeMove.subscribe(finalizeMove);

        await service.moveNode("folder-a", "folder-a");
        await service.moveNode("folder-a", "folder-b");
        await service.moveNode("leaf-x", "folder-a");

        expect(finalizeMove).not.toHaveBeenCalled();
        expect(service.getNode("folder-a")?.parentId).toBe("root");
        expect(service.getNode("leaf-x")?.parentId).toBe("folder-a");

        await service.moveNode("leaf-x", "folder-c");

        expect(finalizeMove).toHaveBeenCalledTimes(1);
        expect(finalizeMove).toHaveBeenCalledWith({
            node: service.getNode("leaf-x"),
            destParentNodeId: "folder-c",
        });
        expect(service.getNode("leaf-x")?.parentId).toBe("folder-c");
        expect(
            service.getChildNodes("folder-a").map((n) => n.id),
        ).toStrictEqual(["folder-b"]);
        expect(
            service.getChildNodes("folder-c").map((n) => n.id),
        ).toStrictEqual(["leaf-x"]);
    });

    it("toggles collapsed state and collapses all folders", () => {
        service.load(
            [
                {
                    id: "folder-a",
                    parentId: "root",
                    text: "A",
                    data: { kind: "folder" },
                },
                {
                    id: "folder-b",
                    parentId: "folder-a",
                    text: "B",
                    data: { kind: "folder" },
                },
            ],
            [
                {
                    id: "leaf-x",
                    parentId: "folder-a",
                    text: "Leaf",
                    data: { kind: "leaf" },
                },
            ],
        );

        expect(service.isCollapsed("folder-a")).toBe(false);

        service.toggleCollapsed("folder-a");
        expect(service.isCollapsed("folder-a")).toBe(true);

        service.toggleCollapsed("folder-a");
        expect(service.isCollapsed("folder-a")).toBe(false);

        service.collapseAll();
        expect(service.isCollapsed("folder-a")).toBe(true);
        expect(service.isCollapsed("folder-b")).toBe(true);
        expect(service.isCollapsed("leaf-x")).toBe(false);
    });
});
