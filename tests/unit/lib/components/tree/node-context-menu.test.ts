import { screen } from "@testing-library/svelte";
import { expect, vi } from "vitest";

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
})("open leaf node context menu", async ({ service, user }) => {
    const onClickContextMenuItem = vi.fn();
    const { container } = render(SimpleTree, {
        props: {
            service,
            onClickContextMenuItem,
        },
    });

    const node = getNode(container, "X");
    // HACK: some race condition isn't being handled here
    await new Promise((resolve) => setTimeout(resolve, 100));
    await user.pointer({ keys: "[MouseRight]", target: node });

    const menuItem = screen.getByRole("menuitem", {
        name: "Leaf Context Menu Test",
    });
    await user.click(menuItem);

    const menu = screen.queryByRole("menu");
    expect(menu).toBeNull();

    expect(onClickContextMenuItem).toHaveBeenCalledOnce();
});

test.extend({
    branchNodes: [
        {
            id: "branch-a",
            parentId: "root",
            text: "Alpha",
            data: { kind: "branch" },
        },
    ],
})("open branch node context menu", async ({ service, user }) => {
    const onClickContextMenuItem = vi.fn();
    const { container } = render(SimpleTree, {
        props: {
            service,
            onClickContextMenuItem,
        },
    });

    const node = getNode(container, "Alpha");
    // HACK: some race condition isn't being handled here
    await new Promise((resolve) => setTimeout(resolve, 100));
    await user.pointer({ keys: "[MouseRight]", target: node });

    const menuItem = screen.getByRole("menuitem", {
        name: "Branch Context Menu Test",
    });
    await user.click(menuItem);

    const menu = screen.queryByRole("menu");
    expect(menu).toBeNull();

    expect(onClickContextMenuItem).toHaveBeenCalledOnce();
});
