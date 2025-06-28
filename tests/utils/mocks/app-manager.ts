import {
    EntityInfoResponse,
    FolderResponse,
    ProjectResponse,
} from "@/interface";
import { state } from "@/services";
import { AppManager } from "@/services/app-manager";
import { mockGetArticles } from "./article-manager";
import { mockGetFolders } from "./folder-manager";
import { mockGetSession } from "./session-manager";

export interface MockServiceArguments {
    dbFilePath: string;
    project: ProjectResponse;
    entities: EntityInfoResponse[];
    folders: FolderResponse[];
}

export function mockServices({
    dbFilePath,
    project,
    entities,
    folders,
}: MockServiceArguments) {
    let manager = new AppManager();
    mockGetSession({
        manager: manager.domain.session,
        dbFilePath,
        project,
    });
    mockGetArticles({ manager: manager.domain.articles, entities });
    mockGetFolders({ manager: manager.domain.folders, folders });
    manager.initialize();
    state.manager = manager;
    return manager;
}
