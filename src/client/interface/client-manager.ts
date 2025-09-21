import { PhysicalSize } from "@tauri-apps/api/dpi";

import { Id } from "@/interface";
import { ViewKey } from "@/client/constants";
import {
    BulkData,
    EntryInfoResponse,
    ProjectResponse,
    WordUpsert,
    WordUpsertResponse,
    EntryTitleUpdateResponse,
    DomainManager,
    EntityType,
    WordType,
} from "@/domain";

export interface OpenEntryCreatorArguments {
    entityType?: EntityType;
    folderId?: Id;
}

export interface IClientManager {
    domain: DomainManager;

    get navbarWidth(): number;
    get currentView(): ViewKey;

    getViewSize(): Promise<PhysicalSize>;
    fetchProjectInfo(): Promise<ProjectResponse | null>;
    populateNavigator(): Promise<void>;
    openHome(): void;
    openSettings(): void;
    openProjectCreator(): void;
    openEntryCreator(args?: OpenEntryCreatorArguments): void;
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
    createEntry(
        entityType: EntityType,
        title: string,
        folderId: Id,
    ): Promise<EntryInfoResponse | null>;
    updateEntryTitle(id: Id, title: string): Promise<EntryTitleUpdateResponse>;
    updateLexicon(words: WordUpsert[]): Promise<WordUpsertResponse[] | null>;
    deleteEntry(id: number, title: string, confirm?: boolean): Promise<boolean>;
    cleanUp(): void;
}
