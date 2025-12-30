import {
    BackendApiError,
    BaseDomainError,
    DomainErrorType,
    DomainMessageError,
} from "@/domain/schema";

export function process_backend_api_error(
    api_error: BackendApiError,
): BaseDomainError {
    const keys = Object.keys(api_error);
    if (keys.length == 0)
        return {
            type: DomainErrorType.UNKNOWN_ERROR,
            msg: "Unable to resolve error",
        } as DomainMessageError;

    const type = keys[0] as DomainErrorType;
    return { type, ...api_error[type] };
}
