import type { WordEditorService } from "./word-editor-service.svelte";

export interface WordTypeItem {
    label: string;
    value: string;
}

export interface WordEditorProps {
    service: WordEditorService;
}
