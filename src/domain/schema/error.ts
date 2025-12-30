export enum DomainErrorType {
    UNKNOWN_ERROR = "UnknownError",
}

export type BackendApiError = Record<DomainErrorType, object>;

export interface BaseDomainError {
    type: DomainErrorType;
}

export interface DomainMessageError extends BaseDomainError {
    msg: string;
}
