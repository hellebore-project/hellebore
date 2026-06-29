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
})("edit node text", async ({ service, user }) => {
    const { container, rerender } = render(SimpleTree, { props: { service } });

    const nodeData = service.getNode("leaf-a")!;
    service.makeNodeEditable(nodeData);

    await rerender({ service });

    await user.keyboard("-edited");

    const rootDropTarget = screen.getByTestId("tree-root-drop-target");
    await user.click(rootDropTarget);

    getNode(container, "Leaf-edited");
});
