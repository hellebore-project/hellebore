import { expect, vi } from "vitest";

import { render } from "@tests/utils";
import { dispatchDragEvent } from "@tests/utils/drag-and-drop";

import {
    test,
    getChildNodeNames,
    getNodeElement,
    getRootNodeNames,
} from "./fixtures";
import SimpleTree from "./simple-tree.svelte";

test.extend({
    branchNodes: [
        {
            id: "folder-a",
            parentId: "root",
            text: "A",
            data: { kind: "folder" },
        },
        {
            id: "folder-b",
            parentId: "root",
            text: "B",
            data: { kind: "folder" },
        },
    ],
    leafNodes: [
        {
            id: "leaf-x",
            parentId: "folder-a",
            text: "Leaf X",
            data: { kind: "leaf" },
        },
    ],
})(
    "drag and drop leaf node to change its parent",
    async ({ service, user }) => {
        const { container } = render(SimpleTree, { props: { service } });

        const finalizeMove = vi.fn(async () => true);
        service.onFinalizeNodeMove.subscribe(finalizeMove);

        const leafX = getNodeElement(container, "Leaf X");
        const folderB = getNodeElement(container, "B");

        await user.pointer([{ target: leafX, keys: "[MouseLeft>]" }]);
        dispatchDragEvent(leafX, "dragstart");

        await user.pointer([{ target: folderB }]);
        dispatchDragEvent(folderB, "dragenter");
        dispatchDragEvent(folderB, "dragover");
        dispatchDragEvent(folderB, "drop");

        await user.pointer([{ target: leafX, keys: "[/MouseLeft]" }]);
        dispatchDragEvent(leafX, "dragend");

        expect(finalizeMove).toHaveBeenCalledTimes(1);
        expect(finalizeMove).toHaveBeenCalledWith({
            node: service.getNode("leaf-x"),
            destParentNodeId: "folder-b",
        });

        expect(getChildNodeNames(container, "A")).toStrictEqual([]);
        expect(getChildNodeNames(container, "B")).toStrictEqual(["Leaf X"]);
    },
);

test.extend({
    branchNodes: [
        {
            id: "folder-a",
            parentId: "root",
            text: "A",
            data: { kind: "folder" },
        },
        {
            id: "folder-b",
            parentId: "root",
            text: "B",
            data: { kind: "folder" },
        },
    ],
})(
    "drag and drop branch node to change its parent",
    async ({ service, user }) => {
        const { container } = render(SimpleTree, { props: { service } });

        const finalizeMove = vi.fn(async () => true);
        service.onFinalizeNodeMove.subscribe(finalizeMove);

        const folderA = getNodeElement(container, "A");
        const folderB = getNodeElement(container, "B");

        await user.pointer([{ target: folderA, keys: "[MouseLeft>]" }]);
        dispatchDragEvent(folderA, "dragstart");

        await user.pointer([{ target: folderB }]);
        dispatchDragEvent(folderB, "dragenter");
        dispatchDragEvent(folderB, "dragover");
        dispatchDragEvent(folderB, "drop");

        await user.pointer([{ target: folderA, keys: "[/MouseLeft]" }]);
        dispatchDragEvent(folderA, "dragend");

        expect(finalizeMove).toHaveBeenCalledTimes(1);
        expect(finalizeMove).toHaveBeenCalledWith({
            node: service.getNode("folder-a"),
            destParentNodeId: "folder-b",
        });

        expect(getRootNodeNames(container)).toStrictEqual(["B"]);
        expect(getChildNodeNames(container, "B")).toStrictEqual(["A"]);
    },
);

test.extend({
    branchNodes: [
        {
            id: "folder-a",
            parentId: "root",
            text: "A",
            data: { kind: "folder" },
        },
    ],
    leafNodes: [
        {
            id: "leaf-x",
            parentId: "root",
            text: "Leaf",
            data: { kind: "leaf" },
        },
    ],
})("moving a node is rejected", async ({ service, user }) => {
    const { container } = render(SimpleTree, { props: { service } });

    const finalizeMove = vi.fn(async () => false);
    service.onFinalizeNodeMove.subscribe(finalizeMove);

    const folderA = getNodeElement(container, "A");
    const leafX = getNodeElement(container, "Leaf");

    await user.pointer([{ target: leafX, keys: "[MouseLeft>]" }]);
    dispatchDragEvent(leafX, "dragstart");

    await user.pointer([{ target: folderA }]);
    dispatchDragEvent(folderA, "dragenter");
    dispatchDragEvent(folderA, "dragover");
    dispatchDragEvent(folderA, "drop");

    await user.pointer([{ target: leafX, keys: "[/MouseLeft]" }]);
    dispatchDragEvent(leafX, "dragend");

    expect(finalizeMove).toHaveBeenCalledTimes(1);
    expect(finalizeMove).toHaveBeenCalledWith({
        node: service.getNode("leaf-x"),
        destParentNodeId: "folder-a",
    });

    expect(getRootNodeNames(container)).toStrictEqual(["A", "Leaf"]);
    expect(getChildNodeNames(container, "A")).toStrictEqual([]);
});
