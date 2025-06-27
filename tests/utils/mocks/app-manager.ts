import { state } from "@/services";
import { AppManager } from "@/services/app-manager";

import { mockGetSession } from "./session-manager";
import { EntityInfoResponse, FolderResponse } from "@/interface";
import { mockGetArticles } from "./article-manager";
import { mockGetFolders } from "./folder-manager";

export interface MockServiceArguments {
    projectName: string;
    dbFilePath: string;
    entities: EntityInfoResponse[];
    folders: FolderResponse[];
}

export function mockServices({
    projectName,
    dbFilePath,
    entities,
    folders,
}: MockServiceArguments) {
    let manager = new AppManager();
    mockGetSession({
        manager: manager.domain.session,
        projectName,
        dbFilePath,
    });
    mockGetArticles({ manager: manager.domain.articles, entities });
    mockGetFolders({ manager: manager.domain.folders, folders });
    manager.initialize();
    state.manager = manager;
    return manager;
}
