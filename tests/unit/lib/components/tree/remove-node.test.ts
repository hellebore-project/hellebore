import { expect } from "vitest";

import { render } from "@tests/utils";

import { test, getNode } from "./fixtures";
import SimpleTree from "./simple-tree.svelte";

test.extend({
    leafNodes: [
        {
            id: "leaf-x",
            parentId: "root",
            text: "X",
            data: { kind: "leaf" },
        },
    ],
})("remove leaf node", async ({ service }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });
    service.removeNodeById("leaf-x");
    await rerender({ service });
    expect(getNode(container, "X")).toBeFalsy();
});

test.extend({
    branchNodes: [
        {
            id: "folder-a",
            parentId: "root",
            text: "Alpha",
            data: { kind: "folder" },
        },
    ],
    leafNodes: [
        {
            id: "leaf-x",
            parentId: "folder-a",
            text: "X",
            data: { kind: "leaf" },
        },
    ],
})("remove child leaf node", async ({ service }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });
    service.removeNodeById("leaf-x");
    await rerender({ service });
    expect(getNode(container, "X")).toBeFalsy();
    expect(getNode(container, "Alpha")).toBeTruthy();
});

test.extend({
    branchNodes: [
        {
            id: "folder-a",
            parentId: "root",
            text: "Alpha",
            data: { kind: "folder" },
        },
    ],
})("remove branch node", async ({ service }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });
    service.removeNodeById("folder-a");
    await rerender({ service });
    expect(getNode(container, "Alpha")).toBeFalsy();
});

test.extend({
    branchNodes: [
        {
            id: "folder-a",
            parentId: "root",
            text: "Alpha",
            data: { kind: "folder" },
        },
        {
            id: "folder-b",
            parentId: "folder-a",
            text: "Beta",
            data: { kind: "folder" },
        },
    ],
    leafNodes: [
        {
            id: "leaf-a",
            parentId: "folder-a",
            text: "Leaf",
            data: { kind: "leaf" },
        },
    ],
})("remove branch node with children", async ({ service }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });

    service.removeNodeById("folder-a");
    await rerender({ service });

    expect(getNode(container, "Alpha")).toBeFalsy();
    expect(getNode(container, "Beta")).toBeFalsy();
    expect(getNode(container, "Leaf")).toBeFalsy();
});
