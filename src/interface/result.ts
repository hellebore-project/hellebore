export interface OperationResult<T = unknown> {
    success: boolean;
    message?: string | null;
    arguments?: Record<string, unknown> | null;
    result?: T;
}
