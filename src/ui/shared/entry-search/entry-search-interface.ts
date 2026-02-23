import type {
    ComboboxBaseRootPropsWithoutHTML,
    ComboboxSingleRootPropsWithoutHTML,
} from "bits-ui";

import type { EntrySearchService } from "./entry-search-service.svelte";

// the bits-ui ComboboxProps can't be extended;
// need to define a narrower type alias as a stand-in
type ComboboxRootPropsWithoutHTML = ComboboxBaseRootPropsWithoutHTML &
    ComboboxSingleRootPropsWithoutHTML;

export interface EntrySearchProps extends Omit<
    ComboboxRootPropsWithoutHTML,
    "type"
> {
    service: EntrySearchService;
}
