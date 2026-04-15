import { SvelteMap } from "svelte/reactivity";

import { ROOT_FOLDER_ID, SidebarSectionType } from "@/constants";
import type {
    BulkFileResponse,
    DeleteFolderEvent,
    FolderResponse,
    EntryInfoResponse,
    Id,
    ISidebarSectionService,
    MoveFolderEvent,
    MoveFolderResult,
    OpenEntryEditorEvent,
} from "@/interface";
import type { TreeNode } from "@/lib/components/file-tree";
import { FileTreeService } from "@/lib/components/file-tree";
import type { DomainManager } from "@/services";
import { EventProducer } from "@/utils/event-producer";
import { SoleOwnership, type BaseOwnership } from "@/utils/ownership";

import type { SpotlightNodeData } from "./entry-spotlight-interface";

const ROOT_NODE_ID = "root";

export class EntrySpotlightService implements ISidebarSectionService {
    // CONSTANTS
    readonly type = SidebarSectionType.EntrySpotlight;
    readonly title = "Spotlight";

    // STATE VARIABLES
    open: boolean = $state(true);
    ownership: BaseOwnership;
    private _focused: boolean = $state(false);

    // SERVICES
    private _domain: DomainManager;
    readonly fileTree: FileTreeService<SpotlightNodeData>;

    // EVENTS
    onOpenEntry: EventProducer<OpenEntryEditorEvent, unknown>;
    onMoveFolder: EventProducer<MoveFolderEvent, Promise<MoveFolderResult>>;
    onDeleteFolder: EventProducer<
        DeleteFolderEvent,
        Promise<BulkFileResponse | null>
    >;

    constructor(domain: DomainManager) {
        this._domain = domain;

        this.ownership = new SoleOwnership();
        this.onOpenEntry = new EventProducer();
        this.onMoveFolder = new EventProducer();
        this.onDeleteFolder = new EventProducer();
        this.fileTree = new FileTreeService<SpotlightNodeData>({
            id: `${this.id}-file-tree`,
            onFinalize: (nodeId, destParentNodeId) =>
                this.finalizeMove(nodeId, destParentNodeId),
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

    get canAddFolder() {
        return this.open;
    }

    get canCollapseAll() {
        return this.open;
    }

    // COLLAPSE NODES

    collapseAll() {
        this.fileTree.collapseAll();
    }

    // MOVE NODES

    async finalizeMove(
        nodeId: string,
        destParentNodeId: string,
    ): Promise<boolean> {
        const node = this.fileTree.getNode(nodeId);
        if (!node) return false;

        const destParentFolderId = this.toFolderId(destParentNodeId);

        let moved: boolean;
        let cancelled = false;

        if (node.isFolder) {
            const sourceParentFolderId = this.toFolderId(node.parent);
            const result = await this.onMoveFolder.produce({
                id: node.data.rawId,
                title: node.text,
                sourceParentId: sourceParentFolderId,
                destParentId: destParentFolderId,
            });

            moved = result.moved;
            cancelled = result.cancelled;
        } else {
            const response = await this._domain.entries.update({
                id: node.data.rawId,
                folderId: destParentFolderId,
            });
            if (response) moved = response.folderId.updated;
            else moved = false;
        }

        if (!moved && !cancelled)
            console.error(
                `Unable to move node ${node.id} to folder ${destParentFolderId}.`,
            );
        if (!moved) return false;

        node.parent = destParentNodeId;

        return true;
    }

    // SELECTION & DISPLAY

    selectEntry(node: TreeNode<SpotlightNodeData>) {
        this._focused = true;
        this.onOpenEntry.produce({ id: node.data.rawId });
    }

    setDisplayedEntry(id: Id | null) {
        const nodeId = id !== null ? this.toEntryNodeId(id) : null;
        this.fileTree.selectedNodeId = nodeId;
    }

    // ADD FOLDER

    addFolder() {
        const parentId = this.fileTree.selectedFolderId;
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

        this.fileTree.addNode(parentId, placeholder);
    }

    // NODE MUTATION

    addEntryNode(entry: EntryInfoResponse) {
        const parentNodeId =
            entry.folderId === ROOT_FOLDER_ID
                ? ROOT_NODE_ID
                : this.toFolderNodeId(entry.folderId);
        const node: TreeNode<SpotlightNodeData> = {
            id: this.toEntryNodeId(entry.id),
            parent: parentNodeId,
            text: entry.title,
            isFolder: false,
            data: { rawId: entry.id },
        };
        this.fileTree.addNode(parentNodeId, node);
    }

    deleteEntryNode(id: Id) {
        this.fileTree.removeNode(this.toEntryNodeId(id));
    }

    deleteManyNodes(entryIds: Id[], folderIds: Id[]) {
        for (const id of entryIds)
            this.fileTree.removeNode(this.toEntryNodeId(id));
        for (const id of folderIds)
            this.fileTree.removeNode(this.toFolderNodeId(id));
    }

    updateEntryText(id: Id, title: string) {
        const nodeId = this.toEntryNodeId(id);
        const node = this.fileTree.getNode(nodeId);
        if (!node) return;
        this.fileTree.setNode(nodeId, { ...node, text: title });
    }

    async confirmFolderName(node: TreeNode<SpotlightNodeData>) {
        const name = node.editableText?.trim() ?? "";
        if (!name) {
            this.fileTree.removeNode(node.id);
            return;
        }

        const parentFolderId = this.toFolderId(node.parent);

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
            this.fileTree.removeNode(node.id);
            return;
        }

        const newNode: TreeNode<SpotlightNodeData> = {
            id: this.toFolderNodeId(created.id),
            parent: node.parent,
            text: created.name,
            isFolder: true,
            data: { rawId: created.id },
        };
        this.fileTree.setNode(node.id, newNode);
        this.fileTree.setChildren(this.toFolderNodeId(created.id), []);
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

    private _load(folders: FolderResponse[], entries: EntryInfoResponse[]) {
        const map = new SvelteMap<string, TreeNode<SpotlightNodeData>[]>();
        map.set(ROOT_NODE_ID, []);

        for (const folder of folders) {
            const nodeId = this.toFolderNodeId(folder.id);
            const parentNodeId =
                folder.parentId === ROOT_FOLDER_ID
                    ? ROOT_NODE_ID
                    : this.toFolderNodeId(folder.parentId);

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
                    : this.toFolderNodeId(entry.folderId);

            const node: TreeNode<SpotlightNodeData> = {
                id: this.toEntryNodeId(entry.id),
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

        this.fileTree.load(map);
    }

    cleanUp() {
        this.fileTree.clear();
        this.onOpenEntry.clear();
        this.onMoveFolder.clear();
        this.onDeleteFolder.clear();
    }

    // UTILITY

    toFolderNodeId(id: Id) {
        return `folder-${id}`;
    }

    toFolderId(nodeId: string) {
        if (nodeId === ROOT_NODE_ID) return ROOT_FOLDER_ID;
        return parseInt(nodeId.replace("folder-", ""));
    }

    toEntryNodeId(id: Id) {
        return `entry-${id}`;
    }

    toEntryId(nodeId: string) {
        return parseInt(nodeId.replace("entry-", ""));
    }

    private _createPlaceholderId() {
        return `placeholder-${Date.now()}`;
    }
}
