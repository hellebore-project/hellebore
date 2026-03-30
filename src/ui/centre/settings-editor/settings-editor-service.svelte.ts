import type { ICentralPanelContentService } from "@/interface";
import { CentralViewType } from "@/constants";

export class SettingsEditorService implements ICentralPanelContentService {
    get id() {
        return this.type;
    }

    get type() {
        return CentralViewType.Settings;
    }

    get details() {
        return { id: this.id, type: this.type };
    }

    activate() {
        return;
    }

    cleanUp() {
        return;
    }
}
