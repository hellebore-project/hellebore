export interface OperationResult<T = unknown> {
    success: boolean;
    message?: string | null;
    inputs?: Record<string, unknown> | null;
    output?: T;
}
