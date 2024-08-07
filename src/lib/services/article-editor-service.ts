import { makeAutoObservable } from "mobx";
import { Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

import { Article, IdentifiedEntity, EntityType } from "../interface";

class ArticleEditorService {
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
        console.log(this.editor.getJSON());
    }

    initialize<E extends IdentifiedEntity>(article: Article<E>) {
        this.title = article.title;
        this.isTitleUnique = true;
        this.entityType = article.entityType;
        this.entity = article.entity;
        this.editor.commands.setContent(article?.text ?? "");
    }

    reset() {
        this.title = "";
        this.isTitleUnique = true;
        this.entityType = null;
        this.entity = null;
        this.editor.commands.clearContent();
    }
}

export default ArticleEditorService;
