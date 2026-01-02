import {
    CloseButton,
    Combobox,
    ComboboxItem,
    ComboboxProps,
    InputBase,
    InputBaseProps,
    useCombobox,
} from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

export interface SearchFieldProps extends ComboboxProps {
    placeholder?: string;
    value?: string | null;
    getValue?: () => string | null;
    search?: string | null;
    getSearch?: () => string | null;
    data?: ComboboxItem[];
    getData?: () => ComboboxItem[];
    onValueChange?: (value: string | null) => void;
    onSearchChange?: (value: string) => void;
    textProps?: InputBaseProps;
}

function renderSearchField({
    placeholder = "Search",
    value,
    getValue,
    search,
    getSearch,
    data,
    getData,
    onValueChange,
    onSearchChange,
    textProps,
    ...rest
}: SearchFieldProps) {
    const _value = value ?? getValue?.() ?? undefined;
    const _search = search ?? getSearch?.() ?? "";
    const _data = data ?? getData?.() ?? [];

    let options: ReactNode;
    if (_data.length > 0)
        options = _data.map((item) => (
            <Combobox.Option
                key={item.value}
                value={item.value}
                active={item.value === _value}
            >
                {item.label}
            </Combobox.Option>
        ));
    else options = <Combobox.Empty>No results</Combobox.Empty>;

    const leftSection = <IconSearch size={18} />;

    let rightSection: ReactNode | undefined = undefined;
    if (_search !== "")
        rightSection = (
            <CloseButton
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => onSearchChange?.("")}
            />
        );

    const combobox = useCombobox({
        onDropdownClose: () => combobox.resetSelectedOption(),
    });

    return (
        <Combobox
            store={combobox}
            onOptionSubmit={(value, props) => {
                onSearchChange?.(props.children?.toString() ?? "");
                onValueChange?.(value);
                combobox.closeDropdown();
            }}
            {...rest}
        >
            <Combobox.Target>
                <InputBase
                    placeholder={placeholder}
                    value={_search}
                    onChange={(event) => {
                        combobox.openDropdown();
                        combobox.updateSelectedOptionIndex();
                        onSearchChange?.(event.currentTarget.value);
                    }}
                    onClick={() => combobox.openDropdown()}
                    onFocus={() => combobox.openDropdown()}
                    onBlur={() => combobox.closeDropdown()}
                    leftSection={leftSection}
                    rightSection={rightSection}
                    {...textProps}
                />
            </Combobox.Target>

            <Combobox.Dropdown>
                <Combobox.Options>{options}</Combobox.Options>
            </Combobox.Dropdown>
        </Combobox>
    );
}

export const SearchField = observer(renderSearchField);
