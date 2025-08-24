import { EntityType } from "@/constants";
import {
    ApiError,
    BaseDomainError,
    DomainErrorType,
    DomainMessageError,
    FieldNotUniqueError,
} from "@/schema";

export function process_api_error(api_error: ApiError): BaseDomainError {
    let keys = Object.keys(api_error).filter((key) =>
        Object.values(DomainErrorType).includes(key as DomainErrorType),
    );
    if (keys.length == 0)
        return {
            type: DomainErrorType.UNKNOWN_ERROR,
            msg: "Unable to resolve error",
        } as DomainMessageError;

    let type = keys[0] as DomainErrorType;
    return { type, ...api_error[type] };
}

export function is_field_unique(
    error: BaseDomainError,
    entityType: EntityType,
    fieldName: string,
): boolean {
    if (error.type !== DomainErrorType.FIELD_NOT_UNIQUE) return true;
    let _error = error as FieldNotUniqueError;
    if (_error.entity_type == entityType && _error.key == fieldName)
        return false;
    return true;
}
