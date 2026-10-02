import { screen } from "@testing-library/svelte";
import { expect, vi } from "vitest";

import { render } from "@tests/utils";

import { test } from "./fixtures";
import DataTableWithPlugins from "./data-table-with-plugins.svelte";

test("renders the placeholder when the table is empty", async ({
    user,
    service,
}) => {
    service.load([]);
    const onAddRow = vi.fn();

    render(DataTableWithPlugins, { props: { service, onAddRow } });

    screen.getByRole("button", { name: "Add Row" });
});

test("clicking the add-row placeholder adds a new row", async ({
    user,
    service,
}) => {
    service.load([]);
    const onAddRow = () =>
        service.appendRow({
            key: "new-row",
            cells: {
                name: {
                    value: "",
                },
                status: {
                    value: "active",
                },
            },
        });

    render(DataTableWithPlugins, { props: { service, onAddRow } });

    await user.click(screen.getByRole("button", { name: "Add Row" }));

    expect(service.rows).toHaveLength(1);
});

test("does not render the placeholder while rows are displayed", ({
    service,
}) => {
    render(DataTableWithPlugins, {
        props: { service, onAddRow: vi.fn() },
    });

    expect(screen.queryByRole("button", { name: "Add Row" })).toBeNull();
    screen.getByText("Alice");
});
