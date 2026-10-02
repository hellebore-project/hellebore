import { ChangePageAction } from "@/constants";
import type { ChangePageEvent, IComponentService } from "@/interface";
import { EventProducer } from "@/utils/event-producer";

export interface PaginationServiceArgs {
    id: string;
    page?: number;
    count?: number | null;
    controlled?: boolean;
}

export class PaginationService implements IComponentService {
    // CONFIG
    private _controlled = false;

    // STATE VARIABLES
    private _id: string;
    private _page: number = $state(0); // 0-based index
    private _count: number | null = $state(null); // total number of pages

    onChangePage: EventProducer<ChangePageEvent, unknown>;

    constructor({
        id,
        page = 0,
        count = null,
        controlled = false,
    }: PaginationServiceArgs) {
        this._id = id;
        this._page = page;
        this._count = count;
        this.onChangePage = new EventProducer();
        this._controlled = controlled;
    }

    get id() {
        return this._id;
    }

    get page() {
        return this._page;
    }

    get isFirstPage() {
        return this._page === 0;
    }

    get isLastPage() {
        if (this._count === null) return false;
        return this._page === this._count - 1;
    }

    get count() {
        return this._count;
    }

    get label() {
        if (this._count) return `Page ${this.page + 1} of ${this.count}`;
        return `Page ${this.page + 1}`;
    }

    goToFirstPage() {
        this.changePage(ChangePageAction.FirstPage, 0);
    }

    goToLastPage() {
        if (this._count === null) return;
        this.changePage(ChangePageAction.LastPage, this._count - 1);
    }

    goToNextPage() {
        if (this._count === null || this._page >= this._count - 1) return;
        this.changePage(ChangePageAction.NextPage, this._page + 1);
    }

    goToPreviousPage() {
        if (this._page > 0)
            this.changePage(ChangePageAction.PreviousPage, this._page - 1);
    }

    setPage(pageIndex: number) {
        this._page = pageIndex;
    }

    changePage(action: ChangePageAction, pageIndex: number) {
        if (pageIndex == this._page) return;
        if (!this._controlled) this._page = pageIndex;
        this.onChangePage.produce(
            {
                action,
                oldPageIndex: this._page,
                newPageIndex: pageIndex,
            },
            true,
        );
    }

    setCount(value: number | null) {
        this._count = value;
    }

    reset() {
        this._page = 0;
        this._count = null;
    }
}
