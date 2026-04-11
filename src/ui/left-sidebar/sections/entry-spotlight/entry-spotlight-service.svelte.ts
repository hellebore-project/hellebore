import { SvelteMap, SvelteSet } from "svelte/reactivity";

import { ROOT_FOLDER_ID, SidebarSectionType } from "@/constants";
import type {
    FolderResponse,
    EntryInfoResponse,
    Id,
    ISidebarSectionService,
    OpenEntryEditorEvent,
} from "@/interface";
import type { DomainManager } from "@/services";
import { EventProducer } from "@/utils/event-producer";
import { SoleOwnership, type BaseOwnership } from "@/utils/ownership";

export interface SpotlightNode {
    id: string;
    parent: string;
    text: string;
    isFolder: boolean;
    rawId: number;
    isEditable?: boolean;
    editableText?: string;
    isDndShadowItem?: boolean;
}

export interface EntrySpotlightServiceArgs {
    domain: DomainManager;
}

const ROOT_NODE_ID = "root";
const PLACEHOLDER_PREFIX = "placeholder-";

function folderNodeId(id: number): string {
    return `folder-${id}`;
}

function entryNodeId(id: number): string {
    return `entry-${id}`;
}

function rawFolderId(nodeId: string): number {
    return parseInt(nodeId.replace("folder-", ""), 10);
}

function rawEntryId(nodeId: string): number {
    return parseInt(nodeId.replace("entry-", ""), 10);
}

export class EntrySpotlightService implements ISidebarSectionService {
    // CONSTANTS
    readonly type = SidebarSectionType.Spotlight;
    readonly title = "Spotlight";

    // STATE VARIABLES
    open: boolean = $state(true);
    ownership: BaseOwnership;

    private _hover: boolean = $state(false);
    private _focused: boolean = $state(false);
    private _displayedEntryId: Id | null = $state(null);
    private _childrenOf: SvelteMap<string, SpotlightNode[]> = $state(
        new SvelteMap(),
    );
    private _collapsedIds: SvelteSet<string> = $state(new SvelteSet());

    // SERVICES
    private _domain: DomainManager;

    // EVENTS
    onOpenEntry: EventProducer<OpenEntryEditorEvent, unknown>;

    constructor({ domain }: EntrySpotlightServiceArgs) {
        this._domain = domain;
        this.ownership = new SoleOwnership();
        this.onOpenEntry = new EventProducer();
    }

    get id() {
        return this.type;
    }

    get hover() {
        return this._hover;
    }

    set hover(value: boolean) {
        this._hover = value;
    }

    get focused() {
        return this._focused;
    }

    set focused(value: boolean) {
        this._focused = value;
    }

    get displayedEntryId() {
        return this._displayedEntryId;
    }

    get canAddFolder() {
        return this.open && this._hover;
    }

    get canCollapseAll() {
        return this.open && this._hover;
    }

    // TREE STRUCTURE

    childrenOf(parentId: string): SpotlightNode[] {
        return this._childrenOf.get(parentId) ?? [];
    }

    isCollapsed(nodeId: string): boolean {
        return this._collapsedIds.has(nodeId);
    }

    toggleCollapsed(nodeId: string) {
        if (this._collapsedIds.has(nodeId)) {
            this._collapsedIds.delete(nodeId);
        } else {
            this._collapsedIds.add(nodeId);
        }
    }

    collapseAll() {
        const folderIds: string[] = [];
        for (const [parentId] of this._childrenOf) {
            if (parentId !== ROOT_NODE_ID) {
                folderIds.push(parentId);
            }
        }
        this._collapsedIds = new SvelteSet(folderIds);
    }

    // DND HANDLERS

    setChildrenOf(parentId: string, items: SpotlightNode[]) {
        this._childrenOf.set(parentId, items);
    }

    async finalizeMove(
        parentId: string,
        items: SpotlightNode[],
        movedItemId: string,
    ) {
        this._childrenOf.set(parentId, items);

        const movedNode = items.find((n) => n.id === movedItemId);
        if (!movedNode) return;

        const newParentFolderId =
            parentId === ROOT_NODE_ID ? ROOT_FOLDER_ID : rawFolderId(parentId);

        if (!movedNode.isFolder) {
            const entryId = rawEntryId(movedNode.id);
            await this._domain.entries.update({
                id: entryId,
                folderId: newParentFolderId,
            });
        } else {
            const folderId = rawFolderId(movedNode.id);
            const oldParentFolderId =
                movedNode.parent === ROOT_NODE_ID
                    ? ROOT_FOLDER_ID
                    : rawFolderId(movedNode.parent);
            await this._domain.folders.update({
                id: folderId,
                parentId: newParentFolderId,
                oldParentId: oldParentFolderId,
            });
        }

        movedNode.parent = parentId;
    }

