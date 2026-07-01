import { screen } from "@testing-library/svelte";
import { expect } from "vitest";

import { DataTable } from "@/lib/components/data-table";
import { render } from "@tests/utils";

import { test } from "./fixtures";
import { isCellSelected } from "./utils";

test("clicking a cell selects only that cell", async ({ user, service }) => {
    render(DataTable, { props: { service } });

    const cell1 = screen.getByText("Alice").parentElement!;
    const cell2 = screen.getByText("Active").parentElement!;

    // Click cell1
    await user.click(cell1);
    expect(isCellSelected(cell1)).toBe(true);
    expect(isCellSelected(cell2)).toBe(false);

    // Click cell2
    await user.click(cell2);
    expect(isCellSelected(cell2)).toBe(true);
    expect(isCellSelected(cell1)).toBe(false);
});

test("ctrl+click adds to selection and makes it active", async ({
    user,
    service,
}) => {
    render(DataTable, { props: { service } });

    const cell1 = screen.getByText("Alice").parentElement!;
    const cell2 = screen.getByText("Active").parentElement!;

    // Click cell1
    await user.click(cell1);
    expect(isCellSelected(cell1)).toBe(true);

    // Ctrl+click cell2
    await user.keyboard("{Control>}");
    await user.click(cell2);
    expect(isCellSelected(cell1)).toBe(true);
    expect(isCellSelected(cell2)).toBe(true);
});

test("shift+click selects a range", async ({ user, service }) => {
    render(DataTable, { props: { service } });

    const cell1 = screen.getByText("Alice").parentElement!;
    const cell2 = screen.getByText("Active").parentElement!;

    // Click cell1
    await user.click(cell1);

    // Shift+click cell2
    await user.keyboard("{Shift>}");
    await user.click(cell2);

    expect(isCellSelected(cell1)).toBe(true);
    expect(isCellSelected(cell2)).toBe(true);
});

test("dragging from one cell to another selects a rectangle", async ({
    user,
    service,
}) => {
    render(DataTable, { props: { service } });

    const cell1 = screen.getByText("Alice").parentElement!;
    const cell2 = screen.getByText("Active").parentElement!;

    // Mouse down on cell1, drag to cell2, mouse up
    await user.pointer({ target: cell1, keys: "[MouseLeft>]" });
    await user.pointer({ target: cell2 });
    await user.pointer({ target: cell2, keys: "[/MouseLeft]" });

    expect(isCellSelected(cell1)).toBe(true);
    expect(isCellSelected(cell2)).toBe(true);
});

test("clicking outside deselects all cells", async ({ user, service }) => {
    const outside = document.createElement("div");
    outside.setAttribute("data-testid", "outside");
    document.body.appendChild(outside);

    render(DataTable, { props: { service } });

    const cell1 = screen.getByText("Alice").parentElement!;

    // Click cell1
    await user.click(cell1);
    expect(isCellSelected(cell1)).toBe(true);

    // Click outside
    await user.click(screen.getByTestId("outside"));
    expect(isCellSelected(cell1)).toBe(false);
});

test("arrow keys move selection", async ({ user, service }) => {
    render(DataTable, { props: { service } });

    const cell1 = screen.getByText("Alice").parentElement!;
    const cell2 = screen.getByText("Active").parentElement!;

    // Select first cell
    await user.click(cell1);
    expect(isCellSelected(cell1)).toBe(true);

    // Arrow right to cell2
    await user.keyboard("{ArrowRight}");
    expect(isCellSelected(cell2)).toBe(true);

    // Arrow left back to cell1
    await user.keyboard("{ArrowLeft}");
    expect(isCellSelected(cell1)).toBe(true);

    // Arrow down to new row
    await user.keyboard("{ArrowDown}");
    expect(isCellSelected(cell1)).toBe(false);

    // Arrow up to first row
    await user.keyboard("{ArrowUp}");
    expect(isCellSelected(cell1)).toBe(true);
});

test("arrow keys reduce the selection to a single cell before moving", async ({
    user,
    service,
}) => {
    render(DataTable, { props: { service } });

    let cell1 = screen.getByText("Alice").parentElement!;
    let cell2 = screen.getByText("Active").parentElement!;

    // Select cell1
    await user.click(cell1);

    // Shift+click cell2 to select both cells
    await user.keyboard("{Shift>}");
    await user.click(cell2);

    // Both cells should be selected
    expect(isCellSelected(cell1)).toBe(true);
    expect(isCellSelected(cell2)).toBe(true);

    // Arrow right: selection should reduce to cell2 only
    await user.keyboard("{ArrowRight}");

    cell1 = screen.getByText("Alice").parentElement!;
    cell2 = screen.getByText("Active").parentElement!;

    expect(isCellSelected(cell1)).toBe(false);
    expect(isCellSelected(cell2)).toBe(true);

    // Arrow left: selection should reduce to cell1 only
    await user.keyboard("{ArrowLeft}");
    expect(isCellSelected(cell1)).toBe(true);
    expect(isCellSelected(cell2)).toBe(false);
});
