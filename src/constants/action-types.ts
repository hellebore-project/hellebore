export enum ViewAction {
    Create = "CREATE",
    Show = "SHOW",
    // Open is a combination of Create and Show;
    // since both of those actions are already enumerated,
    // we don't need one for Open.
    Hide = "HIDE",
    Close = "CLOSE",
}

export enum ChangePageAction {
    PreviousPage = "PREVIOUS_PAGE",
    NextPage = "NEXT_PAGE",
    FirstPage = "FIRST_PAGE",
    LastPage = "LAST_PAGE",
}

export enum SyncType {
    NONE = 0,
    PARTIAL = 1,
    FULL = 2,
}
