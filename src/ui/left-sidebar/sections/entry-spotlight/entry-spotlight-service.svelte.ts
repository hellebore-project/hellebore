import { SvelteMap } from "svelte/reactivity";

import { ROOT_FOLDER_ID, SidebarSectionType } from "@/constants";
import type {
    BulkFileResponse,
    ChangeEntryEvent,
    DeleteFolderEvent,
    FolderResponse,
    EntryInfoResponse,
    Id,
    ISidebarSectionService,
    MoveFolderEvent,
    MoveFolderResult,
    OpenEntryEditorEvent,
    PollEvent,
    PollResultEntryData,
    SyncEntryEvent,
} from "@/interface";
import type { TreeNode } from "@/lib/components/file-tree";
import { FileTreeService } from "@/lib/components/file-tree";
import type { DomainManager } from "@/services";
import { EventProducer } from "@/utils/event-producer";
import { SoleOwnership, type BaseOwnership } from "@/utils/ownership";

import type { SpotlightNodeData } from "./entry-spotlight-interface";
import type {
    TreeNodeInfo,
    TreeNodeTextEdit,
} from "@/lib/components/file-tree/file-tree-interface";

const ROOT_NODE_ID = "root";

export class EntrySpotlightService implements ISidebarSectionService {
    // CONSTANTS
    readonly type = SidebarSectionType.EntrySpotlight;
    readonly title = "Spotlight";

    // STATE VARIABLES
    open: boolean = $state(true);
    ownership: BaseOwnership;
    private _focused: boolean = $state(false);
    private _entryTitleChanges = new SvelteMap<number, string>();

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
    onChangeTitle: EventProducer<ChangeEntryEvent, unknown>;

