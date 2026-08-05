import { screen } from "@testing-library/svelte";

import { Pagination } from "@/lib/components/pagination";
import { render } from "@tests/utils/render";

import { test } from "./fixtures";

test("displays current page", async ({ user, service }) => {
    render(Pagination, { props: { service } });
    screen.getByText("Page 3 of 5");
});

test("go to first page", async ({ user, service }) => {
    render(Pagination, { props: { service } });

    const firstPageButton = screen.getByRole("button", { name: "First Page" });
    await user.click(firstPageButton);

    screen.getByText("Page 1 of 5");
});

test("go to last page", async ({ user, service }) => {
    render(Pagination, { props: { service } });

    const lastPageButton = screen.getByRole("button", { name: "Last Page" });
    await user.click(lastPageButton);

    screen.getByText("Page 5 of 5");
});

test("go to previous page", async ({ user, service }) => {
    render(Pagination, { props: { service } });

    const previousPageButton = screen.getByRole("button", {
        name: "Previous Page",
    });
    await user.click(previousPageButton);

    screen.getByText("Page 2 of 5");
});

test("go to next page", async ({ user, service }) => {
    render(Pagination, { props: { service } });

    const nextPageButton = screen.getByRole("button", { name: "Next Page" });
    await user.click(nextPageButton);

    screen.getByText("Page 4 of 5");
});

test.extend({ page: 0 })(
    "going to first page no-ops when on first page",
    async ({ user, service }) => {
        render(Pagination, { props: { service } });

        screen.getByText("Page 1 of 5");

        const firstPageButton = screen.getByRole("button", {
            name: "First Page",
        });
        await user.click(firstPageButton);

        screen.getByText("Page 1 of 5");
    },
);

test.extend({ page: 4 })(
    "going to last page no-ops when on last page",
    async ({ user, service }) => {
        render(Pagination, { props: { service } });

        screen.getByText("Page 5 of 5");

        const lastPageButton = screen.getByRole("button", {
            name: "Last Page",
        });
        await user.click(lastPageButton);

        screen.getByText("Page 5 of 5");
    },
);

test.extend({ page: 0 })(
    "going to previous page no-ops when on first page",
    async ({ user, service }) => {
        render(Pagination, { props: { service } });

        screen.getByText("Page 1 of 5");

        const previousPageButton = screen.getByRole("button", {
            name: "Previous Page",
        });
        await user.click(previousPageButton);

        screen.getByText("Page 1 of 5");
    },
);

test.extend({ page: 4 })(
    "going to next page no-ops when on last page",
    async ({ user, service }) => {
        render(Pagination, { props: { service } });

        screen.getByText("Page 5 of 5");

        const nextPageButton = screen.getByRole("button", {
            name: "Next Page",
        });
        await user.click(nextPageButton);

        screen.getByText("Page 5 of 5");
    },
);
