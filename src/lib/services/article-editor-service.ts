import { makeAutoObservable } from "mobx";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Article, IdentifiedEntity, EntityType } from "../interface";

const ARTICLE_ID_SENTINAL = -1;

class ArticleEditorService {
    id: number = ARTICLE_ID_SENTINAL;
    title: string = "";
    isTitleUnique: boolean = true;
    entityType: EntityType | null = null;
    entity: IdentifiedEntity | null = null;
    editor: Editor;

    constructor() {
        makeAutoObservable(this);
        this.editor = new Editor({
            extensions: [StarterKit],
            onUpdate: ({ editor }) => {
                this.updateText(editor as Editor);
            },
        });
    }

    setTitle(title: string) {
        this.title = title;
    }

    setEntity(entity: IdentifiedEntity | null) {
        this.entity = entity;
    }

    updateText(editor: Editor) {
        this.editor = editor;
    }

    initialize<E extends IdentifiedEntity>(article: Article<E>) {
        this.id = article.id;
        this.title = article.title;
        this.isTitleUnique = true;
        this.entityType = article.entity_type;
        this.entity = article.entity;
        this.editor.commands.setContent(article?.content ?? "");
    }

    reset() {
        this.id = ARTICLE_ID_SENTINAL;
        this.title = "";
        this.isTitleUnique = true;
        this.entityType = null;
        this.entity = null;
        this.editor.commands.clearContent();
    }
}

export default ArticleEditorService;
