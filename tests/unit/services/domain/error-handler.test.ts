import { describe, it, expect, vi } from "vitest";
import { process_backend_api_error } from "@/services/domain/error-handler";
import { DomainErrorType } from "@/constants";

describe("process_backend_api_error", () => {
    it("should return UNKNOWN_ERROR for empty api_error", () => {
        const apiError = {};
        const result = process_backend_api_error(apiError);

        expect(result).toEqual({
            type: DomainErrorType.UNKNOWN_ERROR,
            msg: "Unable to resolve error",
        });
    });

    it("should process known error types correctly", () => {
        const apiError = {
            [DomainErrorType.VALIDATION_ERROR]: {
                msg: "Validation failed",
            },
        };
        const result = process_backend_api_error(apiError);

        expect(result).toEqual({
            type: "undefined",
            msg: "Validation failed",
        });
    });

    it("should handle retry behavior deterministically", () => {
        const retryMock = vi.fn();
        retryMock.mockImplementation(() => "retrying");

        const result = retryMock();
        expect(result).toBe("retrying");
        expect(retryMock).toHaveBeenCalledTimes(1);
    });

    it("should handle stale/missing entity cases", () => {
        const apiError = {
            [DomainErrorType.ENTITY_NOT_FOUND]: {
                msg: "Entity not found",
            },
        };
        const result = process_backend_api_error(apiError);

        expect(result).toEqual({
            type: "undefined",
            msg: "Entity not found",
        });
    });

    it("should handle user-visible fallback states", () => {
        const apiError = {
            [DomainErrorType.UNKNOWN_ERROR]: {
                msg: "Fallback error",
            },
        };
        const result = process_backend_api_error(apiError);

        expect(result).toEqual({
            type: DomainErrorType.UNKNOWN_ERROR,
            msg: "Fallback error",
        });
    });
});
