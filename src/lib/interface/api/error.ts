export interface ApiErrorBody {
    msg: string;
    entity: string;
    field?: string;
}

export type ApiError = { [type: string]: ApiErrorBody };
