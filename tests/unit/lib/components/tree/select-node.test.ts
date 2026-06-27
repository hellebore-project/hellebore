import { expect } from "vitest";

import { render } from "@tests/utils";

import { test, getNodeElement } from "./fixtures";
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
})("selects leaf node when leaf is clicked", async ({ service, user }) => {
    const { container } = render(SimpleTree, { props: { service } });

    const buttons = [
        ...container.querySelectorAll('[role="button"]'),
    ] as HTMLElement[];
    const leafButton = buttons.find(
        (b) => b.querySelector("span.truncate")?.textContent?.trim() === "Leaf",
    )!;
    await user.click(leafButton);

    expect(service.selectedNodeId).toBe("leaf-a");
    expect(service.selectedBranchId).toBe("folder-a");
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
            text: "Leaf",
            data: { kind: "leaf" },
        },
    ],
})("leaf inside collapsed branch node is not visible", async ({ service }) => {
    service.collapseNode("folder-a");
    const { container } = render(SimpleTree, { props: { service } });
    expect(getNodeElement(container, "Leaf")).toBeFalsy();
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
            text: "Leaf",
            data: { kind: "leaf" },
        },
    ],
})("leaf inside expanded branch node is visible", async ({ service }) => {
    service.expandNode("folder-a");
    const { container } = render(SimpleTree, { props: { service } });
    expect(getNodeElement(container, "Leaf")).toBeTruthy();
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
            text: "Leaf",
            data: { kind: "leaf" },
        },
    ],
})("expands collapsed branch node when clicked", async ({ service, user }) => {
    service.collapseNode("folder-a");
    const { container } = render(SimpleTree, { props: { service } });

    const buttons = [
        ...container.querySelectorAll('[role="button"]'),
    ] as HTMLElement[];
    const branchButton = buttons.find(
        (b) =>
            b.querySelector("span.truncate")?.textContent?.trim() === "Alpha",
    )!;
    await user.click(branchButton);

    getNodeElement(container, "Alpha");

    expect(service.isCollapsed("folder-a")).toBe(false);
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
    leafNodes: [],
})("collapses expanded branch node when clicked", async ({ service, user }) => {
    service.expandNode("folder-a");
    const { container } = render(SimpleTree, { props: { service } });

    const buttons = [
        ...container.querySelectorAll('[role="button"]'),
    ] as HTMLElement[];
    const branchButton = buttons.find(
        (b) =>
            b.querySelector("span.truncate")?.textContent?.trim() === "Alpha",
    )!;
    await user.click(branchButton);

    expect(service.isCollapsed("folder-a")).toBe(true);
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
            text: "Leaf",
            data: { kind: "leaf" },
        },
    ],
})("toggle collapsed state", async ({ service }) => {
    service.expandNode("folder-a");
    service.toggleCollapsed("folder-a");

    const { container, rerender } = render(SimpleTree, { props: { service } });

    expect(getNodeElement(container, "A")).toBeTruthy();
    expect(getNodeElement(container, "Leaf")).toBeFalsy();

    service.toggleCollapsed("folder-a");
    await rerender({ service });

    expect(getNodeElement(container, "A")).toBeTruthy();
    expect(getNodeElement(container, "Leaf")).toBeTruthy();
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
            parentId: "folder-a",
            text: "B",
            data: { kind: "folder" },
        },
    ],
    leafNodes: [
        {
            id: "leaf-x",
            parentId: "folder-a",
            text: "Leaf",
            data: { kind: "leaf" },
        },
    ],
})("collapse all branches", ({ service }) => {
    service.expandNode("folder-a");
    service.expandNode("folder-b");
    service.collapseAll();

    const { container } = render(SimpleTree, { props: { service } });

    expect(getNodeElement(container, "A")).toBeTruthy();
    expect(getNodeElement(container, "B")).toBeFalsy();
    expect(getNodeElement(container, "Leaf")).toBeFalsy();
});
