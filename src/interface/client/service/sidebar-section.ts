import type { SidebarSectionType } from "@/constants";
import type { BaseOwnership } from "@/utils/ownership";

import type { IComponentService } from "./component";

export interface ISidebarSectionService extends IComponentService {
    readonly type: SidebarSectionType;
    readonly title: string;
    open: boolean;
    ownership: BaseOwnership;
    activate(): void;
    cleanUp(): void;
}
