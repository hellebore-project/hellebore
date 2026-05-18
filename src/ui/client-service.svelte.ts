import { ask, open } from "@tauri-apps/plugin-dialog";

import { getCurrentWindow } from "@tauri-apps/api/window";

import type {
    BulkFileResponse,
    FolderUpdateResponse,
    Id,
    MoveFolderEvent,
    MoveFolderResult,
    SyncEvent,
    PollEvent,
    ProjectResponse,
    IComponentService,
    EntryEditorInfo,
    ChangeCentralPanelEvent,
    PollResult,
    DataChangeEvent,
    PollEntryEvent,
    PartialPollEvent,
} from "@/interface";
import {
    CentralViewType,
    EntryType,
    SidebarSectionType,
    SyncType,
    ViewAction,
} from "@/constants";
import { DomainManager, SynchronizationService } from "@/services";

import { CentralPanelManager } from "./centre";
// import { ContextMenuManager } from "./context-menu";
import { FooterManager } from "./footer";
import { HeaderManager } from "./header";
import { ModalManager } from "./modal";
import { LeftSidebarService } from "./left-sidebar";

export class ClientManager implements IComponentService {
    // CONSTANTS
    readonly id = "client";

    // STATE
    private _project: ProjectResponse | null = $state(null);

    // SERVICES
    domain: DomainManager;
    synchronizer: SynchronizationService;
    central: CentralPanelManager;
    header: HeaderManager;
    leftSideBar: LeftSidebarService;
    footer: FooterManager;
    modal: ModalManager;
    // contextMenu: ContextMenuManager;

    // CONSTRUCTION

    constructor() {
        this.domain = new DomainManager();
        this.synchronizer = new SynchronizationService(this.domain);

        // central panel
        this.central = new CentralPanelManager(this.domain);

        // peripheral panels
        this.header = new HeaderManager(this.domain);
        this.footer = new FooterManager(this.domain);
        this.leftSideBar = new LeftSidebarService({
            domain: this.domain,
        });

        // overlays
        this.modal = new ModalManager();
        // this.contextMenu = new ContextMenuManager();

        this._createSubscriptions();
        this.load();
    }

    // PROPERTIES

    get viewSize() {
        const window = getCurrentWindow();
        return window.innerSize();
    }

    get project() {
        return this._project;
    }

    // SUBSCRIPTIONS

    private _createSubscriptions() {
        this.central.onChangePanel.subscribe((event) =>
            this.handleCentralPanelChange(event),
        );
        this.central.onChangeData.subscribe((event) =>
            this._requestSynchronization(event),
        );
        this.central.onDeleteEntry.subscribe(({ id, title }) =>
            this.deleteEntry(id, title),
        );

        this.header.onCreateProject.subscribe(() =>
            this.modal.openProjectCreator(),
        );
        this.header.onLoadProject.subscribe(() => this.loadProject());
        this.header.onCloseProject.subscribe(() => this.closeProject());
        this.header.onOpenHome.subscribe(() =>
            this.central.openHome(this._project),
        );
        this.header.onOpenSettings.subscribe(() => this.central.openSettings());
        this.header.onCreateEntry.subscribe(() =>
            this.modal.openEntryCreator({}),
        );
        this.header.onOpenEntry.subscribe((args) =>
            this.central.openEntryEditor(args),
        );

        this.leftSideBar.onSelectEntryEditorNavItem.subscribe(
            ({ panelId, type }) => {
                this.central.changeEntryEditorView(panelId, type);
            },
        );
        this.leftSideBar.onOpenEntry.subscribe((args) =>
            this.central.openEntryEditor(args),
        );
        this.leftSideBar.onDataChange.subscribe((event) =>
            this._requestSynchronization(event),
        );
        this.leftSideBar.onMoveFolder.subscribe((args) =>
            this.moveFolder(args),
        );
        this.leftSideBar.onDeleteFolder.subscribe(({ id, confirm }) =>
            this.deleteFolder(id, confirm),
        );
        this.leftSideBar.onDeleteEntry.subscribe(({ id, title }) =>
            this.deleteEntry(id, title),
        );
        // spotlight.onOpenFolderContext.subscribe((args) =>
        //     this.contextMenu.openForNavBarFolderNode(args),
        // );
        // spotlight.onOpenEntryContext.subscribe((args) =>
        //     this.contextMenu.openForNavBarEntryNode(args),
        // );

        this.modal.onCreateProject.subscribe(({ name, dbFilePath }) =>
            this.createProject(name, dbFilePath),
        );
        this.modal.onCreateEntry.subscribe(
            ({ entryType: entityType, title, folderId }) =>
                this.createEntry(entityType, title, folderId),
        );

        // this.contextMenu.onEditFolderName.subscribe(({ id }) =>
        //     this.editFolderName(id),
        // );
        // this.contextMenu.onDeleteFolder.subscribe(({ id }) =>
        //     this.deleteFolder(id),
        // );
        // this.contextMenu.onDeleteEntry.subscribe(({ id, title }) =>
        //     this.deleteEntry(id, title),
        // );

        this.synchronizer.onPoll.subscribe((event) =>
            this._collectChanges(event),
        );
        this.synchronizer.onSync.subscribe((event) =>
            this._handleSynchronization(event),
        );
    }

