import { Id } from "@/interface";
import { ViewKey } from "@/client/constants";
import {
    BulkData,
    EntryInfoResponse,
    ProjectResponse,
    DomainManager,
    EntityType,
} from "@/domain";

export interface OpenEntryCreatorArguments {
    entityType?: EntityType;
    folderId?: Id;
}

export interface IClientManager {
    domain: DomainManager;

    get currentView(): ViewKey;

    fetchProjectInfo(): Promise<ProjectResponse | null>;
    populateNavigator(): Promise<void>;
    openHome(): void;
    openSettings(): void;
    openProjectCreator(): void;
    openEntryCreator(args?: OpenEntryCreatorArguments): void;
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
    deleteEntry(id: number, title: string, confirm?: boolean): Promise<boolean>;
    cleanUp(): void;
}
