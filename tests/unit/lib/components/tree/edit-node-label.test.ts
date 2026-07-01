import { screen } from "@testing-library/svelte";
import { expect, vi } from "vitest";

import { render } from "@tests/utils";

import { test as baseTest, getNode } from "./fixtures";
import SimpleTree from "./simple-tree.svelte";

const test = baseTest.extend({
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
});

test("commit node text edit by clicking outside", async ({ service, user }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });

    const nodeData = service.getNode("leaf-a")!;
    service.makeNodeEditable(nodeData);

    await rerender({ service });

    await user.keyboard("-edited");

    const rootDropTarget = screen.getByTestId("tree-root-drop-target");
    await user.click(rootDropTarget);

    expect(getNode(container, "Leaf-edited")).toBeTruthy();
});

test("commit node text edit by pressing enter", async ({ service, user }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });

    const nodeData = service.getNode("leaf-a")!;
    service.makeNodeEditable(nodeData);

    await rerender({ service });

    await user.keyboard("-edited");
    await user.keyboard("{Enter}");

    expect(getNode(container, "Leaf-edited")).toBeTruthy();
});

test("cancel node text edit by pressing escape", async ({ service, user }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });

    const nodeData = service.getNode("leaf-a")!;
    service.makeNodeEditable(nodeData);

    await rerender({ service });

    await user.keyboard("-edited");
    await user.keyboard("{Escape}");

    expect(getNode(container, "Leaf")).toBeTruthy();
    expect(getNode(container, "Leaf-edited")).toBeFalsy();
});

test("node text edit is committed on validation success", async ({
    service,
    user,
}) => {
    const mock = vi.fn(async () => ({
        success: true,
    }));
    service.onValidateNodeText.subscribe(mock);

    const { container, rerender } = render(SimpleTree, { props: { service } });

    const nodeData = service.getNode("leaf-a")!;
    service.makeNodeEditable(nodeData);

    await rerender({ service });

    await user.keyboard("-edited");
    await user.keyboard("{Enter}");

    expect(getNode(container, "Leaf-edited")).toBeTruthy();

    expect(mock).toHaveBeenCalled();
});

test("node text edit is canceled on validation failure", async ({
    service,
    user,
}) => {
    const mock = vi.fn(async () => ({
        success: false,
    }));
    service.onValidateNodeText.subscribe(mock);

    const { container, rerender } = render(SimpleTree, { props: { service } });

    const nodeData = service.getNode("leaf-a")!;
    service.makeNodeEditable(nodeData);

    await rerender({ service });

    await user.keyboard("-edited");
    await user.keyboard("{Enter}");

    expect(getNode(container, "Leaf")).toBeTruthy();
    expect(getNode(container, "Leaf-edited")).toBeFalsy();

    expect(mock).toHaveBeenCalled();
});