    // LOADING

    async load() {
        const session = await this.domain.session.getSession();
        const project = session?.project ?? null;
        if (project) await this.handleLoadProject(project);
    }

    // CLEAN UP

    cleanUp() {
        this.modal.close();
        this.central.clear();
    }

    // PROJECT HANDLING

    async createProject(name: string, dbFilePath: string) {
        // save any unsynced data before loading a new project
        this.central.clear();

        const response = await this.domain.session.createProject(
            name,
            dbFilePath,
        );

        if (response) {
            this._project = response;
            this.handleLoadProject(response);
            this.central.openHome(response);
        }

        return response;
    }

    async loadProject() {
        const path = await open();
        if (!path) return null;

        // save any unsynced data before loading another project
        this.central.clear();

        const response = await this.domain.session.loadProject(path);
        if (response) {
            this.handleLoadProject(response);
        }

        return response;
    }

    private async handleLoadProject(project: ProjectResponse) {
        this._project = project;

        this.header.handleProjectChange({ loaded: true, project });
        this.footer.handleProjectChange({ loaded: true, project });

        this.leftSideBar.addSpotlight(this.id);

        this.central.handleProjectChange({ loaded: true, project });
        this.central.openHome(project);
    }

    async closeProject() {
        // save any unsynced data before closing the project
        this.central.clear();
        const success = await this.domain.session.closeProject();
        if (success) this.handleCloseProject();
        return success;
    }

    private async handleCloseProject() {
        this._project = null;

        this.header.handleProjectChange({ loaded: false, project: null });
        this.footer.handleProjectChange({ loaded: false, project: null });

        this.leftSideBar.releaseSection({
            ownerId: this.id,
            type: SidebarSectionType.EntrySpotlight,
        });

        this.central.handleProjectChange({ loaded: false, project: null });
        this.central.openHome(null);
    }

    // FOLDER HANDLING

    editFolderName(id: number) {
        // this.leftSideBar.spotlight.toggleFolderAsEditable(id);
        console.log(id);
    }

    async moveFolder({
        id,
        title,
        sourceParentId,
        destParentId,
        confirm = true,
    }: MoveFolderEvent): Promise<MoveFolderResult> {
        let cancel = false;
        let deleteResponse: BulkFileResponse | null = null;
        let updateResponse: FolderUpdateResponse | null = null;

        const validateResponse = await this.domain.folders.validate(
            id,
            destParentId,
            title,
        );

        if (validateResponse) {
            if (validateResponse.nameCollision) {
                if (confirm) {
                    const replace = await ask(
                        `A folder with the name '${title}' already exists in the destination folder. Do you want to replace it?`,
                        {
                            title: "Folder name collision",
                            kind: "warning",
                        },
                    );
                    if (!replace) cancel = true;
                }

                if (!cancel) {
                    deleteResponse = await this.deleteFolder(
                        validateResponse.nameCollision.collidingFolder.id,
                        confirm,
                    );
                    if (!deleteResponse) {
                        console.error(
                            "Failed to delete colliding folder. Aborting move.",
                        );
                        cancel = true;
                    }
                }
            }

            if (!cancel)
                updateResponse = await this.domain.folders.update({
                    id,
                    parentId: destParentId,
                    oldParentId: sourceParentId,
                });
        }

        return {
            moved: updateResponse !== null,
            cancelled: cancel,
            update: updateResponse,
            deletion: deleteResponse,
        };
    }

    async deleteFolder(id: number, confirm = true) {
        if (confirm) {
            const folder = await this.domain.folders.get(id);
            const folderName = folder?.name ?? "UNKNOWN";

            const canDelete = await ask(
                `Are you sure you want to delete folder '${folderName}' and its contents? This action is irreversible.`,
                {
                    title: "Delete folder",
                    kind: "warning",
                    okLabel: "Delete",
                    cancelLabel: "Cancel",
                },
            );
            if (!canDelete) return null;
        }

        const fileIds = await this.domain.folders.delete(id);
        if (!fileIds) return null;

        this.leftSideBar.deleteFolderNode(id);

        let panelIndex = 0;
        for (const panelService of this.central.iteratePanels()) {
            if (panelService.type !== CentralViewType.EntryEditor) continue;

            const entryId = panelService.details.entry?.id;
            if (entryId === undefined) continue;

            if (fileIds.entries.includes(entryId))
                this.central.closePanel(panelIndex);

            panelIndex++;
        }

        if (this.central.panelCount == 0) this.central.openHome(this._project);

        return fileIds;
    }

    // ENTRY HANDLING

    async createEntry(entityType: EntryType, title: string, folderId: Id) {
        const entry = await this.domain.entries.create(
            entityType,
            title,
            folderId,
        );

        if (entry) {
            this.leftSideBar.addEntryNode(entry);
            this.central.openEntryEditor({ id: entry.id });
        }

        return entry;
    }

