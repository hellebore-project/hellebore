import type { SidebarSectionType } from "@/constants";

import type { IComponentService } from "./component";
import type { BaseOwnership } from "@/utils/ownership";

export interface ISidebarSectionService extends IComponentService {
    readonly type: SidebarSectionType;
    readonly title: string;
    collapsed: boolean;
    ownership: BaseOwnership;
    activate(): void;
    cleanUp(): void;
}
