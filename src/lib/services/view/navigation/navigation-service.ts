import { makeAutoObservable } from "mobx";

import { ArticleInfoResponse, FolderResponse } from "@/interface";
import { DomainService } from "@/services/domain";
import { FileNavigationService, UpdateArticleHandler } from "./file-navigator";

export class NavigationService {
    files: FileNavigationService;

    constructor(domain: DomainService, updateArticle: UpdateArticleHandler) {
        makeAutoObservable(this, { files: false });
        this.files = new FileNavigationService(domain, updateArticle);
    }

    initialize(articles: ArticleInfoResponse[], folders: FolderResponse[]) {
        this.files.initialize(articles, folders);
    }

    reset() {
        this.files.reset();
    }
}
