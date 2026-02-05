import { IconSearch } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { forwardRef } from "react";

import { ComboField, ComboFieldProps } from "./combo-field";

const SEARCH_ICON = <IconSearch size={18} />;

const renderSearchField = forwardRef<HTMLInputElement, ComboFieldProps>(
    ({ service, dropdownProps, inputProps }, ref) => {
        return (
            <ComboField
                ref={ref}
                service={service}
                dropdownProps={dropdownProps}
                inputProps={{
                    placeholder: "Search",
                    leftSection: SEARCH_ICON,
                    ...inputProps,
                }}
            />
        );
    },
);

export const SearchField = observer(renderSearchField);
