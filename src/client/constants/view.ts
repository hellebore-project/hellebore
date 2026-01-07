export enum ViewAction {
    Create = "CREATE",
    Show = "SHOW",
    // Open is a combination of Create and Show;
    // since both of those actions are already enumerated, we don't one for Open.
    Hide = "HIDE",
    Close = "CLOSE",
}

export enum CentralViewType {
    Home = "HOME",
    Settings = "SETTINGS",
    Search = "SEARCH",
    EntryEditor = "ENTRY_EDITOR",
}

export enum EntryViewType {
    ArticleEditor = "ARTICLE_EDITOR",
    PropertyEditor = "PROPERTY_EDITOR",
    WordEditor = "WORD_EDITOR",
}

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

export enum ModalType {
    ProjectCreator = "PROJECT_CREATOR",
    EntryCreator = "ENTRY_CREATOR",
}

export enum ContextMenuType {
    NavBarFolderNode = "NAV_BAR_FOLDER_NODE",
    NavBarEntityNode = "NAV_BAR_ENTITY_NODE",
}
