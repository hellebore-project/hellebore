import {
    ArticleResponse,
    ArticleUpdateResponse,
    BaseEntity,
    BulkData,
    EntityType,
    ProjectResponse,
} from "@/interface";
import { ArticleUpdateArguments, DomainManager } from "../domain";

export interface ViewManagerInterface {
    domain: DomainManager;
    fetchProjectInfo(): Promise<ProjectResponse | null>;
    populateNavigator(): Promise<void>;
    openHome(): void;
    openSettings(): void;
    openProjectCreator(): void;
    openArticleCreator(entityType: EntityType | undefined): void;
    openArticleEditor(article: ArticleResponse<BaseEntity>): void;
    openArticleEditorForId(id: number): Promise<void>;
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
    deleteArticle(id: number, confirm?: boolean): Promise<boolean>;
    cleanUp(): void;
}
