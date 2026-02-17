import type {
    ComboboxBaseRootPropsWithoutHTML,
    ComboboxSingleRootPropsWithoutHTML,
} from "bits-ui";

import type { DomainManager } from "@/services";

// the bits-ui ComboboxProps can't be extended;
// need to define a narrower type alias as a stand-in
type ComboboxRootPropsWithoutHTML = ComboboxBaseRootPropsWithoutHTML &
    ComboboxSingleRootPropsWithoutHTML;

export interface EntrySearchProps extends Omit<
    ComboboxRootPropsWithoutHTML,
    "type"
> {
    domain: DomainManager;
}
