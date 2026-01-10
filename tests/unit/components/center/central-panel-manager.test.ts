import { expect } from "vitest";

import { CentralViewType } from "@/constants";
import { test } from "@tests/unit/components/fixtures";

test("can iterate over open panel services", async ({ clientManager }) => {
    const services = [...clientManager.central.iterateOpenPanels()];
    expect(services.length).toBe(1);

    const service = services[0];
    expect(service.type).toBe(CentralViewType.Home);
});
