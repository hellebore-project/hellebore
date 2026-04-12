import { SvelteMap } from "svelte/reactivity";

import { ROOT_FOLDER_ID, SidebarSectionType } from "@/constants";
import type {
    FolderResponse,
    EntryInfoResponse,
    Id,
    ISidebarSectionService,
    OpenEntryEditorEvent,
} from "@/interface";
import type { TreeNode } from "@/lib/components/file-tree";
import { FileTreeService } from "@/lib/components/file-tree";
import type { DomainManager } from "@/services";
import { EventProducer } from "@/utils/event-producer";
import { SoleOwnership, type BaseOwnership } from "@/utils/ownership";

import type { SpotlightNodeData } from "./entry-spotlight-interface";

export interface EntrySpotlightServiceArgs {
    domain: DomainManager;
    folderNodeId: (id: number) => string;
    rawFolderId: (nodeId: string) => number;
    entryNodeId: (id: number) => string;
    createPlaceholderId: () => string;
}

const ROOT_NODE_ID = "root";

export class EntrySpotlightService implements ISidebarSectionService {
    // CONSTANTS
    readonly type = SidebarSectionType.Spotlight;
    readonly title = "Spotlight";

    // STATE VARIABLES
    open: boolean = $state(true);
    ownership: BaseOwnership;

    private _focused: boolean = $state(false);
    private _displayedEntryId: Id | null = $state(null);

    // SERVICES
    private _domain: DomainManager;

    // CALLBACKS
    private _folderNodeId: (id: number) => string;
    private _rawFolderId: (nodeId: string) => number;
    private _entryNodeId: (id: number) => string;
    private _createPlaceholderId: () => string;

    // EVENTS
    onOpenEntry: EventProducer<OpenEntryEditorEvent, unknown>;

    // TREE SERVICE
    readonly fileTreeService: FileTreeService<SpotlightNodeData>;

    constructor({
        domain,
        folderNodeId,
        rawFolderId,
        entryNodeId,
        createPlaceholderId,
    }: EntrySpotlightServiceArgs) {
        this._domain = domain;
        this._folderNodeId = folderNodeId;
        this._rawFolderId = rawFolderId;
        this._entryNodeId = entryNodeId;
        this._createPlaceholderId = createPlaceholderId;
        this.ownership = new SoleOwnership();
        this.onOpenEntry = new EventProducer();
        this.fileTreeService = new FileTreeService<SpotlightNodeData>({
            id: `${this.id}-file-tree`,
            onFinalize: (parentId, items, id) =>
                this.finalizeMove(parentId, items, id),
            onConfirmEdit: (node) => this.confirmFolderName(node),
            onSelectLeaf: (node) => this.selectEntry(node),
        });
    }

    get id() {
        return this.type;
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
        return this.open;
    }

    get canCollapseAll() {
        return this.open;
    }

    // TREE STRUCTURE

    collapseAll() {
        this.fileTreeService.collapseAll();
    }

    // DND HANDLERS

    async finalizeMove(
        parentId: string,
        items: TreeNode<SpotlightNodeData>[],
        movedItemId: string,
    ) {
        const movedNode = items.find((n) => n.id === movedItemId);
        if (!movedNode) return;

        const newParentFolderId =
            parentId === ROOT_NODE_ID
                ? ROOT_FOLDER_ID
                : this._rawFolderId(parentId);

        if (!movedNode.isFolder) {
            await this._domain.entries.update({
                id: movedNode.data.rawId,
                folderId: newParentFolderId,
            });
        } else {
            const oldParentFolderId =
                movedNode.parent === ROOT_NODE_ID
                    ? ROOT_FOLDER_ID
                    : this._rawFolderId(movedNode.parent);
            await this._domain.folders.update({
                id: movedNode.data.rawId,
                parentId: newParentFolderId,
                oldParentId: oldParentFolderId,
            });
        }

        movedNode.parent = parentId;
    }

    // SELECTION & DISPLAY

    selectEntry(node: TreeNode<SpotlightNodeData>) {
        this._focused = true;
        this._displayedEntryId = node.data.rawId;
        this.onOpenEntry.produce({ id: node.data.rawId });
    }

    setDisplayedEntryId(id: Id | null) {
        this._displayedEntryId = id;
        this.fileTreeService.selectedNodeId =
            id !== null ? this._entryNodeId(id) : null;
    }

    // ADD FOLDER

    get selectedFolderId(): string {
        return ROOT_NODE_ID;
    }

    addFolder() {
        const parentId = this.selectedFolderId;
        const placeholderId = this._createPlaceholderId();
        const placeholder: TreeNode<SpotlightNodeData> = {
            id: placeholderId,
            parent: parentId,
            text: "",
            isFolder: true,
            isEditable: true,
            editableText: "",
            data: { rawId: -1 },
        };

        this.fileTreeService.addNode(parentId, placeholder);
    }

    async confirmFolderName(node: TreeNode<SpotlightNodeData>) {
        const name = node.editableText?.trim() ?? "";
        if (!name) {
            this.fileTreeService.removeNode(node.id);
            return;
        }

        const parentFolderId =
            node.parent === ROOT_NODE_ID
                ? ROOT_FOLDER_ID
                : this._rawFolderId(node.parent);

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
            this.fileTreeService.removeNode(node.id);
            return;
        }

        const newNode: TreeNode<SpotlightNodeData> = {
            id: this._folderNodeId(created.id),
            parent: node.parent,
            text: created.name,
            isFolder: true,
            data: { rawId: created.id },
        };
        this.fileTreeService.replaceNode(node.id, newNode);
        this.fileTreeService.setChildrenOf(this._folderNodeId(created.id), []);
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
        this.fileTreeService.clearTree();
        this._displayedEntryId = null;
        this.onOpenEntry.clear();
    }

    private _load(folders: FolderResponse[], entries: EntryInfoResponse[]) {
        const map = new SvelteMap<string, TreeNode<SpotlightNodeData>[]>();
        map.set(ROOT_NODE_ID, []);

        for (const folder of folders) {
            const nodeId = this._folderNodeId(folder.id);
            const parentNodeId =
                folder.parentId === ROOT_FOLDER_ID
                    ? ROOT_NODE_ID
                    : this._folderNodeId(folder.parentId);

            const node: TreeNode<SpotlightNodeData> = {
                id: nodeId,
                parent: parentNodeId,
                text: folder.name,
                isFolder: true,
                data: { rawId: folder.id },
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
                    : this._folderNodeId(entry.folderId);

            const node: TreeNode<SpotlightNodeData> = {
                id: this._entryNodeId(entry.id),
                parent: parentNodeId,
                text: entry.title,
                isFolder: false,
                data: { rawId: entry.id },
            };

            if (!map.has(parentNodeId)) {
                map.set(parentNodeId, []);
            }
            map.get(parentNodeId)!.push(node);
        }

        this.fileTreeService.load(map);
    }
}
