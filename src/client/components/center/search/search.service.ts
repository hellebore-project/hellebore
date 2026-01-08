import { makeAutoObservable } from "mobx";

import { CentralViewType } from "@/client/constants";
import { ICentralPanelContentService } from "@/client/interface";
import { DomainManager } from "@/domain";

import { EntrySearchService } from "../../shared/entry-search-field";

export class SearchService implements ICentralPanelContentService {
    entrySearch: EntrySearchService;

    constructor(domain: DomainManager) {
        this.entrySearch = new EntrySearchService(domain);

        makeAutoObservable(this, { entrySearch: false });
    }

    get key() {
        return this.type;
    }

    get type() {
        return CentralViewType.Search;
    }

    get details() {
        return { type: this.type };
    }

    load() {
        return;
    }

    activate() {
        return;
    }

    cleanUp() {
        return;
    }
}
