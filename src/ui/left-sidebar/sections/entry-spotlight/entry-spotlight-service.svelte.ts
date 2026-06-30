import { SvelteSet } from "svelte/reactivity";

import { SidebarSectionType, SyncType } from "@/constants";
import type {
    FolderChangeEvent,
    FolderCreationEvent,
    DeleteEntryEvent,
    EntryChangeEvent,
    DeleteFolderEvent,
    Id,
    ISidebarSectionService,
    MoveFolderEvent,
    MoveFolderResult,
    OpenEntryEditorEvent,
    PollEvent,
    PollResult,
    PollResultEntryData,
    PollResultFolderData,
    SyncEvent,
    OperationResult,
} from "@/interface";
import {
    ROOT_FOLDER_ID,
    DomainManager,
    type BulkEntryResponse,
    type FolderResponse,
    type EntryInfoResponse,
} from "@/api";
import { ClientData } from "@/models";
import { type TreeNode, TreeService } from "@/lib/components/tree";
import { EventProducer } from "@/utils/event-producer";
import { SoleOwnership, type BaseOwnership } from "@/utils/ownership";

import type { SpotlightNodeData } from "./entry-spotlight-interface";
import type {
    TreeNodeInfo,
    TreeNodeTextEdit,
} from "@/lib/components/tree/tree-interface";

const ROOT_NODE_ID = "root";

export class EntrySpotlightService implements ISidebarSectionService {
    // CONSTANTS
    readonly type = SidebarSectionType.EntrySpotlight;
    readonly title = "Spotlight";

    // STATE VARIABLES
    open: boolean = $state(true);
    ownership: BaseOwnership;
    private _focused: boolean = $state(false);
    private _modifiedFolderNodeIds = new SvelteSet<string>();
    private _modifiedEntryNodeIds = new SvelteSet<string>();

    // SERVICES
    private _domain: DomainManager;
    private _data: ClientData;
    readonly tree: TreeService<SpotlightNodeData>;

    // EVENTS
    onCreateFolder: EventProducer<
        FolderCreationEvent,
        Promise<FolderResponse | null>
    >;
    onChangeFolder: EventProducer<FolderChangeEvent, unknown>;
    onMoveFolder: EventProducer<MoveFolderEvent, Promise<MoveFolderResult>>;
    onDeleteFolder: EventProducer<
        DeleteFolderEvent,
        Promise<BulkEntryResponse | null>
    >;
    onOpenEntry: EventProducer<OpenEntryEditorEvent, unknown>;
    onChangeEntry: EventProducer<EntryChangeEvent, unknown>;
    onDeleteEntry: EventProducer<DeleteEntryEvent, Promise<boolean>>;

    constructor(domain: DomainManager, data: ClientData) {
        this._domain = domain;
        this._data = data;

        this.ownership = new SoleOwnership();
        this.onOpenEntry = new EventProducer();
        this.onCreateFolder = new EventProducer();
        this.onMoveFolder = new EventProducer();
        this.onDeleteFolder = new EventProducer();
        this.onDeleteEntry = new EventProducer();

        this.onChangeEntry = new EventProducer();
        this.onChangeFolder = new EventProducer();
        this.tree = new TreeService<SpotlightNodeData>({
            id: `${this.id}-file-tree`,
            rootNodeId: ROOT_NODE_ID,
        });

        this.tree.afterNodeMove.subscribe(({ node, destParentNodeId }) =>
            this.finalizeMove(node, destParentNodeId),
        );
        this.tree.onCommitNodeTextEdit.subscribe((node) =>
            this.updateName(node),
        );
        this.tree.onValidateNodeText.subscribe(({ node, text }) =>
            this.validateName(node, text),
        );
        this.tree.onSelectLeafNode.subscribe((node) => this.selectEntry(node));
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
        const projectId = this._data.loadedProjectId;

        const [folders, entries] = await Promise.all([
            this._domain.folders.getAll(projectId),
            this._domain.entries.getAll(projectId),
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
                isBranch: false,
                data: {
                    id: entry.id,
                    titleChanged: false,
                    folderIdChanged: false,
                },
            };
            entryNodes.push(node);
        }

        this.tree.load(folderNodes, entryNodes);
    }

    // SYNC

