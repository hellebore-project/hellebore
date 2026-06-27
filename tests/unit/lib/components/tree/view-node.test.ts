import { expect } from "vitest";

import { render } from "@tests/utils";

import { test, getChildNodeNames, getRootNodeNames } from "./fixtures";
import SimpleTree from "./simple-tree.svelte";

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
            text: "Bravo",
            data: { kind: "folder" },
        },
    ],
    leafNodes: [
        {
            id: "leaf-a",
            parentId: "folder-a",
            text: "Charlie",
            data: { kind: "leaf" },
        },
    ],
})("branch with leaf nodes", ({ service }) => {
    const { container } = render(SimpleTree, { props: { service } });

    expect(getChildNodeNames(container, "Alpha")).toStrictEqual([
        "Bravo",
        "Charlie",
    ]);
    expect(getChildNodeNames(container, "Bravo")).toStrictEqual([]);
    expect(getChildNodeNames(container, "Missing")).toStrictEqual([]);
});

test.extend({
    branchNodes: [
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
    leafNodes: [
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
})(
    "loads nodes and sorts children with folders first then alphabetical within type",
    ({ service }) => {
        const { container } = render(SimpleTree, { props: { service } });

        const rootLabels = getRootNodeNames(container);
        expect(rootLabels).toStrictEqual(["Alpha", "Bravo", "Beta", "Charlie"]);

        const rootList = container.querySelector("ul")!;
        const rootItems = [...rootList.children] as HTMLElement[];
        const folderAItem = rootItems[0];
        const nestedList = folderAItem.querySelector("ul")!;
        const nestedItems = [...nestedList.children] as HTMLElement[];
        const nestedLabels = nestedItems.map((li) =>
            li.querySelector("span.truncate")?.textContent?.trim(),
        );
        expect(nestedLabels).toStrictEqual(["Zulu", "Alpha Leaf"]);
    },
);
