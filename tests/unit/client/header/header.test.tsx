import { screen } from "@testing-library/react";
import { describe, expect } from "vitest";

import { Center, Header, Modal } from "@/client";
import { EntityType, EntryArticleResponse, EntryType } from "@/domain";
import { mockCloseProject, mockGetEntryArticle } from "@tests/utils/mocks";
import { render } from "@tests/utils/render";

import { test } from "./fixtures";

test("clicking the Home button opens the home view", async ({
    user,
    clientManager,
    headerManager,
    project,
}) => {
    clientManager.central.openSettings();

    render(
        <>
            <Header service={headerManager} />
            <Center service={clientManager.central.activePanelService} />
        </>,
    );

    const homeBtn = screen.getByRole("button", { name: "Home" });
    await user.click(homeBtn);

    render(<Center service={clientManager.central.activePanelService} />);

    screen.getByDisplayValue(project.name);
});

test("clicking the New Project button opens the project creator", async ({
    user,
    clientManager,
    headerManager,
}) => {
    render(
        <>
            <Header service={headerManager} />
            <Modal service={clientManager.modal} />
        </>,
    );

    const appBtn = screen.getByRole("button", { name: "File" });
    await user.click(appBtn);

    const newProjectBtn = screen.getByRole("menuitem", { name: "New Project" });
    await user.click(newProjectBtn);

    screen.getByText("Create a new project");
});

test("clicking the Open Project button loads another project", async ({
    headerManager,
}) => {
    render(<Header service={headerManager} />);
    // TODO: not clear how to mock the `open` function in the tauri API
});

describe("clicking the Close Project button", () => {
    test("hides the Close Project button", async ({
        user,
        mockedInvoker,
        headerManager,
    }) => {
        mockCloseProject(mockedInvoker);

        render(<Header service={headerManager} />);

        const appBtn = screen.getByRole("button", { name: "File" });
        await user.click(appBtn);

        const newProjectBtn = screen.getByRole("menuitem", {
            name: "Close Project",
        });
        await user.click(newProjectBtn);

        expect(
            screen.queryByRole("menuitem", { name: "Close Project" }),
        ).toBeNull();
    });
});

test("clicking the New Entry button opens the entry creator", async ({
    user,
    clientManager,
    headerManager,
}) => {
    render(
        <>
            <Header service={headerManager} />
            <Modal service={clientManager.modal} />
        </>,
    );

    const appBtn = screen.getByRole("button", { name: "File" });
    await user.click(appBtn);

    const newProjectBtn = screen.getByRole("menuitem", { name: "New Entry" });
    await user.click(newProjectBtn);

    screen.getByText("Create a new entry");
});

test("clicking the Settings button opens the settings editor", async ({
    user,
    clientManager,
    headerManager,
}) => {
    render(
        <>
            <Header service={headerManager} />
            <Center service={clientManager.central.activePanelService} />
        </>,
    );

    const appBtn = screen.getByRole("button", { name: "File" });
    await user.click(appBtn);

    const settingsBtn = screen.getByRole("menuitem", { name: "Settings" });
    await user.click(settingsBtn);

    render(<Center service={clientManager.central.activePanelService} />);

    screen.getByText("Settings");
});

describe("search bar", () => {
    test.scoped({
        otherEntries: async ({}, use) => {
            use([
                {
                    id: 2,
                    // TODO: remove cast once generic entries are supported
                    entityType: EntityType.ENTRY as unknown as EntryType,
                    folderId: -1,
                    title: "mocked-entry-2",
                },
            ]);
        },
    });

    test("typing keyword in search field opens a list of options", async ({
        user,
        headerManager,
        entryTitle,
    }) => {
        headerManager.entrySearch.queryPeriod = 0;

        render(<Header service={headerManager} />);

        const searchBar = screen.getByPlaceholderText("Search");
        await user.click(searchBar);

        await user.keyboard("mocked");

        screen.getByText(entryTitle);
        screen.getByText("mocked-entry-2");
    });

    test("typing keyword with zero matches results in empty dropdown", async ({
        user,
        headerManager,
        entryTitle,
    }) => {
        headerManager.entrySearch.queryPeriod = 0;

        render(<Header service={headerManager} />);

        const searchBar = screen.getByPlaceholderText("Search");
        await user.click(searchBar);

        await user.keyboard("no-matches");

        screen.getByText("No results");
    });

    test("clicking an option opens the entry editor", async ({
        user,
        clientManager,
        headerManager,
        mockedEntryArticle,
        entryTitle,
    }) => {
        headerManager.entrySearch.queryPeriod = 0;

        const { rerender } = render(<Header service={headerManager} />);

        const searchBar = screen.getByPlaceholderText("Search");
        await user.click(searchBar);

        await user.keyboard("mocked");

        const option = screen.getByText(entryTitle);
        await user.click(option);

        rerender(<Center service={clientManager.central.activePanelService} />);

        screen.getByDisplayValue(entryTitle);
    });

    test("selecting an option with the keyboard opens the entry editor", async ({
        user,
        mockedInvoker,
        clientManager,
        headerManager,
        entryInfo,
        entryArticle,
    }) => {
        entryInfo.title = "mocked-entry-2";
        const entryWithArticle: EntryArticleResponse = {
            info: entryInfo,
            text: entryArticle,
        };
        mockGetEntryArticle(mockedInvoker, entryWithArticle);

        headerManager.entrySearch.queryPeriod = 0;

        const { rerender } = render(<Header service={headerManager} />);

        const searchBar = screen.getByPlaceholderText("Search");
        await user.click(searchBar);

        await user.keyboard("mocked");

        await user.keyboard("{ArrowDown}");
        await user.keyboard("{ArrowDown}");
        await user.keyboard("{Enter}");

        rerender(<Center service={clientManager.central.activePanelService} />);

        screen.getByDisplayValue("mocked-entry-2");
    });
});
