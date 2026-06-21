import { screen } from "@testing-library/react";
import { expect } from "vitest";

import { render } from "@tests/utils/render";

import { test } from "./fixtures";
import DataTableWithDeleteButton from "./data-table-with-delete-button.svelte";

test("can delete a row", async ({ user, service }) => {
    render(DataTableWithDeleteButton, { props: { service } });

    expect(service.rows.length).toBe(2);

    const cell1 = screen.getByText("Alice").parentElement!;
    user.hover(cell1);

    const deleteButtons = screen.getAllByRole("button", { name: "Delete Row" });
    const deleteBtn = deleteButtons[0];
    await user.click(deleteBtn);

    expect(screen.queryByText("Alice")).toBeNull();

    expect(service.rows.length).toBe(1);
});
