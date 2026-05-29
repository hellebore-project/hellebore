import { describe, it, expect, vi } from "vitest";

import { process_backend_api_error } from "@/api/client/error-handler";
import type { BackendApiError } from "@/api/interface";
import { DomainErrorType } from "@/constants";

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
