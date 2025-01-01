import { ApiError } from "./error";

export interface ResponseWithDiagnostics<T> {
    data: T;
    errors: ApiError[];
}
