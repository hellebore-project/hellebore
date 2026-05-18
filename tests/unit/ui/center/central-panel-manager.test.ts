import { expect } from "vitest";

import { CentralViewType } from "@/constants";
import { test } from "@tests/unit/ui/fixtures";

test("can iterate over open panel services", async ({ clientManager }) => {
    const services = [...clientManager.central.iteratePanels()];
    expect(services.length).toBe(1);

    const service = services[0];
    expect(service.type).toBe(CentralViewType.Home);
});
