export interface MentionItemData {
    label: string;
}

export interface MentionArgs<I extends MentionItemData> {
    prefix?: string;
    querier: (arg: string) => Promise<I[]>;
}
