import { invoke } from "@tauri-apps/api/tauri";
import { makeAutoObservable } from "mobx";

import {
    BaseEntity,
    ArticleInfoResponse,
    ArticleResponse,
    ArticleUpdate,
    ArticleUpdateResponse,
    ENTITY_TYPE_LABELS,
    EntityType,
    LanguageData,
    PersonData,
    UpdateResponse,
    ValueChange,
} from "../../interface";

type CreateArticleEventHandler = (article: ArticleResponse<BaseEntity>) => void;
type UpdateArticleEventHandler = (update: ArticleUpdateResponse) => void;
type FetchArticleEventHandler = (infos: ArticleInfoResponse[]) => void;

export class ArticleService {
    infos: { [id: number]: ArticleInfoResponse };

    onCreated: CreateArticleEventHandler[];
    onUpdated: UpdateArticleEventHandler[];
    onFetchedAll: FetchArticleEventHandler[];

    constructor() {
        makeAutoObservable(this, {
            onCreated: false,
            onUpdated: false,
            onFetchedAll: false,
        });

        this.infos = {};

        this.onCreated = [];
        this.onUpdated = [];
        this.onFetchedAll = [];
    }

    async create(
        title: string,
        entityType: EntityType | null,
    ): Promise<ArticleResponse<BaseEntity> | null> {
        let response: ArticleResponse<BaseEntity> | null;

        try {
            if (entityType === EntityType.LANGUAGE)
                response = await createLanguage(title);
            else if (entityType === EntityType.PERSON)
                response = await createPerson(title);
            else {
                console.error(
                    `Unabled to create articles with entity type ${entityType}.`,
                );
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }

        this.infos[response.id] = {
            id: response.id,
            folder_id: response.folder_id,
            entity_type: response.entity_type,
            title: response.title,
        };
        this.onCreated.forEach((handler) => handler(response));

        return response;
    }

    async update({
        id,
        entity_type,
        folder_id = null,
        title = null,
        body = null,
        entity = null,
    }: Partial<
        ArticleUpdate<BaseEntity>
    >): Promise<ArticleUpdateResponse | null> {
        const payload: ArticleUpdate<BaseEntity> = {
            id: id as number,
            entity_type: entity_type as EntityType,
            folder_id,
            title,
            body,
            entity,
        };
        let response: UpdateResponse<null> | null;

        try {
            response = await updateArticle(payload);
        } catch (error) {
            console.error(error);
            return null;
        }

        const cleanResponse = this._buildUpdateResponse(payload, response);

        if (
            cleanResponse.titleChange == ValueChange.UPDATED &&
            cleanResponse.title &&
            cleanResponse.isTitleUnique
        )
            this.infos[cleanResponse.id].title = cleanResponse.title;
        this.onUpdated.forEach((handler) => handler(cleanResponse));

        return cleanResponse;
    }

    _buildUpdateResponse(
        articleUpdate: ArticleUpdate<BaseEntity>,
        response: UpdateResponse<null>,
    ): ArticleUpdateResponse {
        const cleanResponse: ArticleUpdateResponse = {
            id: articleUpdate.id,
            folder_id: articleUpdate.folder_id,
            entity_type: articleUpdate.entity_type,
            title: articleUpdate.title,
            titleChange:
                articleUpdate.title == null
                    ? ValueChange.NOT_SET
                    : ValueChange.UPDATED,
            entityChange:
                articleUpdate.entity == null
                    ? ValueChange.NOT_SET
                    : ValueChange.UPDATED,
            bodyChange:
                articleUpdate.body == null
                    ? ValueChange.NOT_SET
                    : ValueChange.UPDATED,
        };

        if (cleanResponse.titleChange == ValueChange.UPDATED)
            cleanResponse.isTitleUnique = true;

        for (let error of response.errors) {
            if ("FieldNotUpdated" in error) {
                const { msg, entity, field } = error["FieldNotUpdated"];
                if (
                    msg == "Title is not unique." &&
                    entity == "Article" &&
                    field == "title"
                )
                    cleanResponse.isTitleUnique = false;
            }
        }

        return cleanResponse;
    }

    async get(
        id: number,
        entityType: EntityType,
    ): Promise<ArticleResponse<BaseEntity> | null> {
        try {
            return await getArticle(id, entityType);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getAll(): Promise<ArticleInfoResponse[] | null> {
        let response: ArticleInfoResponse[] | null;
        try {
            response = await invoke<ArticleInfoResponse[]>("get_articles");
        } catch (error) {
            console.error(error);
            console.error("Failed to fetch all articles from the backend.");
            return null;
        }

        response.forEach((info) => (this.infos[info.id] = info));
        this.onFetchedAll.forEach((handler) => handler(response));

        return response;
    }

    queryByTitle(
        titleFragment: string,
        maxResults: number = 5,
    ): ArticleInfoResponse[] {
        const arg = titleFragment.toLowerCase();
        // TODO: query the backend so that we don't have to cache the article infos
        return Object.values(this.infos)
            .filter((info) => info.title.toLowerCase().startsWith(arg))
            .slice(0, maxResults);
    }
}

async function createLanguage(
    name: string,
): Promise<ArticleResponse<LanguageData>> {
    return invoke<ArticleResponse<LanguageData>>("create_language", {
        data: { name },
    });
}

async function createPerson(
    name: string,
): Promise<ArticleResponse<PersonData>> {
    return invoke<ArticleResponse<PersonData>>("create_person", {
        data: { name },
    });
}

async function updateArticle(
    article: ArticleUpdate<BaseEntity>,
): Promise<UpdateResponse<null>> {
    console.log(article);
    const command = `update_${ENTITY_TYPE_LABELS[article.entity_type].toLowerCase()}`;
    return invoke<UpdateResponse<null>>(command, { article });
}

async function getArticle(
    id: number,
    entityType: EntityType,
): Promise<ArticleResponse<BaseEntity>> {
    const command = `get_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
    return invoke<ArticleResponse<BaseEntity>>(command, { id });
}
