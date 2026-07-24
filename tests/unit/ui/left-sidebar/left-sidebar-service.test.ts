import { screen, waitFor } from "@testing-library/svelte";
import { expect } from "vitest";

import { test } from "./fixtures";
import { render } from "@tests/utils";
import { LeftSidebar } from "@/ui/left-sidebar";

test("update the title of the currently-displayed entry", async ({
    leftSidebarService,
    entrySpotlightService,
    entryEditorNavigatorService,
    entryId,
    entryTitle,
}) => {
    render(LeftSidebar, { props: { service: leftSidebarService } });

    await waitFor(() => {
        // node label in the spotlight section
        expect(screen.getByText(entryTitle)).toBeTruthy();

        // header of the entry-editor-nav section
        expect(screen.getByText(entryTitle.toUpperCase())).toBeTruthy();
    });

    leftSidebarService.updateDisplayedEntryTitle(entryId, "renamed");

    const nodeId = entrySpotlightService.generateEntryNodeId(entryId);
    const node = entrySpotlightService.tree.getNode(nodeId);
    expect(node?.text).toBe("renamed");
    expect(entryEditorNavigatorService.title).toBe("renamed");

    await waitFor(() => {
        expect(screen.getByText("renamed")).toBeTruthy();
        expect(screen.getByText("RENAMED")).toBeTruthy();
    });
});
