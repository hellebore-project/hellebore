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

export type BackendApiError = Record<DomainErrorType, object>;

export interface BaseDomainError {
    type: DomainErrorType;
}

export interface DomainMessageError extends BaseDomainError {
    msg: string;
}

export interface DatabaseConnectionFailedError extends DomainMessageError {
    connectionString: string;
}

export interface DatabaseMigrationFailedError extends DomainMessageError {
    connectionString: string;
}

export interface NotInsertedError extends DomainMessageError {
    entityType: EntityType;
}

export interface NotUpdatedError extends DomainMessageError {
    entityType: EntityType;
}

export interface NotFoundError extends DomainMessageError {
    entityType: EntityType;
}

export interface NotDeletedError extends DomainMessageError {
    entityType: EntityType;
}

export interface QueryFailedError extends DomainMessageError {
    entityType: EntityType;
}

export interface FieldNotUpdatedError extends DomainMessageError {
    entityType: EntityType;
    key: string;
}

export interface FieldNotUniqueError extends BaseDomainError {
    entityType: EntityType;
    id?: number;
    key: string;
    value: string;
}

export interface FieldInvalidError extends DomainMessageError {
    entityType: EntityType;
    id?: number;
    key: string;
    value: string;
}

export type ProjectNotLoadedError = BaseDomainError;
