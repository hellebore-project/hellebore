import { makeAutoObservable } from "mobx";

import { ArticleResponse, BaseEntity, EntityType, ViewKey } from "../interface";
import { ArticleCreatorService } from "./article-creator-service";
import { ArticleEditorService } from "./article-editing";
import { NavigationService } from "./navigation-service";
import { DomainService } from "./domain";

export class ViewService {
    viewKey: ViewKey = ViewKey.HOME;
    sideBarOpen: boolean = true;

    domain: DomainService;
    articleCreator: ArticleCreatorService;
    articleEditor: ArticleEditorService;
    navigation: NavigationService;

    constructor(domainService: DomainService) {
        const overrides = {
            data: false,
            articleCreator: false,
            articleEditor: false,
            navigation: false,
        };
        makeAutoObservable(this, overrides);

        this.domain = domainService;
        this.articleCreator = new ArticleCreatorService(domainService);
        this.articleEditor = new ArticleEditorService(domainService, (id) =>
            this.openArticleEditorForId(id),
        );
        this.navigation = new NavigationService();

        this.domain.articles.onFetchedAll.push((infos) =>
            this.navigation.setupArticleNodes(infos),
        );
        this.domain.articles.onUpdated.push((articleUpdate) =>
            this.navigation.updateArticleNode(articleUpdate),
        );
    }

    toggleSideBar() {
        this.sideBarOpen = !this.sideBarOpen;
    }

    openHome() {
        this.cleanUp();
        this.viewKey = ViewKey.HOME;
        this.articleCreator;
    }

    openArticleCreator(entityType: EntityType | undefined = undefined) {
        this.cleanUp();
        this.articleCreator.initialize(entityType);
        this.viewKey = ViewKey.ARTICLE_CREATOR;
    }

    openArticleEditor(article: ArticleResponse<BaseEntity>) {
        this.cleanUp();
        this.articleEditor.initialize(article);
        this.viewKey = ViewKey.ARTICLE_EDITOR;
    }

    async openArticleEditorForId(id: number) {
        if (
            this.viewKey == ViewKey.ARTICLE_EDITOR &&
            this.articleEditor.info.id == id
        )
            return; // the article is already open

        const entityType = this.domain.articles.infos[id]?.entity_type ?? null;
        const article = await this.domain.articles.get(id, entityType);
        if (article) this.openArticleEditor(article);
    }

    async createArticle() {
        let article = await this.articleCreator.createArticle();
        if (article) {
            this.navigation.addArticleNode(article);
            this.openArticleEditor(article);
        }
    }

    cleanUp() {
        if (this.viewKey == ViewKey.ARTICLE_EDITOR)
            this.articleEditor.cleanUp();
    }
}
