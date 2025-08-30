import { EntityType, ENTITY_TYPE_LABELS } from "./entity";

export const CommandNames = {
    Session: {
        Get: "get_session",
    },
    Project: {
        Create: "create_project",
        Load: "load_project",
        Close: "close_project",
        Update: "update_project",
        Get: "get_project",
    },
    Folder: {
        Create: "create_folder",
        Update: "update_folder",
        GetAll: "get_folders",
        Delete: "delete_folder",
    },
    Entry: {
        Create(entityType: EntityType) {
            return `create_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
        },
        UpdateFolder: "update_entry_folder",
        UpdateTitle: "update_entry_title",
        UpdateProperties(entityType: EntityType) {
            return `update_${ENTITY_TYPE_LABELS[entityType].toLowerCase()}`;
        },
        UpdateArticle: "update_entry_text",
        GetInfo: "get_entry",
        GetProperties: "get_entry_properties",
        GetArticle: "get_entry_text",
        GetAll: "get_entries",
        Delete: "delete_entry",
    },
    Word: {
        BulkUpsert: "upsert_words",
        GetMany: "get_words",
        Delete: "delete_word",
    },
};
