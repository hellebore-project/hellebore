import { EntityInfoResponse } from "./entity";

export interface ArticleResponse extends EntityInfoResponse {
    body: string;
}
