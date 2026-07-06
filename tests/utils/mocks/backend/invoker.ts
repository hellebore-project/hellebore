import { InvokeArgs } from "@tauri-apps/api/core";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { expect, MockInstance, vi } from "vitest";

type TauriInvoke = (name: string, args?: InvokeArgs) => unknown;

interface TauriInternals {
    invoke(name: string, args?: InvokeArgs): unknown;
}

export type MockedCommand = (args: unknown) => unknown;

const DEFAULT_COMMAND: MockedCommand = () => {
    return;
};

export class MockedInvoker {
    private _commands: Map<string, MockedCommand>;
    private _responses: Map<string, Map<unknown, unknown>>;
    private _spy: MockInstance<TauriInvoke> | null = null;

    constructor() {
        this._commands = new Map();
        this._responses = new Map();
    }

    get spy() {
        if (!this._spy)
            throw "Unable to retrieve spy; IPC with the backend was not mocked.";
        return this._spy;
    }

    inject() {
        mockIPC((name, args) => {
            const command = this._commands.get(name);
            if (!command) throw `Command ${name} has not been mocked.`;
            return command(args);
        });

        // @ts-expect-error: since __TAURI_INTERNALS__ is injected at runtime, the linter isn't aware of it
        const internals = window.__TAURI_INTERNALS__ as TauriInternals;
        this._spy = vi.spyOn(internals, "invoke");
    }

    clear() {
        clearMocks();
    }

    mockCommand(name: string, command: unknown = DEFAULT_COMMAND) {
        this._commands.set(name, command as MockedCommand);
    }

    mockResponse(name: string, args: unknown, response: unknown) {
        if (!this._responses.has(name)) {
            this._responses.set(name, new Map());
        }
        this._responses.get(name)!.set(args, response);
    }

    getResponse(name: string, args: unknown) {
        const responses = this._responses.get(name);
        if (!responses) return null;
        return responses.get(args);
    }

    expectCalled(name: string) {
        for (const [_name] of this.spy.mock.calls) {
            if (name === _name) return;
        }
        throw `Command ${name} was not called.`;
    }

    expectCalledWith(name: string, args?: unknown) {
        for (const [commandName, commandArgs] of this.spy.mock.calls) {
            if (commandName !== name) continue;
            expect(commandArgs).toStrictEqual(args);
            return;
        }

        throw `Command ${name} was not called with the expected payload.`;
    }
}
