import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import {
    EntityInfoResponse,
    ArticleResponse,
    EntityType,
    Id,
    ApiError,
} from "@/interface";
import { FileStructure } from "./file-structure";
import { is_field_unique, process_api_error } from "./utils";

export interface ArticleTitleUpdateResponse {
    updated: boolean;
    isUnique: boolean;
}

export interface ArticleTextUpdateResponse {
    updated: boolean;
}

export class ArticleManager {
    _structure: FileStructure;

    constructor(structure: FileStructure) {
        makeAutoObservable(this, { _structure: false });
        this._structure = structure;
    }

    async updateTitle(
        id: Id,
        title: string,
    ): Promise<ArticleTitleUpdateResponse> {
        let response: ArticleTitleUpdateResponse = {
            updated: true,
            isUnique: true,
        };

        try {
            await this._updateTitle(id, title);
        } catch (error) {
            response.updated = false;
            console.error(error);

            let _error = process_api_error(error as ApiError);
            if (!is_field_unique(_error, EntityType.ARTICLE, "title"))
                response.isUnique = false;
        }

        if (title && response.updated)
            this._structure.getInfo(id).title = title;

        return response;
    }

    async updateFolder(
        id: Id,
        folderId: Id,
        oldFolderId: Id,
    ): Promise<boolean> {
        let updated = true;

        try {
            await this._updateFolder(id, folderId);
        } catch (error) {
            updated = false;
            console.error(error);
        }

        if (updated) {
            this._structure.getInfo(id).folder_id = folderId;
            this._structure.moveFile(id, oldFolderId, folderId);
        }

        return updated;
    }

    async updateText(id: Id, text: string): Promise<ArticleTextUpdateResponse> {
        let updated = true;
        try {
            await this._updateText(id, text);
        } catch (error) {
            console.error(error);
            updated = false;
        }
        return { updated };
    }

    async getText(id: Id): Promise<string | null> {
        try {
            const response = await invoke<ArticleResponse>("get_article_text", {
                id,
            });
            return response.body;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async getAll(): Promise<EntityInfoResponse[] | null> {
        let response: EntityInfoResponse[] | null;
        try {
            response = await this._getAll();
        } catch (error) {
            console.error(error);
            console.error("Failed to fetch all articles from the backend.");
            return null;
        }

        for (const info of response) {
            this._structure.addFile(info);
        }

        return response;
    }

    queryByTitle(
        titleFragment: string,
        maxResults: number = 5,
    ): EntityInfoResponse[] {
        const arg = titleFragment.toLowerCase();
        return Object.values(this._structure.files)
            .filter((info) => info.title.toLowerCase().startsWith(arg))
            .slice(0, maxResults);
    }

    async _updateTitle(id: Id, title: string) {
        return invoke<void>("update_article_title", { id, title });
    }

    async _updateFolder(id: Id, folderId: Id) {
        return invoke<void>("update_article_folder", {
            id,
            folderId,
        });
    }

    async _updateText(id: Id, text: string) {
        return invoke<void>("update_article_text", { id, text });
    }

    async _getAll() {
        return invoke<EntityInfoResponse[]>("get_articles");
    }
}
