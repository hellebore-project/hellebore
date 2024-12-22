import { invoke } from "@tauri-apps/api/core";
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
    RichResponse,
    ValueChange,
    IdentifiedObject,
    ArticleCreate,
    ROOT_FOLDER_ID,
} from "@/interface";

export interface ArticleUpdateArguments extends IdentifiedObject {
    entity_type?: EntityType | null;
    folder_id?: number | null;
    title?: string | null;
    body?: string | null;
    entity?: BaseEntity | null;
}

type CreateArticleEventHandler = (article: ArticleResponse<BaseEntity>) => void;
type UpdateArticleEventHandler = (update: ArticleUpdateResponse) => void;
type FetchArticleEventHandler = (infos: ArticleInfoResponse[]) => void;

export class ArticleService {
    /**
     * The high-level information of each article is cached. This information is used for:
     *  - entity type look-ups
     *  - querying articles by title
     *  - updating references in article bodies (TODO)
     */
    _infos: { [id: number]: ArticleInfoResponse };

    onCreated: CreateArticleEventHandler[];
    onUpdated: UpdateArticleEventHandler[];
    onFetchedAll: FetchArticleEventHandler[];

    constructor() {
        makeAutoObservable(this, {
            _infos: false,
            onCreated: false,
            onUpdated: false,
            onFetchedAll: false,
        });

        this._infos = {};

        this.onCreated = [];
        this.onUpdated = [];
        this.onFetchedAll = [];
    }

    async create(
        entityType: EntityType,
        title: string,
        folder_id: number = ROOT_FOLDER_ID,
    ): Promise<ArticleResponse<BaseEntity> | null> {
        let response: ArticleResponse<BaseEntity> | null;

        try {
            if (entityType === EntityType.LANGUAGE)
                response = await createLanguage(title, folder_id);
            else if (entityType === EntityType.PERSON)
                response = await createPerson(title, folder_id);
            else {
                console.error(
                    `Unable to create article with entity type ${entityType}.`,
                );
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }

        this._infos[response.id] = {
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
        entity_type = null,
        folder_id = null,
        title = null,
        body = null,
        entity = null,
    }: ArticleUpdateArguments): Promise<ArticleUpdateResponse | null> {
        if (!entity_type) entity_type = this._infos[id].entity_type;

        const payload: ArticleUpdate<BaseEntity> = {
            id: id as number,
            entity_type: entity_type as EntityType,
            folder_id,
            title,
            body,
            entity,
        };
        let response: RichResponse<null> | null;

        try {
            response = await updateArticle(payload);
        } catch (error) {
            console.error(error);
            return null;
        }

        const cleanResponse = this._buildUpdateResponse(payload, response);

        if (cleanResponse.folderChange && cleanResponse.folder_id !== null)
            this._infos[cleanResponse.id].folder_id = cleanResponse.folder_id;
        if (
            cleanResponse.titleChange == ValueChange.UPDATED &&
            cleanResponse.title &&
            cleanResponse.isTitleUnique
        )
            this._infos[cleanResponse.id].title = cleanResponse.title;

        this.onUpdated.forEach((handler) => handler(cleanResponse));

        return cleanResponse;
    }

    _buildUpdateResponse(
        articleUpdate: ArticleUpdate<BaseEntity>,
        response: RichResponse<null>,
    ): ArticleUpdateResponse {
        const cleanResponse: ArticleUpdateResponse = {
            id: articleUpdate.id,
            folder_id: articleUpdate.folder_id,
            folderChange:
                articleUpdate.folder_id == null
                    ? ValueChange.NOT_SET
                    : ValueChange.UPDATED,
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
        entityType?: EntityType | null,
    ): Promise<ArticleResponse<BaseEntity> | null> {
        if (!entityType) entityType = this._infos[id].entity_type;

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

        response.forEach((info) => (this._infos[info.id] = info));
        this.onFetchedAll.forEach((handler) => handler(response));

        return response;
    }

    queryByTitle(
        titleFragment: string,
        maxResults: number = 5,
    ): ArticleInfoResponse[] {
        const arg = titleFragment.toLowerCase();
        return Object.values(this._infos)
            .filter((info) => info.title.toLowerCase().startsWith(arg))
            .slice(0, maxResults);
    }

    async delete(id: number, entityType?: EntityType | null): Promise<boolean> {
        if (!entityType) entityType = this._infos[id].entity_type;

        try {
            await deleteArticle(id, entityType);
        } catch (error) {
            console.error(error);
            console.error(
                `Unable to delete article ${id} with entity type ${entityType}.`,
            );
            return false;
        }

        delete this._infos[id];
        return true;
    }
}

async function createLanguage(
    name: string,
    folder_id: number,
): Promise<ArticleResponse<LanguageData>> {
    const article: ArticleCreate<LanguageData> = {
        folder_id,
        title: name,
        data: { name },
    };
    console.log(article);
    return invoke<ArticleResponse<LanguageData>>("create_language", {
        article,
    });
}

async function createPerson(
    name: string,
    folder_id: number,
): Promise<ArticleResponse<PersonData>> {
    const article: ArticleCreate<LanguageData> = {
        folder_id,
        title: name,
        data: { name },
    };
    return invoke<ArticleResponse<PersonData>>("create_person", { article });
}

async function updateArticle(
    article: ArticleUpdate<BaseEntity>,
): Promise<RichResponse<null>> {
    console.log(article);
    const command = `update_${ENTITY_TYPE_LABELS[article.entity_type].toLowerCase()}`;
    return invoke<RichResponse<null>>(command, { article });
}

async function getArticle(
    id: number,
    entityType: EntityType,
): Promise<ArticleResponse<BaseEntity>> {
    const command = `get_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
    return invoke<ArticleResponse<BaseEntity>>(command, { id });
}

async function deleteArticle(
    id: number,
    entityType: EntityType,
): Promise<void> {
    const command = `delete_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
    invoke<ArticleResponse<BaseEntity>>(command, { id });
}
