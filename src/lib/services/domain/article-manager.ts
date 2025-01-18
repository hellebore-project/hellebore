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
    ResponseWithDiagnostics,
    ValueChange,
    IdentifiedObject,
    ArticleCreate,
    ROOT_FOLDER_ID,
} from "@/interface";
import { FileStructure } from "./file-structure";

export interface ArticleUpdateArguments extends IdentifiedObject {
    entity_type?: EntityType | null;
    folderId?: number | null;
    oldFolderId?: number | null;
    title?: string | null;
    body?: string | null;
    entity?: BaseEntity | null;
}

export class ArticleManager {
    _structure: FileStructure;

    constructor(structure: FileStructure) {
        makeAutoObservable(this, { _structure: false });
        this._structure = structure;
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

        this._structure.addArticle(response);

        return response;
    }

    async update({
        id,
        entity_type = null,
        folderId = null,
        oldFolderId = null,
        title = null,
        body = null,
        entity = null,
    }: ArticleUpdateArguments): Promise<ArticleUpdateResponse | null> {
        if (!entity_type) entity_type = this.getInfo(id).entity_type;

        const payload: ArticleUpdate<BaseEntity> = {
            id: id as number,
            entity_type: entity_type as EntityType,
            folder_id: folderId,
            title,
            body,
            entity,
        };
        let response: ResponseWithDiagnostics<null> | null;

        try {
            response = await updateArticle(payload);
        } catch (error) {
            console.error(error);
            return null;
        }
        const updateResponse = this._buildUpdateResponse(payload, response);

        if (
            updateResponse.folderChange &&
            updateResponse.folder_id !== null &&
            oldFolderId !== null
        ) {
            this.getInfo(updateResponse.id).folder_id =
                updateResponse.folder_id;
            this._structure.moveArticle(
                updateResponse.id,
                oldFolderId,
                updateResponse.folder_id,
            );
        }
        if (
            updateResponse.titleChange == ValueChange.UPDATED &&
            updateResponse.title &&
            updateResponse.isTitleUnique
        )
            this.getInfo(updateResponse.id).title = updateResponse.title;

        return updateResponse;
    }

    _buildUpdateResponse(
        articleUpdate: ArticleUpdate<BaseEntity>,
        response: ResponseWithDiagnostics<null>,
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
        if (!entityType) entityType = this.getInfo(id).entity_type;

        try {
            return await getArticle(id, entityType);
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    getInfo(id: number) {
        return this._structure.articles[id];
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

        for (const info of response) {
            this._structure.addArticle(info);
        }

        return response;
    }

    queryByTitle(
        titleFragment: string,
        maxResults: number = 5,
    ): ArticleInfoResponse[] {
        const arg = titleFragment.toLowerCase();
        return Object.values(this._structure.articles)
            .filter((info) => info.title.toLowerCase().startsWith(arg))
            .slice(0, maxResults);
    }

    async delete(id: number, entityType?: EntityType | null): Promise<boolean> {
        if (!entityType) entityType = this.getInfo(id).entity_type;

        try {
            await deleteArticle(id, entityType);
        } catch (error) {
            console.error(error);
            console.error(
                `Unable to delete article ${id} with entity type ${entityType}.`,
            );
            return false;
        }

        this._structure.deleteArticle(id);

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
): Promise<ResponseWithDiagnostics<null>> {
    const command = `update_${ENTITY_TYPE_LABELS[article.entity_type].toLowerCase()}`;
    return invoke<ResponseWithDiagnostics<null>>(command, { article });
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
    invoke(command, { id });
}
