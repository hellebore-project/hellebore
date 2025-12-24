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
        Validate: "validate_folder_name",
        Get: "get_folder",
        GetAll: "get_folders",
        Delete: "delete_folder",
    },
    Entry: {
        Create: "create_entry",
        Update: "update_entry",
        BulkUpdate: "update_entries",
        GetInfo: "get_entry",
        GetProperties: "get_entry_properties",
        GetArticle: "get_entry_text",
        GetAll: "get_entries",
        Search: "search_entries",
        Delete: "delete_entry",
    },
    Word: {
        BulkUpsert: "upsert_words",
        GetMany: "get_words",
        Delete: "delete_word",
    },
};
