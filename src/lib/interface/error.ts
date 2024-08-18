export interface ApiErrorBody {
    msg: string;
    entity: number;
    field?: string;
}

export type ApiError = { [type: string]: ApiError };
