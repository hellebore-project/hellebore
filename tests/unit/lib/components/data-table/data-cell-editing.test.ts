import { screen, waitFor } from "@testing-library/svelte";
import { describe, expect } from "vitest";

import { DataTable } from "@/lib/components/data-table";
import { render } from "@tests/utils/render";

import { test } from "./fixtures";
import { isCellSelected } from "./utils";

describe("text cell editing", () => {
    test("can edit a text cell by clicking it", async ({ user, service }) => {
        render(DataTable, { props: { service } });

        const cell = screen.getByText("Alice").parentElement!;

        // double click the cell to toggle edit mode
        await user.dblClick(cell);

        // edit the cell value
        // this ensures that the newly-rendered text field has focus
        await user.keyboard("[Backspace>9/]");
        await user.keyboard("edited");

        // select another cell to deselect the first cell
        const otherCell = screen.getByText("Active").parentElement!;
        await user.click(otherCell);

        screen.getByText("edited");

        const rowData = service.rows[0];
        expect(rowData.cells.name.value).toBe("edited");
    });

    test("enter toggles edit mode of text cell", async ({ user, service }) => {
        render(DataTable, { props: { service } });

        const cell1 = screen.getByText("Alice").parentElement!;

        // select the cell
        await user.click(cell1);

        // toggle edit mode
        await user.keyboard("{Enter}");

        const input = screen.getByDisplayValue("Alice");
        expect(input.tagName).toBe("INPUT");
    });

    test("toggling edit mode of text cell highlights all of the text", async ({
        user,
        service,
    }) => {
        render(DataTable, { props: { service } });

        const cell1 = screen.getByText("Alice").parentElement!;

        // select the cell
        await user.click(cell1);

        // toggle edit mode
        await user.keyboard("{Enter}");
        screen.getByDisplayValue("Alice");

        // edit the cell value
        await user.keyboard("edited");

        // Enter again to finish edit and move selection down
        await user.keyboard("{Enter}");
        screen.getByText("edited");
        expect(isCellSelected(cell1)).toBe(false);
    });

    test("enter reduces the selection to a single cell before toggling it to edit mode", async ({
        user,
        service,
    }) => {
        render(DataTable, { props: { service } });

        const cell1 = screen.getByText("Alice").parentElement!;
        const cell2 = screen.getByText("John").parentElement!;

        // Select cell1
        await user.click(cell1);

        // Shift+click cell2 to select both cells
        await user.keyboard("{Shift>}");
        await user.click(cell2);

        // Both cells should be selected
        expect(isCellSelected(cell1)).toBe(true);
        expect(isCellSelected(cell2)).toBe(true);

        // Press enter: selection should reduce to cell2 only and enter edit mode
        await user.keyboard("{Enter}");

        // Only cell2 should be selected and in edit mode
        expect(isCellSelected(cell1)).toBe(false);
        expect(isCellSelected(cell2)).toBe(true);

        const input = screen.getByDisplayValue("John");
        expect(input.tagName).toBe("INPUT");
    });

    test("escape cancels edit and restores value of text cell", async ({
        user,
        service,
    }) => {
        render(DataTable, { props: { service } });

        const cell1 = screen.getByText("Alice").parentElement!;

        // Select cell1
        await waitFor(async () => await user.click(cell1));

        // Enter to edit
        await user.keyboard("{Enter}");
        const input = screen.getByDisplayValue("Alice");
        await user.clear(input);
        await user.keyboard("changed");

        // Escape to cancel edit
        await user.keyboard("{Escape}");
        screen.getByText("Alice");
    });
});

describe("select cell editing", () => {
    test.override({
        data: [
            {
                key: "1",
                cells: {
                    name: { value: "Alice" },
                    status: { value: "active" },
                },
            },
        ],
    });

    test("select cell opens a dropdown when in edit mode", async ({
        user,
        service,
    }) => {
        render(DataTable, { props: { service } });

        let cell = screen.getByText("Active").parentElement!;
        await user.dblClick(cell);

        const option = await screen.findByRole("option", { name: "Inactive" });
        await user.click(option);

        cell = screen.getByText("Inactive");
    });

    test("up and down arrow keys move selection of select cell", async ({
        user,
        service,
    }) => {
        render(DataTable, { props: { service } });

        let cell = screen.getByText("Active").parentElement!;

        // HACK: some sort of race condition here; the cell initially has `pointer-events: none`
        // and then becomes clickable after a short delay
        await waitFor(async () => await user.dblClick(cell));
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{Enter}");

        cell = screen.getByText("Inactive");

        await waitFor(async () => await user.dblClick(cell));
        await user.keyboard("{ArrowUp}");
        await user.keyboard("{Enter}");

        screen.getByText("Active");
    });

    test("escape cancels edit and restores value of select cell", async ({
        user,
        service,
    }) => {
        render(DataTable, { props: { service } });

        const cell = screen.getByText("Active").parentElement!;

        await waitFor(async () => await user.click(cell));

        await user.keyboard("{Enter}");
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{Escape}");

        screen.getByText("Active");
    });
});
