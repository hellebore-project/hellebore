export enum PropertyFieldType {
    Text = "TEXT",
    Select = "SELECT",
}

export enum CentralViewType {
    Home = "HOME",
    Settings = "SETTINGS",
    EntryEditor = "ENTRY_EDITOR",
}

export enum EntryViewType {
    ArticleEditor = "ARTICLE_EDITOR",
    PropertyEditor = "PROPERTY_EDITOR",
    WordEditor = "WORD_EDITOR",
}

export const ENTRY_VIEW_LABELS: Record<EntryViewType, string> = {
    [EntryViewType.ArticleEditor]: "Article",
    [EntryViewType.PropertyEditor]: "Properties",
    [EntryViewType.WordEditor]: "Lexicon",
};

export enum WordViewType {
    RootWords = "ROOT_WORDS",
    Determiners = "DETERMINERS",
    Prepositions = "PREPOSITIONS",
    Conjunctions = "CONJUNCTIONS",
    Pronouns = "PRONOUNS",
    Nouns = "NOUNS",
    Adjectives = "ADJECTIVES",
    Adverbs = "ADVERBS",
    Verbs = "VERBS",
}

export enum SidebarSectionType {
    EntrySpotlight = "ENTRY_SPOTLIGHT",
    EntryEditorNavigator = "ENTRY_EDITOR_NAVIGATOR",
}

export enum ModalType {
    ProjectCreator = "PROJECT_CREATOR",
    EntryCreator = "ENTRY_CREATOR",
}
