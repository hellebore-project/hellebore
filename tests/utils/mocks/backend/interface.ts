import { MockedInvoker } from "./invoker";

export interface AddMockedCommandArgs {
    mockedInvoker: MockedInvoker;
    error?: string | Error;
}
