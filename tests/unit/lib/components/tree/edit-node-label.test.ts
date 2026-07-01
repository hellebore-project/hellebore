import { screen } from "@testing-library/svelte";
import { expect } from "vitest";

import { render } from "@tests/utils";

import { test, getNode } from "./fixtures";
import SimpleTree from "./simple-tree.svelte";

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
            id: "leaf-a",
            parentId: "folder-a",
            text: "Leaf",
            data: { kind: "leaf" },
        },
    ],
})("commit node text edit by clicking outside", async ({ service, user }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });

    const nodeData = service.getNode("leaf-a")!;
    service.makeNodeEditable(nodeData);

    await rerender({ service });

    await user.keyboard("-edited");

    const rootDropTarget = screen.getByTestId("tree-root-drop-target");
    await user.click(rootDropTarget);

    expect(getNode(container, "Leaf-edited")).toBeTruthy();
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
            id: "leaf-a",
            parentId: "folder-a",
            text: "Leaf",
            data: { kind: "leaf" },
        },
    ],
})("commit node text edit by pressing enter", async ({ service, user }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });

    const nodeData = service.getNode("leaf-a")!;
    service.makeNodeEditable(nodeData);

    await rerender({ service });

    await user.keyboard("-edited");
    await user.keyboard("{Enter}");

    expect(getNode(container, "Leaf-edited")).toBeTruthy();
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
            id: "leaf-a",
            parentId: "folder-a",
            text: "Leaf",
            data: { kind: "leaf" },
        },
    ],
})("cancel node text edit by pressing escape", async ({ service, user }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });

    const nodeData = service.getNode("leaf-a")!;
    service.makeNodeEditable(nodeData);

    await rerender({ service });

    await user.keyboard("-edited");
    await user.keyboard("{Escape}");

    expect(getNode(container, "Leaf")).toBeTruthy();
    expect(getNode(container, "Leaf-edited")).toBeFalsy();
});