    constructor(domain: DomainManager) {
        this._domain = domain;

        this.ownership = new SoleOwnership();
        this.onOpenEntry = new EventProducer();
        this.onMoveFolder = new EventProducer();
        this.onDeleteFolder = new EventProducer();

        this.onChangeTitle = new EventProducer();
        this.fileTree = new FileTreeService<SpotlightNodeData>({
            id: `${this.id}-file-tree`,
            rootNodeId: ROOT_NODE_ID,
        });

        this.fileTree.onFinalizeNodeMove.subscribe(
            ({ node, destParentNodeId }) =>
                this.finalizeMove(node, destParentNodeId),
        );
        this.fileTree.onFinalizeNodeTextEdit.subscribe((node) =>
            this.updateName(node),
        );
        this.fileTree.onValidateNodeText.subscribe(({ node, text }) =>
            this.validateName(node, text),
        );
        this.fileTree.onSelectLeafNode.subscribe((node) =>
            this.selectEntry(node),
        );
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

    // LOAD

    async activate() {
        const [folders, entries] = await Promise.all([
            this._domain.folders.getAll(),
            this._domain.entries.getAll(),
        ]);

        this._load(folders ?? [], entries ?? []);
    }

    private _load(folders: FolderResponse[], entries: EntryInfoResponse[]) {
        const folderNodes = [];
        for (const folder of folders) {
            const node: TreeNodeInfo<SpotlightNodeData> = {
                id: this.toFolderNodeId(folder.id),
                parentId: this.toFolderNodeId(folder.parentId),
                text: folder.name,
                data: { id: folder.id },
            };
            folderNodes.push(node);
        }

        const entryNodes = [];
        for (const entry of entries) {
            const node: TreeNode<SpotlightNodeData> = {
                id: this.toEntryNodeId(entry.id),
                parentId: this.toFolderNodeId(entry.folderId),
                text: entry.title,
                isFolder: false,
                data: { id: entry.id },
            };
            entryNodes.push(node);
        }

        this.fileTree.load(folderNodes, entryNodes);
    }

    // SYNC

    fetchChanges({
        id = null,
        syncTitle = false,
    }: PollEvent): PollResultEntryData[] {
        if (!syncTitle || this._entryTitleChanges.size === 0) return [];

        const results: PollResultEntryData[] = [];
        for (const [entryId, title] of this._entryTitleChanges) {
            if (id !== null && id !== entryId) continue;

            const node = this.fileTree.getNode(this.toEntryNodeId(entryId));
            if (!node) continue;

            results.push({ id: entryId, title });
        }
        return results;
    }

    handleSynchronization(events: SyncEntryEvent[]) {
        for (const { request, response } of events) {
            if (!request.title) continue;
            if (!response.entry?.title.updated) continue;

            this._entryTitleChanges.delete(request.id);
        }
    }

    // CLEAN UP

    cleanUp() {
        this.fileTree.clear();
        this.onOpenEntry.clear();
        this.onMoveFolder.clear();
        this.onDeleteFolder.clear();
        this.onChangeTitle.clear();
        this._entryTitleChanges.clear();
    }

    // COLLAPSE NODES

    collapseAll() {
        this.fileTree.collapseAll();
    }

    // SELECTION & DISPLAY

    selectEntry(node: TreeNode<SpotlightNodeData>) {
        this._focused = true;
        if (node.data.id === null) {
            console.error(
                `Cannot open entry for node ${node.id} with null entry id.`,
            );
            return;
        }
        this.onOpenEntry.produce({ id: node.data.id });
    }

    setDisplayedEntry(id: Id | null) {
        const nodeId = id !== null ? this.toEntryNodeId(id) : null;
        this.fileTree.selectedNodeId = nodeId;
    }

    // ADD NODE

    createNewFolder() {
        const parentId = this.fileTree.selectedFolderId;
        const placeholderId = this._createPlaceholderId();
        const node = this.fileTree.addFolderNode({
            id: placeholderId,
            parentId,
            text: "",
            data: { id: -1 },
        });
        this.fileTree.makeNodeEditable(node);
    }

    addEntryNode(entry: EntryInfoResponse) {
        const parentNodeId = this.toFolderNodeId(entry.folderId);
        this.fileTree.addLeafNode({
            id: this.toEntryNodeId(entry.id),
            parentId: parentNodeId,
            text: entry.title,
            data: { id: entry.id },
        });
    }

    // DELETE NODE

    deleteFolderNode(id: Id) {
        this.fileTree.removeNodeById(this.toFolderNodeId(id));
    }

    deleteEntryNode(id: Id) {
        this.fileTree.removeNodeById(this.toEntryNodeId(id));
    }

    // MOVE NODE

    async finalizeMove(
        node: TreeNode<SpotlightNodeData>,
        destParentNodeId: string,
    ): Promise<boolean> {
        const destParentFolderId = this.toFolderId(destParentNodeId);

        let moved = false;
        let cancelled = false;

        if (node.isFolder) {
            if (node.data.id === null)
                console.error(`Folder node ${node.id} has null folder id.`);
            else {
                const sourceParentFolderId = this.toFolderId(node.parentId);
                const result = await this.onMoveFolder.produce({
                    id: node.data.id,
                    title: node.text,
                    sourceParentId: sourceParentFolderId,
                    destParentId: destParentFolderId,
                });

                moved = result.moved;
                cancelled = result.cancelled;
            }
        } else {
            if (node.data.id === null) {
                console.error(`Leaf node ${node.id} has null entry id.`);
            } else {
                const response = await this._domain.entries.update({
                    id: node.data.id,
                    folderId: destParentFolderId,
                });

                if (response) moved = response.folderId.updated;
                else moved = false;
            }
        }

        if (!moved && !cancelled)
            console.error(
                `Unable to move node ${node.id} to folder ${destParentFolderId}.`,
            );
        if (!moved) return false;

        return true;
    }

    // UPDATE NODE

    updateEntryText(id: Id, title: string) {
        const nodeId = this.toEntryNodeId(id);
        const node = this.fileTree.getNode(nodeId);
        if (!node) return;
        node.text = title;
    }

    // EDIT NODE TEXT

    async updateName(
        node: TreeNode<SpotlightNodeData>,
    ): Promise<TreeNodeTextEdit<SpotlightNodeData> | null> {
        const name = node.text?.trim() ?? "";
        if (!name) return null;

        if (node.isFolder) return await this._upsertFolderName(node, name);

        return this._updateEntryName(node, name);
    }

    private async _upsertFolderName(
        node: TreeNode<SpotlightNodeData>,
        name: string,
    ): Promise<TreeNodeTextEdit<SpotlightNodeData> | null> {
        const id = node.data.id;

        console.debug(
            `Upserting folder name for node ${node.id} with name "${name}" and id`,
            id,
        );

        if (id === null) {
            const parentFolderId = this.toFolderId(node.parentId);
            const createResponse = await this._domain.folders.create(
                name,
                parentFolderId,
            );
            if (!createResponse) return null;

            return {
                id: node.id,
                text: name,
                data: { id: createResponse.id },
            };
        }

        const updateResponse = await this._domain.folders.update({
            id,
            name,
        });
        if (!updateResponse) return null;

        return { id: node.id, text: name, data: node.data };
    }

    private _updateEntryName(
        node: TreeNode<SpotlightNodeData>,
        name: string,
    ): TreeNodeTextEdit<SpotlightNodeData> | null {
        const id = node.data.id;
        if (id === null) {
            console.error(`Cannot rename node ${node.id} with null entry id.`);
            return null;
        }

        console.debug(
            `Updating entry name for node ${node.id} with name "${name}" and id ${id}`,
        );

        this._entryTitleChanges.set(id, name);
        this.onChangeTitle.produce({ id, poll: { id, syncTitle: true } });

        return { id: node.id, text: name, data: node.data };
    }

    async validateName(
        node: TreeNode<SpotlightNodeData>,
        text: string,
    ): Promise<string | null> {
        const trimmed = text.trim();
        if (!trimmed) return "A name must be provided.";

        const id = node.data.id;

        if (this.fileTree.isFolderNode(node)) {
            const parentFolderId = this.toFolderId(node.parentId);
            const validationResponse = await this._domain.folders.validate(
                id,
                parentFolderId,
                trimmed,
            );
            if (!validationResponse) return null;
            if (
                validationResponse.nameCollision &&
                !validationResponse.nameCollision.isUnique
            ) {
                return `A folder named "${trimmed}" already exists at this location.`;
            }
            return null;
        }

        // entry
        const isValid = await this._domain.entries.validateTitle(id, trimmed);
        if (isValid === null) return null;
        if (!isValid) return `An entry named "${trimmed}" already exists.`;
        return null;
    }

    handleContextMenuItemRename(node: TreeNode<SpotlightNodeData>) {
        this.fileTree.onCloseContextMenu = () =>
            this.fileTree.makeNodeEditable(node);
    }

    // UTILITY

    toFolderNodeId(id: Id) {
        if (id === ROOT_FOLDER_ID) return ROOT_NODE_ID;
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
