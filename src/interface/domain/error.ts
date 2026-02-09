import type { DomainErrorType } from "@/constants";

export type BackendApiError = Record<DomainErrorType, object>;

export interface BaseDomainError {
    type: DomainErrorType;
}

export interface DomainMessageError extends BaseDomainError {
    msg: string;
}
