import { makeAutoObservable } from "mobx";
import { ask, open } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";

import {
    MoveFolderEvent,
    MoveFolderResult,
    PollEvent,
    SyncEvent,
} from "@/client/interface";
import { CentralViewType, ViewAction } from "@/client/constants";
import {
    DomainManager,
    ProjectResponse,
    BulkFileResponse,
    FolderUpdateResponse,
    EntryType,
} from "@/domain";
import { Id } from "@/interface";

import { CentralPanelManager } from "./center";
import { ContextMenuManager } from "./context-menu";
import { FooterManager } from "./footer-manager";
import { HeaderManager } from "./header-manager";
import { ModalManager } from "./modal";
import { NavigationService } from "./navigation";
import { PortalManager } from "./portal-manager";
import { StyleManager } from "./style-manager";
import { SynchronizationService } from "./synchronizer";

export class ClientManager {
    // CONSTANTS
    readonly DEFAULT_CENTER_PADDING = 20;
    readonly DEFAULT_DIVIDER_HEIGHT = 24.8;
    readonly DEFAULT_SPACE_HEIGHT = 20;
    readonly SHARED_PORTAL_ID = "shared-portal";

    // SERVICES
    domain: DomainManager;
    synchronizer: SynchronizationService;
    portal: PortalManager;
    central: CentralPanelManager;
    header: HeaderManager;
    navigation: NavigationService;
    footer: FooterManager;
    modal: ModalManager;
    contextMenu: ContextMenuManager;
    style: StyleManager;

    // CONSTRUCTION

    constructor() {
        this.domain = new DomainManager();

        this.synchronizer = new SynchronizationService(this.domain);

        // miscellaneous
        this.style = new StyleManager();
        this.portal = new PortalManager(this.SHARED_PORTAL_ID);

        // central panel
        this.central = new CentralPanelManager({
            domain: this.domain,
        });

        // peripheral panels
        this.header = new HeaderManager(this.domain);
        this.footer = new FooterManager(this.domain);
        this.navigation = new NavigationService({
            domain: this.domain,
        });

        // overlays
        this.modal = new ModalManager();
        this.contextMenu = new ContextMenuManager();

        const overrides = {
            domain: false,
            style: false,
            portal: false,
            home: false,
            settingsEditor: false,
            entryEditor: false,
            header: false,
            footer: false,
            navigation: false,
            modal: false,
            contextMenu: false,
        };
        makeAutoObservable(this, overrides);

        this._createSubscriptions();
    }

    // PROPERTIES

    get centerPadding() {
        return this.DEFAULT_CENTER_PADDING;
    }

    get viewSize() {
        const window = getCurrentWindow();
        return window.innerSize();
    }

    // STARTUP

    private _createSubscriptions() {
        this.central.fetchPortalSelector.subscribe(() => this.portal.selector);
        this.central.onChangePanel.subscribe(({ action, details }) => {
            if (details.type === CentralViewType.EntryEditor) {
                if (details.entry === undefined) return;

                if (action === ViewAction.Show)
                    this.navigation.spotlight.setEntryNodeDisplayedStatus(
                        details.entry.id,
                        true,
                    );
                if (action === ViewAction.Hide) {
                    this.navigation.spotlight.setEntryNodeDisplayedStatus(
                        details.entry.id,
                        false,
                    );
                }
            }
        });
        this.central.onChangeData.subscribe(() =>
            this.synchronizer.requestFullSynchronization(),
        );
        this.central.onPartialChangeData.subscribe(({ poll }) =>
            this.synchronizer.requestSynchronization(poll ?? {}),
        );
        this.central.onPeriodicChangeData.subscribe(() =>
            this.synchronizer.requestPeriodicSynchronization(),
        );
        this.central.onDeleteEntry.subscribe(({ id, title }) =>
            this.deleteEntry(id, title),
        );

        this.header.fetchPortalSelector.subscribe(() => this.portal.selector);
        this.header.onCreateProject.subscribe(() =>
            this.modal.openProjectCreator(),
        );
        this.header.onLoadProject.subscribe(() => this.loadProject());
        this.header.onCloseProject.subscribe(() => this.closeProject());
        this.header.onCreateEntry.subscribe(() =>
            this.modal.openEntryCreator({}),
        );
        this.header.onOpenHome.subscribe(() => this.central.openHome());
        this.header.onOpenSettings.subscribe(() => this.central.openSettings());
        this.header.fetchLeftBarStatus.subscribe(
            () => this.navigation.mobileOpen,
        );
        this.header.onToggleLeftBar.subscribe(() =>
            this.navigation.toggleMobileOpen(),
        );

        const spotlight = this.navigation.spotlight;
        spotlight.fetchPortalSelector.subscribe(() => this.portal.selector);
        spotlight.onCreateEntry.subscribe((args) =>
            this.modal.openEntryCreator(args),
        );
        spotlight.onOpenEntry.subscribe((args) =>
            this.central.openEntryEditor(args),
        );
        spotlight.onMoveFolder.subscribe((args) => this.moveFolder(args));
        spotlight.onDeleteFolder.subscribe(({ id, confirm }) =>
            this.deleteFolder(id, confirm),
        );
        spotlight.onOpenFolderContext.subscribe((args) =>
            this.contextMenu.openForNavBarFolderNode(args),
        );
        spotlight.onOpenEntryContext.subscribe((args) =>
            this.contextMenu.openForNavBarEntryNode(args),
        );

        this.modal.fetchPortalSelector.subscribe(() => this.portal.selector);
        this.modal.onCreateProject.subscribe(({ name, dbFilePath }) =>
            this.createProject(name, dbFilePath),
        );
        this.modal.onCreateEntry.subscribe(
            ({ entryType: entityType, title, folderId }) =>
                this.createEntry(entityType, title, folderId),
        );

        this.contextMenu.onEditFolderName.subscribe(({ id }) =>
            this.editFolderName(id),
        );
        this.contextMenu.onDeleteFolder.subscribe(({ id }) =>
            this.deleteFolder(id),
        );
        this.contextMenu.onDeleteEntry.subscribe(({ id, title }) =>
            this.deleteEntry(id, title),
        );

        this.synchronizer.onPoll.subscribe((event) =>
            this._fetchChanges(event),
        );
        this.synchronizer.onSync.subscribe((event) =>
            this._handleEntrySynchronization(event),
        );
    }

