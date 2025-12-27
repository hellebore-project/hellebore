import { EntityType } from "@/domain/constants";
import {
    BackendApiError,
    BaseDomainError,
    DomainErrorType,
    DomainMessageError,
    FieldNotUniqueError,
    FieldNotUpdatedError,
    NotUpdatedError,
} from "@/domain/schema";

export function process_backend_api_error(
    api_error: BackendApiError,
): BaseDomainError {
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

export function is_table_not_updated(
    error: BaseDomainError,
    entityType: EntityType,
): boolean {
    if (error.type !== DomainErrorType.NOT_UPDATED) return false;

    const _error = error as NotUpdatedError;
    return _error.entityType == entityType;
}

export function is_field_non_unique(
    error: BaseDomainError,
    entityType: EntityType,
    fieldName: string,
): boolean {
    if (error.type !== DomainErrorType.FIELD_NOT_UNIQUE) return false;

    const _error = error as FieldNotUniqueError;
    return _error.entityType == entityType && _error.key == fieldName;
}

export function is_field_not_updated(
    error: BaseDomainError,
    entityType: EntityType,
    fieldName: string,
): boolean {
    if (error.type !== DomainErrorType.FIELD_NOT_UPDATED) return false;

    const _error = error as FieldNotUpdatedError;
    return _error.entityType == entityType && _error.key == fieldName;
}
