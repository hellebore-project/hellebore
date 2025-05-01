import { PhysicalSize } from "@tauri-apps/api/dpi";

import {
    ArticleResponse,
    ArticleUpdateResponse,
    BaseEntity,
    BulkData,
    EntityType,
    ProjectResponse,
    ViewKey,
    WordType,
    WordUpsert,
    WordUpsertResponse,
} from "@/interface";
import { ArticleUpdateArguments, DomainManager } from "../domain";

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
    openArticleCreator(entityType: EntityType | undefined): void;
    openArticleEditor(id: number): Promise<void>;
    openWordEditor(id: number, wordType?: WordType): Promise<void>;
    closeModal(): void;
    createProject(
        name: string,
        dbFilePath: string,
    ): Promise<ProjectResponse | null>;
    loadProject(): Promise<ProjectResponse | null>;
    closeProject(): Promise<boolean>;
    editFolderName(id: number): void;
    deleteFolder(id: number, confirm?: boolean): Promise<BulkData | null>;
    createArticle(): Promise<ArticleResponse<BaseEntity> | null>;
    updateArticle(
        update: ArticleUpdateArguments,
    ): Promise<ArticleUpdateResponse | null>;
    updateLexicon(words: WordUpsert[]): Promise<WordUpsertResponse[] | null>;
    deleteEntity(id: number, confirm?: boolean): Promise<boolean>;
    cleanUp(): void;
}
