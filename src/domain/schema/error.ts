import { EntityType } from "@/domain/constants";

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

export type ApiError = Record<DomainErrorType, object>;

export interface BaseDomainError {
    type: DomainErrorType;
}

export interface DomainMessageError extends BaseDomainError {
    msg: string;
}

export interface DatabaseConnectionFailedError extends DomainMessageError {
    connection_string: string;
}

export interface DatabaseMigrationFailedError extends DomainMessageError {
    connection_string: string;
}

export interface NotInsertedError extends DomainMessageError {
    entity_type: EntityType;
}

export interface NotUpdatedError extends DomainMessageError {
    entity_type: EntityType;
}

export interface NotFoundError extends DomainMessageError {
    entity_type: EntityType;
}

export interface NotDeletedError extends DomainMessageError {
    entity_type: EntityType;
}

export interface QueryFailedError extends DomainMessageError {
    entity_type: EntityType;
}

export interface FieldNotUpdatedError extends DomainMessageError {
    entity_type: EntityType;
    key: string;
}

export interface FieldNotUniqueError extends BaseDomainError {
    entity_type: EntityType;
    id?: number;
    key: string;
    value: string;
}

export interface FieldInvalidError extends DomainMessageError {
    entity_type: EntityType;
    id?: number;
    key: string;
    value: string;
}

export type ProjectNotLoadedError = BaseDomainError;
