import type { IComponentService } from "@/interface";
import { MultiEventProducer } from "@/utils/event-producer";

export interface PaginationServiceArgs {
    id: string;
    page?: number;
    count?: number;
}

export class PaginationService implements IComponentService {
    private _id: string;
    private _page: number = $state(0); // 0-based index
    private _count: number = $state(1); // total number of pages

    onChangePage: MultiEventProducer<number, unknown>;

    constructor({ id, page = 0, count = 1 }: PaginationServiceArgs) {
        this._id = id;
        this._page = page;
        this._count = count;
        this.onChangePage = new MultiEventProducer();
    }

    get id() {
        return this._id;
    }

    get page() {
        return this._page;
    }

    set page(value: number) {
        if (value !== this._page) {
            this._page = value;
            this.onChangePage.produce(value);
        }
    }

    get isFirstPage() {
        return this._page === 0;
    }

    get isLastPage() {
        return this._page === this._count - 1;
    }

    get count() {
        return this._count;
    }

    set count(count: number) {
        this._count = count;
    }

    goToFirstPage() {
        this.page = 0;
    }

    goToLastPage() {
        this.page = this._count - 1;
    }

    goToNextPage() {
        if (this._page < this._count - 1) this.page = this._page + 1;
    }

    goToPreviousPage() {
        if (this._page > 0) this.page = this._page - 1;
    }
}
