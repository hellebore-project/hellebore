import { describe, it, expect } from "vitest";

import {
    BackendApiError,
    DomainErrorType,
    process_backend_api_error,
} from "@/api";

describe("process_backend_api_error", () => {
    it("should return UNKNOWN_ERROR for empty api_error", () => {
        const apiError = {} as unknown as BackendApiError;
        const result = process_backend_api_error(apiError);

        expect(result).toEqual({
            type: DomainErrorType.UNKNOWN_ERROR,
            msg: "Unable to resolve error",
        });
    });
});
