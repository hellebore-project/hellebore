import { EntityType } from "@/domain/constants";
import {
    ApiError,
    BaseDomainError,
    DomainErrorType,
    DomainMessageError,
    FieldNotUniqueError,
} from "@/domain/schema";

export function process_api_error(api_error: ApiError): BaseDomainError {
    const keys = Object.keys(api_error).filter((key) =>
        Object.values(DomainErrorType).includes(key as DomainErrorType),
    );
    if (keys.length == 0)
        return {
            type: DomainErrorType.UNKNOWN_ERROR,
            msg: "Unable to resolve error",
        } as DomainMessageError;

    const type = keys[0] as DomainErrorType;
    return { type, ...api_error[type] };
}

export function is_field_unique(
    error: BaseDomainError,
    entityType: EntityType,
    fieldName: string,
): boolean {
    if (error.type !== DomainErrorType.FIELD_NOT_UNIQUE) return true;
    const _error = error as FieldNotUniqueError;
    if (_error.entityType == entityType && _error.key == fieldName)
        return false;
    return true;
}