    // SELECTION & DISPLAY

    selectEntry(node: SpotlightNode) {
        this._focused = true;
        this.onOpenEntry.produce({ id: node.rawId });
    }

    setDisplayedEntryId(id: Id | null) {
        this._displayedEntryId = id;
    }

    // ADD FOLDER

    get selectedFolderId(): string {
        return ROOT_NODE_ID;
    }

    addFolder() {
        const parentId = this.selectedFolderId;
        const placeholderId = `${PLACEHOLDER_PREFIX}${Date.now()}`;
        const placeholder: SpotlightNode = {
            id: placeholderId,
            parent: parentId,
            text: "",
            isFolder: true,
            rawId: -1,
            isEditable: true,
            editableText: "",
        };

        const current = this._childrenOf.get(parentId) ?? [];
        this._childrenOf.set(parentId, [...current, placeholder]);
    }

    setFolderEditText(nodeId: string, text: string) {
        for (const [parentId, children] of this._childrenOf) {
            const node = children.find((n) => n.id === nodeId);
            if (node) {
                node.editableText = text;
                this._childrenOf.set(parentId, [...children]);
                return;
            }
        }
    }

    async confirmFolderName(node: SpotlightNode) {
        const name = node.editableText?.trim() ?? "";
        if (!name) {
            this._removePlaceholder(node.id);
            return;
        }

        const parentFolderId =
            node.parent === ROOT_NODE_ID
                ? ROOT_FOLDER_ID
                : rawFolderId(node.parent);

        const validation = await this._domain.folders.validate(
            null,
            parentFolderId,
            name,
        );
        if (validation?.nameCollision && !validation.nameCollision.isUnique) {
            return;
        }

        const created = await this._domain.folders.create(name, parentFolderId);
        if (!created) {
            this._removePlaceholder(node.id);
            return;
        }

        const newNode: SpotlightNode = {
            id: folderNodeId(created.id),
            parent: node.parent,
            text: created.name,
            isFolder: true,
            rawId: created.id,
        };
        this._replacePlaceholder(node.id, newNode);
        this._childrenOf.set(folderNodeId(created.id), []);
    }

    cancelFolderName(node: SpotlightNode) {
        this._removePlaceholder(node.id);
    }

    private _removePlaceholder(placeholderId: string) {
        for (const [parentId, children] of this._childrenOf) {
            const index = children.findIndex((n) => n.id === placeholderId);
            if (index >= 0) {
                const updated = children.filter((n) => n.id !== placeholderId);
                this._childrenOf.set(parentId, updated);
                return;
            }
        }
    }

    private _replacePlaceholder(placeholderId: string, newNode: SpotlightNode) {
        for (const [parentId, children] of this._childrenOf) {
            const index = children.findIndex((n) => n.id === placeholderId);
            if (index >= 0) {
                const updated = [...children];
                updated[index] = newNode;
                this._childrenOf.set(parentId, updated);
                return;
            }
        }
    }

    // LIFECYCLE

    async activate() {
        const [folders, entries] = await Promise.all([
            this._domain.folders.getAll(),
            this._domain.entries.getAll(),
        ]);

        if (folders !== null && entries !== null) {
            this._load(folders, entries);
        }
    }

    cleanUp() {
        this._childrenOf.clear();
        this._collapsedIds.clear();
        this._displayedEntryId = null;
        this.onOpenEntry.clear();
    }

    private _load(folders: FolderResponse[], entries: EntryInfoResponse[]) {
        const map = new SvelteMap<string, SpotlightNode[]>();
        map.set(ROOT_NODE_ID, []);

        for (const folder of folders) {
            const nodeId = folderNodeId(folder.id);
            const parentNodeId =
                folder.parentId === ROOT_FOLDER_ID
                    ? ROOT_NODE_ID
                    : folderNodeId(folder.parentId);

            const node: SpotlightNode = {
                id: nodeId,
                parent: parentNodeId,
                text: folder.name,
                isFolder: true,
                rawId: folder.id,
            };

            if (!map.has(parentNodeId)) {
                map.set(parentNodeId, []);
            }
            map.get(parentNodeId)!.push(node);

            if (!map.has(nodeId)) {
                map.set(nodeId, []);
            }
        }

        for (const entry of entries) {
            const parentNodeId =
                entry.folderId === ROOT_FOLDER_ID
                    ? ROOT_NODE_ID
                    : folderNodeId(entry.folderId);

            const node: SpotlightNode = {
                id: entryNodeId(entry.id),
                parent: parentNodeId,
                text: entry.title,
                isFolder: false,
                rawId: entry.id,
            };

            if (!map.has(parentNodeId)) {
                map.set(parentNodeId, []);
            }
            map.get(parentNodeId)!.push(node);
        }

        this._childrenOf = map;
    }
}
