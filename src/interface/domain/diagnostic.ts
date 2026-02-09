import type { BackendApiError } from "./error";

export interface DiagnosticResponse<T> {
    data: T;
    errors: BackendApiError[];
}
