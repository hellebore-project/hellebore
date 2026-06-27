import { screen } from "@testing-library/svelte";
import { expect, vi } from "vitest";

import { render } from "@tests/utils";
import { dispatchDragEvent } from "@tests/utils/drag-and-drop";

import { test, getChildNames, getNode, getRootChildNames } from "./fixtures";
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
})("drag and drop leaf node to branch node", async ({ service, user }) => {
    const { container } = render(SimpleTree, { props: { service } });

    const finalizeMove = vi.fn(async () => true);
    service.onFinalizeNodeMove.subscribe(finalizeMove);

    const leafX = getNode(container, "Leaf X");
    const folderB = getNode(container, "B");

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

    expect(getChildNames(container, "A")).toStrictEqual([]);
    expect(getChildNames(container, "B")).toStrictEqual(["Leaf X"]);
});

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
            parentId: "folder-a",
            text: "Leaf X",
            data: { kind: "leaf" },
        },
    ],
})("drag and drop leaf node to root node", async ({ service, user }) => {
    const { container } = render(SimpleTree, { props: { service } });

    const finalizeMove = vi.fn(async () => true);
    service.onFinalizeNodeMove.subscribe(finalizeMove);

    const leafX = getNode(container, "Leaf X");
    const rootDropTarget = screen.getByTestId("tree-root-drop-target");

    await user.pointer([{ target: leafX, keys: "[MouseLeft>]" }]);
    dispatchDragEvent(leafX, "dragstart");

    await user.pointer([{ target: rootDropTarget }]);
    dispatchDragEvent(rootDropTarget, "dragenter");
    dispatchDragEvent(rootDropTarget, "dragover");
    dispatchDragEvent(rootDropTarget, "drop");

    await user.pointer([{ target: leafX, keys: "[/MouseLeft]" }]);
    dispatchDragEvent(leafX, "dragend");

    expect(finalizeMove).toHaveBeenCalledTimes(1);
    expect(finalizeMove).toHaveBeenCalledWith({
        node: service.getNode("leaf-x"),
        destParentNodeId: "root",
    });

    expect(getChildNames(container, "A")).toStrictEqual([]);
    expect(getRootChildNames(container)).toStrictEqual(["A", "Leaf X"]);
});

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
    "drag and drop branch node to another branch node",
    async ({ service, user }) => {
        const { container } = render(SimpleTree, { props: { service } });

        const finalizeMove = vi.fn(async () => true);
        service.onFinalizeNodeMove.subscribe(finalizeMove);

        const folderA = getNode(container, "A");
        const folderB = getNode(container, "B");

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

        expect(getRootChildNames(container)).toStrictEqual(["B"]);
        expect(getChildNames(container, "B")).toStrictEqual(["A"]);
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
            parentId: "folder-a",
            text: "B",
            data: { kind: "folder" },
        },
    ],
    leafNodes: [
        {
            id: "leaf-x",
            parentId: "folder-b",
            text: "Leaf X",
            data: { kind: "leaf" },
        },
    ],
})("drag and drop branch node to root node", async ({ service, user }) => {
    const { container } = render(SimpleTree, { props: { service } });

    const finalizeMove = vi.fn(async () => true);
    service.onFinalizeNodeMove.subscribe(finalizeMove);

    const folderB = getNode(container, "B");
    const rootDropTarget = screen.getByTestId("tree-root-drop-target");

    await user.pointer([{ target: folderB, keys: "[MouseLeft>]" }]);
    dispatchDragEvent(folderB, "dragstart");

    await user.pointer([{ target: rootDropTarget }]);
    dispatchDragEvent(rootDropTarget, "dragenter");
    dispatchDragEvent(rootDropTarget, "dragover");
    dispatchDragEvent(rootDropTarget, "drop");

    await user.pointer([{ target: folderB, keys: "[/MouseLeft]" }]);
    dispatchDragEvent(folderB, "dragend");

    expect(finalizeMove).toHaveBeenCalledTimes(1);
    expect(finalizeMove).toHaveBeenCalledWith({
        node: service.getNode("folder-b"),
        destParentNodeId: "root",
    });

    expect(getChildNames(container, "A")).toStrictEqual([]);
    expect(getRootChildNames(container)).toStrictEqual(["A", "B"]);
    expect(getChildNames(container, "B")).toStrictEqual(["Leaf X"]);
});

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

    const folderA = getNode(container, "A");
    const leafX = getNode(container, "Leaf");

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

    expect(getRootChildNames(container)).toStrictEqual(["A", "Leaf"]);
    expect(getChildNames(container, "A")).toStrictEqual([]);
});
