export abstract class BaseOwnership {
    abstract get isOwned(): boolean;
    abstract isOwnedBy(ownerId: string): boolean;
    abstract add(ownerId: string): void;
    abstract remove(ownerId: string): void;
}

export class SoleOwnership extends BaseOwnership {
    ownerId: string | null = null;

    get isOwned(): boolean {
        return this.ownerId !== null;
    }

    isOwnedBy(ownerId: string) {
        return this.ownerId === ownerId;
    }

    add(ownerId: string) {
        this.ownerId = ownerId;
    }

    remove(ownerId: string) {
        if (this.ownerId === ownerId) this.ownerId = null;
    }
}
