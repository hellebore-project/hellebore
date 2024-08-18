import { ApiError } from "./error";

export interface UpdateResponse<T> {
    data: T;
    errors: ApiError[];
}
