import { screen, within } from "@testing-library/svelte";
import { describe, expect } from "vitest";

import { DataTable } from "@/lib/components/data-table";
import { render } from "@tests/utils";

import { test } from "./fixtures";

describe("column headers", () => {
    test("renders column header labels", ({ service }) => {
        render(DataTable, { props: { service } });

        screen.getByRole("columnheader", { name: /Name/i });
        screen.getByRole("columnheader", { name: /Status/i });
    });
});

describe("filtering columns", () => {
    test("typing in a text filter hides non-matching rows", async ({
        user,
        service,
    }) => {
        render(DataTable, { props: { service } });

        const nameHeader = screen.getByRole("columnheader", { name: /Name/i });
        await user.click(within(nameHeader).getByRole("button"));

        await user.type(screen.getByPlaceholderText("Filter..."), "John");

        expect(screen.queryByText("Alice")).toBeNull();
        screen.getByText("John");
    });

    test("clearing the text filter restores all rows", async ({
        user,
        service,
    }) => {
        render(DataTable, { props: { service } });

        const nameHeader = screen.getByRole("columnheader", { name: /Name/i });
        await user.click(within(nameHeader).getByRole("button"));

        const filterInput = screen.getByPlaceholderText("Filter...");
        await user.type(filterInput, "John");
        await user.clear(filterInput);

        screen.getByText("Alice");
        screen.getByText("John");
    });

    test("unchecking a select filter item hides matching rows", async ({
        user,
        service,
    }) => {
        render(DataTable, { props: { service } });

        const statusHeader = screen.getByRole("columnheader", {
            name: /Status/i,
        });

        const filterButton = within(statusHeader).getByRole("button");
        await user.click(filterButton);

        const menuItem = await screen.findByRole("menuitemcheckbox", {
            name: "Active",
        });
        await user.click(menuItem);

        expect(screen.queryByText("Alice")).toBeNull();
        screen.getByText("John");
    });
});