    // LOADING

    async load() {
        const project = await this._fetchProjectInfo();
        if (project) await this._loadClientForProject(project);
    }

    private async _fetchProjectInfo() {
        return this.domain.session.getSession().then((session) => {
            // TODO: trigger UI error state if the project info is unavailable
            return session?.project ?? null;
        });
    }

    private async _loadClientForProject(project: ProjectResponse) {
        return Promise.allSettled([
            this._loadNavigator(),
            this._loadHome(project),
        ]);
    }

    private async _loadHome(project: ProjectResponse) {
        if (this.central.panelCount === 0) {
            this.central.openHome();
            return;
        }

        const service = this.central.getHomePanel();
        if (!service) return;

        service.load(project.name);
    }

    private async _loadNavigator() {
        // for now, the navigator is populated with ALL entries;
        // TODO: once entry pinning is supported, fetch the pinned entries from the backend
        const entries = await this.domain.entries.getAll();
        const folders = await this.domain.folders.getAll();

        if (entries !== null && folders !== null)
            this.navigation.load(entries, folders);
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
            this._loadClientForProject(response);
            this.central.openHome();
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
            this._loadClientForProject(response);
            this.central.openHome();
        }
        return response;
    }

    async closeProject() {
        // save any unsynced data before closing the project
        this.central.clear();

        const success = await this.domain.session.closeProject();
        if (success) {
            this.navigation.reset();
            this.central.openHome();
        }
        return success;
    }

    // FOLDER HANDLING

    editFolderName(id: number) {
        this.navigation.spotlight.toggleFolderAsEditable(id);
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

        this.navigation.spotlight.deleteManyNodes(
            fileIds.entries,
            fileIds.folders,
        );

        let panelIndex = 0;
        for (const panelService of this.central.iterateOpenPanels()) {
            if (panelService.type !== CentralViewType.EntryEditor) continue;

            const entryId = panelService.details.entry?.id;
            if (entryId === undefined) continue;

            if (fileIds.entries.includes(entryId))
                this.central.closePanel(panelIndex);

            panelIndex++;
        }

        if (this.central.panelCount == 0) this.central.openHome();

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
            this.navigation.spotlight.addNodeForCreatedEntry(entry);
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

        this.navigation.spotlight.deleteEntityNode(id);

        let panelIndex = 0;
        for (const panelService of this.central.iterateOpenPanels()) {
            if (panelService.type !== CentralViewType.EntryEditor) continue;

            const entryId = panelService.details.entry?.id;
            if (entryId === undefined) continue;

            if (entryId == id) this.central.closePanel(panelIndex);

            panelIndex++;
        }

        if (this.central.panelCount == 0) this.central.openHome();

        return true;
    }

    // SYNCHRONIZATION

    private _fetchChanges(event: PollEvent) {
        return { entries: this.central.fetchChanges(event) };
    }

    private _handleEntrySynchronization(event: SyncEvent) {
        this.central.handleEntrySynchronization(event);

        for (const { request, response } of event.entries) {
            if (
                request.title &&
                response.entry &&
                response.entry.title.updated &&
                response.entry.title.isUnique
            )
                this.navigation.spotlight.updateEntityNodeText(
                    request.id,
                    request.title,
                );
        }
    }

    // HOOKS

    hook() {
        this.contextMenu.hook();
        this.navigation.spotlight.hook();
        this.central.hook();
    }

    // CLEAN UP

    cleanUp() {
        this.modal.close();
        this.central.clear();
    }
}
