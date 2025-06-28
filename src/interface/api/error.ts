import { EntityType } from "../entity";

export enum DomainErrorType {
    UNKNOWN_ERROR = "UnknownError",
    DATABASE_CONNECTION_FAILED = "DatabaseConnectionFailed",
    DATABASE_MIGRATION_FAILED = "DatabaseMigrationFailed",
    NOT_INSERTED = "NotInserted",
    NOT_UPDATED = "NotUpdated",
    NOT_FOUND = "NotFound",
    NOT_DELETED = "NotDeleted",
    QUERY_FAILED = "QueryFailed",
    FIELD_NOT_UPDATED = "FieldNotUpdated",
    FIELD_NOT_UNIQUE = "FieldNotUnique",
    FIELD_INVALID = "FieldInvalid",
    PROJECT_NOT_LOADED = "ProjectNotLoaded",
}

export type ApiError = { [type in DomainErrorType]: {} };

export interface BaseDomainError {
    type: DomainErrorType;
}

export interface BaseDomainErrorWithMessage extends BaseDomainError {
    msg: string;
}

export interface DatabaseConnectionFailedError
    extends BaseDomainErrorWithMessage {
    connection_string: string;
}

export interface DatabaseMigrationFailedError
    extends BaseDomainErrorWithMessage {
    connection_string: string;
}

export interface NotInsertedError extends BaseDomainErrorWithMessage {
    entity_type: EntityType;
}

export interface NotUpdatedError extends BaseDomainErrorWithMessage {
    entity_type: EntityType;
}

export interface NotFoundError extends BaseDomainErrorWithMessage {
    entity_type: EntityType;
}

export interface NotDeletedError extends BaseDomainErrorWithMessage {
    entity_type: EntityType;
}

export interface QueryFailedError extends BaseDomainErrorWithMessage {
    entity_type: EntityType;
}

export interface FieldNotUpdatedError extends BaseDomainErrorWithMessage {
    entity_type: EntityType;
    key: string;
}

export interface FieldNotUniqueError extends BaseDomainError {
    entity_type: EntityType;
    id?: number;
    key: string;
    value: string;
}

export interface FieldInvalidError extends BaseDomainErrorWithMessage {
    entity_type: EntityType;
    id?: number;
    key: string;
    value: string;
}

export interface ProjectNotLoadedError extends BaseDomainError {}
