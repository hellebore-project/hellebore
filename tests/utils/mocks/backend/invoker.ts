import { InvokeArgs } from "@tauri-apps/api/core";
import { clearMocks, mockIPC } from "@tauri-apps/api/mocks";
import { expect, MockInstance, vi } from "vitest";

type TauriInvoke = (name: string, args?: InvokeArgs) => any;

interface TauriInternals {
    invoke(name: string, args?: InvokeArgs): any;
}

export type MockedCommand = (args: any) => any;

export class MockedInvoker {
    commands: Map<string, MockedCommand>;
    private _spy: MockInstance<TauriInvoke> | null = null;

    constructor() {
        this.commands = new Map();
    }

    get spy() {
        if (!this._spy)
            throw "Unable to retrieve spy; IPC with the backend was not mocked.";
        return this._spy;
    }

    inject() {
        mockIPC((name, args) => {
            const command = this.commands.get(name);
            if (!command) throw `Command ${name} has not been mocked.`;
            return command(args);
        });

        // @ts-ignore
        const internals = window.__TAURI_INTERNALS__ as TauriInternals;
        this._spy = vi.spyOn(internals, "invoke");
    }

    clear() {
        clearMocks();
    }

    mockCommand(name: string, command: MockedCommand) {
        this.commands.set(name, command);
    }

    expectCalled(name: string) {
        for (const [_name] of this.spy.mock.calls) {
            if (name === _name) return;
        }
        throw `Command ${name} was not called.`;
    }

    expectCalledWith(name: string, args?: any) {
        expect(this.spy).toHaveBeenCalledWith(name, args);
    }
}