    fetchChanges(event: PollEvent): PollResult {
        const entries: PollResultEntryData[] = [];
        const folders: PollResultFolderData[] = [];

        if (event.type === SyncType.FULL) {
            for (const nodeId of this._modifiedFolderNodeIds) {
                const node = this.tree.getNode(nodeId);
                if (!node || !node.data.titleChanged) continue;

                const parentFolderId = this._getFolderIdFromNodeId(
                    node.parentId,
                );
                if (parentFolderId === null) continue;
                if (node.data.id === null) continue;

                folders.push({
                    id: node.data.id,
                    parentId: parentFolderId,
                    name: node.text,
                });
            }

            for (const nodeId of this._modifiedEntryNodeIds) {
                const node = this.tree.getNode(nodeId);
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

                entries.push(result);
            }
        } else if (event.type === SyncType.PARTIAL) {
            if (event.folders) {
                for (const nodeId of this._modifiedFolderNodeIds) {
                    const node = this.tree.getNode(nodeId);
                    if (!node || !node.data.titleChanged) continue;

                    const syncTitle = event.folders.some(
                        (folder) =>
                            folder.syncTitle && folder.id === node.data.id,
                    );
                    if (!syncTitle) continue;

                    const parentFolderId = this._getFolderIdFromNodeId(
                        node.parentId,
                    );
                    if (parentFolderId === null) continue;
                    if (node.data.id === null) continue;

                    folders.push({
                        id: node.data.id,
                        parentId: parentFolderId,
                        name: node.text,
                    });
                }
            }

            if (event.entries) {
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

                    entries.push(result);
                }
            }
        }

