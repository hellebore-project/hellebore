import { Id } from "@/interface";
import {
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
    createEntry(
        entityType: EntityType,
        title: string,
        folderId: Id,
    ): Promise<EntryInfoResponse | null>;
}
