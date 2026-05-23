import { SvelteSet } from "svelte/reactivity";

import { ROOT_FOLDER_ID, SidebarSectionType, SyncType } from "@/constants";
import type {
    BulkFileResponse,
    DeleteEntryEvent,
    EntryChangeEvent,
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
    DeleteNodeResult,
    NodeTextValidationResult,
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
    private _modifiedEntryNodeIds = new SvelteSet<string>();

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
    onDeleteEntry: EventProducer<DeleteEntryEvent, Promise<boolean>>;
    onChangeTitle: EventProducer<EntryChangeEvent, unknown>;

    constructor(domain: DomainManager) {
        this._domain = domain;

        this.ownership = new SoleOwnership();
        this.onOpenEntry = new EventProducer();
        this.onMoveFolder = new EventProducer();
        this.onDeleteFolder = new EventProducer();
        this.onDeleteEntry = new EventProducer();

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
        this.fileTree.onDeleteNode.subscribe((node) => this.deleteNode(node));
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
                id: this.generateFolderNodeId(folder.id),
                parentId: this.generateFolderNodeId(folder.parentId),
                text: folder.name,
                data: {
                    id: folder.id,
                    titleChanged: false,
                    folderIdChanged: false,
                },
            };
            folderNodes.push(node);
        }

        const entryNodes = [];
        for (const entry of entries) {
            const node: TreeNode<SpotlightNodeData> = {
                id: this.generateEntryNodeId(entry.id),
                parentId: this.generateFolderNodeId(entry.folderId),
                text: entry.title,
                isFolder: false,
                data: {
                    id: entry.id,
                    titleChanged: false,
                    folderIdChanged: false,
                },
            };
            entryNodes.push(node);
        }

        this.fileTree.load(folderNodes, entryNodes);
    }

    // SYNC

    fetchChanges(event: PollEvent): PollResultEntryData[] {
        const results: PollResultEntryData[] = [];

        if (event.type === SyncType.FULL) {
            for (const nodeId of this._modifiedEntryNodeIds) {
                const node = this.fileTree.getNode(nodeId);
                if (
                    !node ||
                    node.data.id === null ||
                    (!node.data.titleChanged && !node.data.folderIdChanged)
                )
                    continue;

                const result: PollResultEntryData = { id: node.data.id };

                if (node.data.titleChanged) result.title = node.text;
                if (node.data.folderIdChanged) {
                    const parentFolderId = this._getFolderIdFromNodeId(
                        node.parentId,
                    );
                    if (parentFolderId !== null)
                        result.folderId = parentFolderId;
                }

                results.push(result);
            }
        } else if (event.type === SyncType.PARTIAL && event.entries) {
            for (const entry of event.entries) {
                if (!entry.syncTitle && !entry.syncFolderId) continue;

                const node = this._getEntryNodeByDataId(entry.id);
                if (
                    !node ||
                    node.data.id === null ||
                    (!node.data.titleChanged && !node.data.folderIdChanged)
                )
                    continue;

                const result: PollResultEntryData = { id: node.data.id };

                if (entry.syncTitle && node.data.titleChanged)
                    result.title = node.text;
                if (entry.syncFolderId && node.data.folderIdChanged) {
                    const parentFolderId = this._getFolderIdFromNodeId(
                        node.parentId,
                    );
                    if (parentFolderId !== null)
                        result.folderId = parentFolderId;
                }

                results.push(result);
            }
        }

        return results;
    }

    handleSynchronization(events: SyncEntryEvent[]) {
        for (const { request, response } of events) {
            const node = this._getEntryNodeByDataId(request.id);
            if (!node) continue;

            if (request.title && response.entry?.title.updated)
                node.data.titleChanged = false;
            if (
                request.folderId !== undefined &&
                response.entry?.folderId.updated
            )
                node.data.folderIdChanged = false;

            if (!node.data.titleChanged && !node.data.folderIdChanged)
                this._modifiedEntryNodeIds.delete(node.id);
        }
    }

    // CLEAN UP

    cleanUp() {
        this.fileTree.clear();
        this.onOpenEntry.clear();
        this.onMoveFolder.clear();
        this.onDeleteFolder.clear();
        this.onDeleteEntry.clear();
        this.onChangeTitle.clear();
        this._modifiedEntryNodeIds.clear();
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
        if (id === null) {
            this.fileTree.selectedNodeId = null;
            return;
        }

        const node = this._getEntryNodeByDataId(id);
        this.fileTree.selectedNodeId = node?.id ?? null;
    }

    // ADD NODE

    addPlaceholderForNewFolder() {
        const parentId = this.fileTree.selectedFolderId;
        const placeholderId = this._generatePlaceholderNodeId();
        const node = this.fileTree.addFolderNode({
            id: placeholderId,
            parentId,
            text: "",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });
        this.fileTree.makeNodeEditable(node);
    }

    addEntryNode(entry: EntryInfoResponse) {
        const parentNode = this._getFolderNodeByDataId(entry.folderId);
        if (!parentNode) {
            console.error(
                `Cannot add entry ${entry.id}; folder node for folder ${entry.folderId} was not found.`,
            );
            return;
        }

        this.fileTree.addLeafNode({
            id: this.generateEntryNodeId(entry.id),
            parentId: parentNode.id,
            text: entry.title,
            data: { id: entry.id, titleChanged: false, folderIdChanged: false },
        });
    }

    // DELETE NODE

    deleteFolderNode(id: Id) {
        const node = this._getFolderNodeByDataId(id);
        if (!node) return;
        this.fileTree.removeNodeById(node.id);
    }

    deleteEntryNode(id: Id) {
        const node = this._getEntryNodeByDataId(id);
        if (!node) return;
        this.fileTree.removeNodeById(node.id);
    }

    async deleteNode(
        node: TreeNode<SpotlightNodeData>,
    ): Promise<DeleteNodeResult> {
        if (node.id === ROOT_NODE_ID)
            return {
                canDelete: false,
                reason: "The root node cannot be deleted.",
            };

        const id = node.data.id;
        if (id === null)
            return {
                canDelete: false,
                reason: "The selected node cannot be deleted yet.",
            };

        if (node.isFolder) {
            const response = await this.onDeleteFolder.produce({
                id,
                name: node.text,
            });

            if (!response)
                return {
                    canDelete: false,
                    reason: `Failed to delete folder ${id}.`,
                };
        } else {
            const success = await this.onDeleteEntry.produce({
                id,
                title: node.text,
            });

            if (!success)
                return {
                    canDelete: false,
                    reason: `Failed to delete entry ${id}.`,
                };
        }

        return { canDelete: true };
    }

    // MOVE NODE

    async finalizeMove(
        node: TreeNode<SpotlightNodeData>,
        destParentNodeId: string,
    ): Promise<boolean> {
        const destNode = this.fileTree.getNode(destParentNodeId);
        if (!destNode) {
            console.error(
                `Destination parent node ${destParentNodeId} not found.`,
            );
            return false;
        }

        const destParentFolderId = destNode.data.id;
        if (destParentFolderId === null) {
            console.error(
                `Destination parent node ${destParentNodeId} has null folder id.`,
            );
            return false;
        }

        let moved = false;
        let cancelled = false;

        if (node.isFolder) {
            if (node.data.id === null)
                console.error(`Folder node ${node.id} has null folder id.`);
            else {
                const sourceParentFolderId = this._getFolderIdFromNodeId(
                    node.parentId,
                );
                if (sourceParentFolderId === null) {
                    console.error(
                        `Source parent node ${node.parentId} has null folder id.`,
                    );
                    return false;
                }

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
                node.data.folderIdChanged = true;
                this._modifiedEntryNodeIds.add(node.id);
                this.onChangeTitle.produce({
                    id: node.data.id,
                    folderIdChanged: true,
                    syncImmediately: false,
                });
                moved = true;
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
        const node = this._getEntryNodeByDataId(id);
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

        if (id === null) {
            console.debug(
                `Creating new folder for node ${node.id} with name "${name}"`,
            );

            const parentFolderId = this._getFolderIdFromNodeId(node.parentId);
            if (parentFolderId === null) {
                console.error(
                    `Parent folder node ${node.parentId} has null folder id.`,
                );
                return null;
            }

            const createResponse = await this._domain.folders.create(
                name,
                parentFolderId,
            );
            if (!createResponse) return null;

            return {
                id: node.id,
                text: name,
                data: {
                    id: createResponse.id,
                    titleChanged: false,
                    folderIdChanged: false,
                },
            };
        }

        console.debug(
            `Updating folder for node ${node.id} with folder id ${id} and name "${name}"`,
            id,
        );

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

        node.data.titleChanged = true;
        this._modifiedEntryNodeIds.add(node.id);
        this.onChangeTitle.produce({
            id,
            titleChanged: true,
            syncImmediately: true,
        });

        return { id: node.id, text: name, data: node.data };
    }

    async validateName(
        node: TreeNode<SpotlightNodeData>,
        text: string,
    ): Promise<NodeTextValidationResult> {
        const trimmed = text.trim();
        if (!trimmed) {
            if (this.fileTree.isFolderNode(node))
                return {
                    valid: false,
                    error: "Folder name cannot be blank.",
                };
            else
                return {
                    valid: false,
                    error: "Entry title cannot be blank.",
                };
        }

        const id = node.data.id;

        if (this.fileTree.isFolderNode(node)) {
            const parentFolderId = this._getFolderIdFromNodeId(node.parentId);
            if (parentFolderId === null)
                return {
                    valid: false,
                    error: "Parent folder is not available yet.",
                };

            const validationResponse = await this._domain.folders.validate(
                id,
                parentFolderId,
                trimmed,
            );

            if (!validationResponse)
                return { valid: false, error: "Folder validation failed." };

            if (
                validationResponse.nameCollision &&
                !validationResponse.nameCollision.isUnique
            )
                return {
                    valid: false,
                    error: `A folder named "${trimmed}" already exists at this location.`,
                };
        } else {
            const isValid = await this._domain.entries.validateTitle(
                id,
                trimmed,
            );

            if (isValid === null)
                return { valid: false, error: "Entry validation failed." };

            if (!isValid)
                return {
                    valid: false,
                    error: `An entry named "${trimmed}" already exists.`,
                };
        }

        return { valid: true };
    }

    handleContextMenuItemRename(node: TreeNode<SpotlightNodeData>) {
        this.fileTree.onCloseContextMenu = () =>
            this.fileTree.makeNodeEditable(node);
    }

    handleContextMenuItemDelete(node: TreeNode<SpotlightNodeData>) {
        void this.fileTree.handleContextMenuItemDelete(node);
    }

    // UTILITY

    private _getFolderNodeByDataId(id: Id): TreeNode<SpotlightNodeData> | null {
        if (id === ROOT_FOLDER_ID) return this.fileTree.rootNode;
        return this.fileTree.findNode(
            (node) => node.isFolder && node.data.id === id,
        );
    }

    private _getEntryNodeByDataId(id: Id): TreeNode<SpotlightNodeData> | null {
        return this.fileTree.findNode(
            (node) => !node.isFolder && node.data.id === id,
        );
    }

    private _getFolderIdFromNodeId(nodeId: string): Id | null {
        if (nodeId === ROOT_NODE_ID) return ROOT_FOLDER_ID;

        const node = this.fileTree.getNode(nodeId);
        if (!node || !node.isFolder || node.data.id === null) return null;

        return node.data.id;
    }

    generateFolderNodeId(id: Id) {
        if (id === ROOT_FOLDER_ID) return ROOT_NODE_ID;
        return `folder-${id}`;
    }

    generateEntryNodeId(id: Id) {
        return `entry-${id}`;
    }

    private _generatePlaceholderNodeId() {
        return `new-${Date.now()}`;
    }
}
