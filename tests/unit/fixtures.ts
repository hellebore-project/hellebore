import { cleanup } from "@testing-library/svelte";
import userEvent, { type UserEvent } from "@testing-library/user-event";
import { test as baseTest } from "vitest";

export interface BaseUnitTestFixtures {
    context: void;
    user: UserEvent;
}

export const test = baseTest.extend<BaseUnitTestFixtures>({
    context: [
        async ({}, use) => {
            await use();

            cleanup();
        },
        { auto: true },
    ],
    user: [
        async ({}, use) => {
            await use(userEvent.setup());
        },
        { auto: true },
    ],
});
