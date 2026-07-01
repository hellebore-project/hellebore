import { expect } from "vitest";

import { render } from "@tests/utils";

import { test, getNode } from "./fixtures";
import SimpleTree from "./simple-tree.svelte";

test("add leaf node to root", async ({ service }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });
    service.addLeafNode({
        id: "leaf-a",
        parentId: "root",
        text: "X",
        data: { kind: "leaf" },
    });
    await rerender({ service });
    expect(getNode(container, "X")).toBeTruthy();
});

test("add branch node to root", async ({ service }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });
    service.addBranchNode({
        id: "folder-a",
        parentId: "root",
        text: "Alpha",
        data: { kind: "folder" },
    });
    await rerender({ service });
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
})("add leaf node to branch", async ({ service }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });
    service.addLeafNode({
        id: "leaf-a",
        parentId: "folder-a",
        text: "X",
        data: { kind: "leaf" },
    });
    await rerender({ service });
    expect(getNode(container, "X")).toBeTruthy();
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
})("add branch node to branch", async ({ service }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });
    service.addBranchNode({
        id: "branch-a",
        parentId: "folder-a",
        text: "Beta",
        data: { kind: "branch" },
    });
    await rerender({ service });
    expect(getNode(container, "Beta")).toBeTruthy();
});
