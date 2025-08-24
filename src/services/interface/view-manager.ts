import { PhysicalSize } from "@tauri-apps/api/dpi";

import { EntityType, ViewKey, WordType } from "@/constants";
import { Id } from "@/interface";
import {
    BulkData,
    EntryInfoResponse,
    ProjectResponse,
    WordUpsert,
    WordUpsertResponse,
} from "@/schema";
import { EntryTitleUpdateResponse, DomainManager } from "../domain";

export interface OpenEntityCreatorArguments {
    entityType?: EntityType;
    folderId?: Id;
}

export interface IViewManager {
    // HACK: referencing the concrete DomainManager class rather than an interface
    // is conceptually incorrect, but creating a DomainManager interface would take
    // a lot of effort and would carry very little benefit. So for now, we take the
    // easy way out.
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
    ): Promise<EntryInfoResponse | null>;
    updateEntityTitle(id: Id, title: string): Promise<EntryTitleUpdateResponse>;
    updateLexicon(words: WordUpsert[]): Promise<WordUpsertResponse[] | null>;
    deleteEntity(
        id: number,
        title: string,
        confirm?: boolean,
    ): Promise<boolean>;
    cleanUp(): void;
}