    async deleteEntry(id: number, title: string, confirm = true) {
        // Currently, the title of the entry could be fetched from the cached file structure
        // rather than providing it as an argument. However, in the future, the file tree will
        // only include pinned entries. Once that feature is implemented, there will be no
        // guarantee that the entry is in the file tree.

        if (confirm) {
            const message =
                `Are you sure you want to delete '${title}' and all of its associated content? ` +
                "This action is irreversible.";
            const canDelete = await ask(message, {
                title: "Delete entry",
                kind: "warning",
                okLabel: "Delete",
                cancelLabel: "Cancel",
            });
            if (!canDelete) return false;
        }

        const success = await this.domain.entries.delete(id);
        if (!success)
            // failed to delete the entry; aborting
            return false;

        this.leftSideBar.deleteEntryNode(id);

        let panelIndex = 0;
        for (const panelService of this.central.iteratePanels()) {
            if (panelService.type !== CentralViewType.EntryEditor) continue;

            const entryId = panelService.details.entry?.id;
            if (entryId === undefined) continue;

            if (entryId == id) this.central.closePanel(panelIndex);

            panelIndex++;
        }

        if (this.central.panelCount == 0) this.central.openHome(this._project);

        return true;
    }

    // CENTRAL PANEL

    handleCentralPanelChange({ action, details }: ChangeCentralPanelEvent) {
        if (details.type === CentralViewType.EntryEditor) {
            const entryEditorDetails = details as EntryEditorInfo;

            if (action === ViewAction.Show) {
                this.leftSideBar.updateEntryDisplayedStatus(
                    entryEditorDetails.entry.id,
                    true,
                );
                this.leftSideBar.addEntryEditorNavigator({
                    ownerId: entryEditorDetails.id,
                    entry: {
                        id: entryEditorDetails.entry.id,
                        type: entryEditorDetails.entry.type,
                        title: entryEditorDetails.entry.title,
                    },
                    activeView: entryEditorDetails.subType,
                });
            } else if (action === ViewAction.Hide) {
                this.leftSideBar.updateEntryDisplayedStatus(
                    entryEditorDetails.entry.id,
                    false,
                );
                this.leftSideBar.releaseSection({
                    ownerId: entryEditorDetails.id,
                    type: SidebarSectionType.EntryEditorNavigator,
                });
            }
        }
    }

    // SYNCHRONIZATION

    private _requestSynchronization(event: DataChangeEvent) {
        const poll = this._buildPollEvent(event);

        if (poll.immediate) this.synchronizer.requestSynchronization(poll);
        else
            // if there aren't any changes that need to be synced immediately,
            // just let the periodic sync handle the changes
            this.synchronizer.requestPeriodicSynchronization();
    }

    private _buildPollEvent(event: DataChangeEvent): PollEvent {
        const poll: PartialPollEvent = {
            type: SyncType.PARTIAL,
            immediate: true,
        };

        if (event.project) {
            if (!(event.project.syncImmediately ?? false))
                return { type: SyncType.FULL, immediate: false };

            poll.project = {
                syncName: event.project.nameChanged ?? false,
            };
        }

        if (event.entries) {
            const entryPolls: PollEntryEvent[] = [];

            for (const entryEvent of event.entries) {
                if (!(entryEvent.syncImmediately ?? false))
                    return { type: SyncType.FULL, immediate: false };

                entryPolls.push({
                    id: entryEvent.id,
                    syncTitle: entryEvent.titleChanged ?? false,
                    syncProperties: entryEvent.propertiesChanged ?? false,
                    syncText: entryEvent.textChanged ?? false,
                    syncLexicon: entryEvent.lexiconChanged ?? false,
                });
            }
            poll.entries = entryPolls;
        }

        return poll;
    }

    private _collectChanges(event: PollEvent): PollResult {
        // FIXME: the changes fetched here may contain multiple conflicting changes;
        // we need to decide which changes take priority
        const centralChanges = this.central.collectChanges(event);
        const sidebarChanges = this.leftSideBar.fetchChanges(event);

        return {
            // HACK: the left sidebar currently doesn't modify the project,
            // but this might change in the future
            project: centralChanges.project,
            entries: [
                ...(centralChanges.entries ?? []),
                ...(sidebarChanges ?? []),
            ],
        };
    }

    private _handleSynchronization(event: SyncEvent) {
        this.footer.handleSynchronization(event);
        this.leftSideBar.handleSynchronization(event);
        this.central.handleSynchronization(event);

        if (event.project) {
            const response = event.project.response;
            if (response.project) {
                this._project = response.project;
            }
        }

        for (const { request, response } of event.entries ?? []) {
            if (
                request.title &&
                response.entry &&
                response.entry.title.updated &&
                response.entry.title.isUnique
            ) {
                // this.leftSideBar.spotlight.updateEntityNodeText(
                //     request.id,
                //     request.title,
                // );
                this.leftSideBar.updateDisplayedEntryTitle(
                    response.entry.id,
                    request.title,
                );
            }
        }
    }
}