        return { entries, folders };
    }

    handleSynchronization({
        folders: folderEvents = [],
        entries: entryEvents = [],
    }: SyncEvent) {
        for (const { request, response } of entryEvents) {
            if (!response.entry) continue;

            const node = this._getEntryNodeByDataId(request.id);
            if (!node) continue;

            if (request.title && response.entry.title.updated) {
                node.text = request.title;
                node.data.titleChanged = false;
            }

            if (
                request.folderId !== undefined &&
                response.entry.folderId.updated
            )
                node.data.folderIdChanged = false;

            if (!node.data.titleChanged && !node.data.folderIdChanged)
                this._modifiedEntryNodeIds.delete(node.id);
        }

        for (const { request, response } of folderEvents) {
            if (!response.folder) continue;

            const node = this._getFolderNodeByDataId(request.id);
            if (!node) continue;

            if (request.name && response.folder.name) {
                node.text = request.name;
                node.data.titleChanged = false;
            }

            if (!node.data.titleChanged && !node.data.folderIdChanged)
                this._modifiedFolderNodeIds.delete(node.id);
        }
    }

    // CLEAN UP

    cleanUp() {
        this.tree.clear();
        this.onOpenEntry.clear();
        this.onCreateFolder.clear();
        this.onMoveFolder.clear();
        this.onDeleteFolder.clear();
        this.onDeleteEntry.clear();
        this.onChangeEntry.clear();
        this.onChangeFolder.clear();
        this._modifiedEntryNodeIds.clear();
        this._modifiedFolderNodeIds.clear();
    }

    // COLLAPSE NODES

    collapseAll() {
        this.tree.collapseAll();
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
            this.tree.selectedNodeId = null;
            return;
        }

        const node = this._getEntryNodeByDataId(id);
        this.tree.selectedNodeId = node?.id ?? null;
    }

    // ADD NODE

    addPlaceholderForNewFolder() {
        const parentId = this.tree.selectedBranchId;
        const placeholderId = this._generatePlaceholderNodeId();
        const node = this.tree.addBranchNode({
            id: placeholderId,
            parentId,
            text: "",
            data: { id: null, titleChanged: false, folderIdChanged: false },
        });
        this.tree.makeNodeEditable(node);
    }

    addEntryNode(entry: EntryInfoResponse) {
        const parentNode = this._getFolderNodeByDataId(entry.folderId);
        if (!parentNode) {
            console.error(
                `Cannot add entry ${entry.id}; folder node for folder ${entry.folderId} was not found.`,
            );
            return;
        }

        this.tree.addLeafNode({
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
        this._modifiedFolderNodeIds.delete(node.id);
        this.tree.removeNodeById(node.id);
    }

    deleteEntryNode(id: Id) {
        const node = this._getEntryNodeByDataId(id);
        if (!node) return;
        this.tree.removeNodeById(node.id);
    }

    async deleteNode(
        node: TreeNode<SpotlightNodeData>,
    ): Promise<OperationResult> {
        if (node.id === ROOT_NODE_ID)
            return {
                success: false,
                message: "The root node cannot be deleted.",
            };

        const id = node.data.id;
        if (id === null)
            return {
                success: false,
                message: "The selected node cannot be deleted yet.",
            };

        if (node.isBranch) {
            const response = await this.onDeleteFolder.produce({
                id,
                name: node.text,
            });

            if (!response)
                return {
                    success: false,
                    message: `Failed to delete folder ${id}.`,
                };
        } else {
            const success = await this.onDeleteEntry.produce({
                id,
                title: node.text,
            });

            if (!success)
                return {
                    success: false,
                    message: `Failed to delete entry ${id}.`,
                };
        }

        return { success: true };
    }

    // MOVE NODE

    async finalizeMove(
        node: TreeNode<SpotlightNodeData>,
        destParentNodeId: string,
    ): Promise<boolean> {
        const destNode = this.tree.getNode(destParentNodeId);
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

        if (node.isBranch) {
            if (node.data.id === null)
                console.error(`Branch node ${node.id} has null folder id.`);
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
                this.onChangeEntry.produce({
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
    ): Promise<OperationResult<TreeNodeTextEdit<SpotlightNodeData>>> {
        const name = node.text?.trim() ?? "";
        if (!name) return { success: false, message: "Name cannot be blank." };

        if (node.isBranch) return await this._upsertFolderName(node, name);

        return this._updateEntryName(node, name);
    }

    private async _upsertFolderName(
        node: TreeNode<SpotlightNodeData>,
        name: string,
    ): Promise<OperationResult<TreeNodeTextEdit<SpotlightNodeData>>> {
        const parentFolderId = this._getFolderIdFromNodeId(node.parentId);

        if (parentFolderId === null)
            return {
                success: false,
                message: `Parent folder node ${node.parentId} has null folder id.`,
            };

        if (node.data.id === null) {
            console.debug(
                `Creating new folder for node ${node.id} with name "${name}"`,
            );
            const folder = await this.onCreateFolder.produce({
                name,
                parentFolderId,
            });
            if (folder !== null) node.data.id = folder.id;
        } else {
            console.debug(
                `Updating folder for node ${node.id} with name "${name}"`,
            );
            node.data.titleChanged = true;
            this._modifiedFolderNodeIds.add(node.id);
            this.onChangeFolder.produce({
                id: node.data.id,
                titleChanged: true,
                syncImmediately: false,
            });
        }

        return {
            success: true,
            output: { id: node.id, text: name, data: node.data },
        };
    }

    private _updateEntryName(
        node: TreeNode<SpotlightNodeData>,
        name: string,
    ): OperationResult<TreeNodeTextEdit<SpotlightNodeData>> {
        const id = node.data.id;
        if (id === null)
            return {
                success: false,
                message: `Cannot rename node ${node.id} with null entry id.`,
            };

        console.debug(
            `Updating entry name for node ${node.id} with name "${name}" and id ${id}`,
        );

        node.data.titleChanged = true;
        this._modifiedEntryNodeIds.add(node.id);
        this.onChangeEntry.produce({
            id,
            titleChanged: true,
            syncImmediately: true,
        });

        return {
            success: true,
            output: { id: node.id, text: name, data: node.data },
        };
    }

    async validateName(
        node: TreeNode<SpotlightNodeData>,
        text: string,
    ): Promise<OperationResult> {
        const trimmed = text.trim();
        if (!trimmed) {
            if (this.tree.isBranchNode(node))
                return {
                    success: false,
                    message: "Folder name cannot be blank.",
                };
            else
                return {
                    success: false,
                    message: "Entry title cannot be blank.",
                };
        }

        const id = node.data.id;

        if (this.tree.isBranchNode(node)) {
            const projectId = this._data.loadedProjectId;

            const parentFolderId = this._getFolderIdFromNodeId(node.parentId);
            if (parentFolderId === null)
                return {
                    success: false,
                    message: "Parent folder is not available yet.",
                };

            const validationResponse = await this._domain.folders.validate(
                projectId,
                id,
                parentFolderId,
                trimmed,
            );

            if (!validationResponse)
                return { success: false, message: "Folder validation failed." };

            if (
                validationResponse.nameCollision &&
                !validationResponse.nameCollision.isUnique
            )
                return {
                    success: false,
                    message: `A folder named "${trimmed}" already exists at this location.`,
                };
        } else {
            const projectId = this._data.loadedProjectId;

            const isValid = await this._domain.entries.validateTitle(
                projectId,
                id,
                trimmed,
            );

            if (isValid === null)
                return { success: false, message: "Entry validation failed." };

            if (!isValid)
                return {
                    success: false,
                    message: `An entry named "${trimmed}" already exists.`,
                };
        }

        return { success: true };
    }

    // CONTEXT MENU

    handleContextMenuItemRename(node: TreeNode<SpotlightNodeData>) {
        this.tree.onCloseContextMenu = () => this.tree.makeNodeEditable(node);
    }

    async handleContextMenuItemDelete(node: TreeNode<SpotlightNodeData>) {
        const result = await this.deleteNode(node);
        if (result && !result.success && result.message)
            console.warn(result.message);
    }

    // UTILITY

    private _getFolderNodeByDataId(id: Id): TreeNode<SpotlightNodeData> | null {
        if (id === ROOT_FOLDER_ID) return this.tree.rootNode;
        return this.tree.findNode(
            (node) => node.isBranch && node.data.id === id,
        );
    }

    private _getEntryNodeByDataId(id: Id): TreeNode<SpotlightNodeData> | null {
        return this.tree.findNode(
            (node) => !node.isBranch && node.data.id === id,
        );
    }

    private _getFolderIdFromNodeId(nodeId: string): Id | null {
        if (nodeId === ROOT_NODE_ID) return ROOT_FOLDER_ID;

        const node = this.tree.getNode(nodeId);
        if (!node || !node.isBranch || node.data.id === null) return null;

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
