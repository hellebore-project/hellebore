import { invoke } from "@tauri-apps/api/core";
import { makeAutoObservable } from "mobx";

import {
    EntityInfoResponse,
    ENTITY_TYPE_LABELS,
    EntityType,
    LanguageData,
    EntityCreate,
    ROOT_FOLDER_ID,
    Id,
    BaseEntity,
    EntityResponse,
    EntityUpdate,
} from "@/interface";
import { FileStructure } from "./file-structure";

type PrivateKeys = "_structure";

export interface EntityUpdateResponse {
    updated: boolean;
}

export class EntityManager {
    private _structure: FileStructure;

    constructor(structure: FileStructure) {
        makeAutoObservable<EntityManager, PrivateKeys>(this, {
            _structure: false,
        });
        this._structure = structure;
    }

    async create(
        entityType: EntityType,
        title: string,
        folder_id: number = ROOT_FOLDER_ID,
    ): Promise<EntityInfoResponse | null> {
        let response: EntityInfoResponse | null;

        try {
            if (entityType === EntityType.LANGUAGE)
                response = await createLanguage(title, folder_id);
            else if (entityType === EntityType.PERSON)
                response = await createPerson(title, folder_id);
            else {
                console.error(
                    `Unable to create new entity of type ${entityType}.`,
                );
                return null;
            }
        } catch (error) {
            console.error(error);
            return null;
        }

        this._structure.addFile(response);

        return response;
    }

    async update<E extends BaseEntity>(
        id: Id,
        data: E,
        entityType?: EntityType,
    ): Promise<EntityUpdateResponse> {
        entityType = entityType ?? this._structure.getInfo(id).entity_type;

        if (entityType === EntityType.LANGUAGE) return { updated: false };

        const payload = { id, data };

        try {
            await updateEntity(entityType, payload);
        } catch (error) {
            console.error(error);
            return { updated: false };
        }

        return { updated: true };
    }

    async get<E extends BaseEntity>(
        id: number,
        entityType?: EntityType,
    ): Promise<E | null> {
        if (entityType === EntityType.LANGUAGE) return {} as E;

        if (!entityType) entityType = this._structure.getInfo(id).entity_type;

        try {
            const response = await getEntity<E>(id, entityType);
            return response.data;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    async delete(id: number, entityType?: EntityType): Promise<boolean> {
        entityType = entityType ?? this._structure.getInfo(id).entity_type;

        try {
            await deleteArticle(id, entityType);
        } catch (error) {
            console.error(error);
            console.error(
                `Unable to delete entity ${id} of type ${entityType}.`,
            );
            return false;
        }

        this._structure.deleteFile(id);

        return true;
    }
}

async function createLanguage(
    name: string,
    folder_id: number,
): Promise<EntityInfoResponse> {
    const article: EntityCreate<LanguageData> = {
        folder_id,
        title: name,
        data: { name },
    };
    return invoke<EntityInfoResponse>("create_language", {
        article,
    });
}

async function createPerson(
    name: string,
    folder_id: number,
): Promise<EntityInfoResponse> {
    const article: EntityCreate<LanguageData> = {
        folder_id,
        title: name,
        data: { name },
    };
    return invoke<EntityInfoResponse>("create_person", { article });
}

async function updateEntity<E extends BaseEntity>(
    entityType: EntityType,
    entity: EntityUpdate<E>,
): Promise<void> {
    const command = `update_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
    invoke(command, { entity });
}

async function getEntity<E extends BaseEntity>(
    id: Id,
    entityType: EntityType,
): Promise<EntityResponse<E>> {
    const command = `get_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
    return invoke<EntityResponse<E>>(command, { id });
}

async function deleteArticle(id: Id, entityType: EntityType): Promise<void> {
    const command = `delete_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
    invoke(command, { id });
}
