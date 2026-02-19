import type { ICentralPanelContentService } from "@/interface";
import { CentralViewType } from "@/constants";

export class SettingsEditorService implements ICentralPanelContentService {
    get key() {
        return this.type;
    }

    get type() {
        return CentralViewType.Settings;
    }

    get details() {
        return { type: this.type };
    }

    activate() {
        return;
    }

    cleanUp() {
        return;
    }
}
