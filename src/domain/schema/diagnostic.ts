import { ApiError } from "./error";

export interface DiagnosticResponse<T> {
    data: T;
    errors: ApiError[];
}
