// IDENTIFIERS

export const ARTICLE_REFERENCE_PREFIX = "@";

export const ROOT_FOLDER_NODE_ID = "R";

export const SHARED_PORTAL_ID = "shared-portal";
export const SHARED_PORTAL_SELECTOR = `#${SHARED_PORTAL_ID}`;

// VIEWS

export enum ViewAction {
    Create = "CREATE",
    Show = "SHOW",
    // Open is a combination of Create and Show;
    // since both of those actions are already enumerated,
    // we don't need one for Open.
    Hide = "HIDE",
    Close = "CLOSE",
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
