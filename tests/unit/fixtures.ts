import userEvent, { type UserEvent } from "@testing-library/user-event";
import { test as baseTest } from "vitest";

export interface BaseUnitTestFixtures {
    user: UserEvent;
}

export const test = baseTest.extend<BaseUnitTestFixtures>({
    user: [
        async ({}, use) => {
            await use(userEvent.setup());
        },
        { auto: true },
    ],
});
