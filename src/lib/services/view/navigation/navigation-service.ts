import { makeAutoObservable } from "mobx";

import { ArticleInfoResponse, FolderResponse } from "@/interface";
import { FileNavigationService } from "./file-navigator";
import { ViewServiceInterface } from "../view-service-interface";

export class NavigationService {
    files: FileNavigationService;

    constructor(view: ViewServiceInterface) {
        makeAutoObservable(this, { files: false });
        this.files = new FileNavigationService(view);
    }

    initialize(articles: ArticleInfoResponse[], folders: FolderResponse[]) {
        this.files.initialize(articles, folders);
    }

    reset() {
        this.files.reset();
    }
}
