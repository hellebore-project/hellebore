import { screen, within } from "@testing-library/svelte";
import { expect, vi } from "vitest";

import { render } from "@tests/utils/render";

import { test } from "./fixtures";
import DataTableWithPlugins from "./data-table-with-plugins.svelte";

test("can delete a row", async ({ user, service }) => {
    render(DataTableWithPlugins, { props: { service } });

    expect(service.rows.length).toBe(2);

    const cell1 = screen.getByText("Alice").parentElement!;
    user.hover(cell1);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete Row" });
    const deleteBtn = deleteButtons[0];
    await user.click(deleteBtn);

    expect(screen.queryByText("Alice")).toBeNull();

    expect(service.rows.length).toBe(1);
});

test("predefined insert actions receive the highlighted row key", async ({
    user,
    service,
}) => {
    const onInsertRowAbove = vi.fn();
    const onInsertRowBelow = vi.fn();

    render(DataTableWithPlugins, {
        props: {
            service,
            onAddRow: vi.fn(),
            onInsertRowAbove,
            onInsertRowBelow,
        },
    });

    const row = screen.getByText("Alice").closest("tr")!;
    await user.hover(row);
    await user.click(
        within(row).getByRole("button", { name: "Insert Row Above" }),
    );
    await user.click(
        within(row).getByRole("button", { name: "Insert Row Below" }),
    );

    expect(onInsertRowAbove).toHaveBeenCalledWith("1");
    expect(onInsertRowBelow).toHaveBeenCalledWith("1");
});
