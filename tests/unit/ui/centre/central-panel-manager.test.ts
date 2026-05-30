import { expect } from "vitest";

import { CentralViewType, EntryViewType, ViewAction } from "@/constants";
import type { EntryPropertyResponse } from "@/api";
import { mockGetEntryProperties } from "@tests/utils/mocks";
import { test } from "@tests/unit/ui/fixtures";

test("opening the home panel twice reuses the same service", async ({
    clientManager,
    project,
}) => {
    const firstHome = clientManager.central.openHome(project);
    const secondHome = clientManager.central.openHome(project);

    expect(secondHome).toBe(firstHome);
    expect(clientManager.central.panelCount).toBeGreaterThan(0);
    expect(clientManager.central.activePanelService?.type).toBe(
        CentralViewType.Home,
    );
});

test("opening the same entry editor twice emits one create event", async ({
    clientManager,
    entryId,
    mockedInvoker,
    mockedEntryInfo,
}) => {
    mockGetEntryProperties(mockedInvoker, {
        info: mockedEntryInfo,
        properties: { name: "mocked-property-name" },
    } as EntryPropertyResponse);

    const panelEvents: { action: ViewAction; details: { id: string } }[] = [];
    clientManager.central.onChangePanel.subscribe((event) => {
        panelEvents.push({
            action: event.action,
            details: { id: event.details.id },
        });
    });

    const firstService = await clientManager.central.openEntryEditor({
        id: entryId,
        viewKey: EntryViewType.PropertyEditor,
    });

    const secondService = await clientManager.central.openEntryEditor({
        id: entryId,
        viewKey: EntryViewType.PropertyEditor,
    });

    expect(secondService).toBe(firstService);

    const createEvents = panelEvents.filter(
        (event) =>
            event.action === ViewAction.Create &&
            event.details.id === firstService.id,
    );
    expect(createEvents).toHaveLength(1);
});

test("can iterate over open panel services", async ({ clientManager }) => {
    const services = [...clientManager.central.iteratePanels()];
    expect(services.length).toBe(1);

    const service = services[0];
    expect(service.type).toBe(CentralViewType.Home);
});
