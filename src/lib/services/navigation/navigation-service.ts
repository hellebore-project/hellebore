import { makeAutoObservable } from "mobx";

import { ArticleNavigationService } from "./article-service";
import { DomainService } from "../domain";

export class NavigationService {
    articles: ArticleNavigationService;

    constructor(domain: DomainService) {
        makeAutoObservable(this);
        this.articles = new ArticleNavigationService(domain);
    }
}
