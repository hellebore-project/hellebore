import { PhysicalSize } from "@tauri-apps/api/dpi";

import {
    EntityInfoResponse,
    BulkData,
    EntityType,
    Id,
    ProjectResponse,
    ViewKey,
    WordType,
    WordUpsert,
    WordUpsertResponse,
} from "@/interface";
import { ArticleTitleUpdateResponse, DomainManager } from "../domain";

export interface OpenEntityCreatorArguments {
    entityType?: EntityType;
    folderId?: Id;
}

export interface ViewManagerInterface {
    domain: DomainManager;

    get navbarWidth(): number;
    get currentView(): ViewKey;

    getViewSize(): Promise<PhysicalSize>;
    fetchProjectInfo(): Promise<ProjectResponse | null>;
    populateNavigator(): Promise<void>;
    openHome(): void;
    openSettings(): void;
    openProjectCreator(): void;
    openEntityCreator(args?: OpenEntityCreatorArguments): void;
    openArticleEditor(id: Id): Promise<void>;
    openPropertyEditor(id: Id): Promise<void>;
    openWordEditor(languageId: Id, wordType?: WordType): Promise<void>;
    closeModal(): void;
    createProject(
        name: string,
        dbFilePath: string,
    ): Promise<ProjectResponse | null>;
    loadProject(): Promise<ProjectResponse | null>;
    closeProject(): Promise<boolean>;
    editFolderName(id: number): void;
    deleteFolder(id: number, confirm?: boolean): Promise<BulkData | null>;
    createEntity(
        entityType: EntityType,
        title: string,
        folderId: Id,
    ): Promise<EntityInfoResponse | null>;
    updateEntityTitle(
        id: Id,
        title: string,
    ): Promise<ArticleTitleUpdateResponse>;
    updateLexicon(words: WordUpsert[]): Promise<WordUpsertResponse[] | null>;
    deleteEntity(id: number, confirm?: boolean): Promise<boolean>;
    cleanUp(): void;
}
