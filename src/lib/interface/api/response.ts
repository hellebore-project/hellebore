import { ApiError } from "./error";

export interface RichResponse<T> {
    data: T;
    errors: ApiError[];
}
