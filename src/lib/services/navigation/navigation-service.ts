import { makeAutoObservable } from "mobx";

import { ArticleNavigationService } from "./article-navigator";
import { DomainService } from "../domain";
import { ArticleInfoResponse, FolderResponse } from "@/interface";

export class NavigationService {
    articles: ArticleNavigationService;

    constructor(domain: DomainService) {
        makeAutoObservable(this);
        this.articles = new ArticleNavigationService(domain);
    }

    initialize(articles: ArticleInfoResponse[], folders: FolderResponse[]) {
        this.articles.initialize(articles, folders);
    }

    reset() {
        this.articles.reset();
    }
}
