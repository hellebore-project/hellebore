import {
    CloseButton,
    Combobox,
    ComboboxItem,
    ComboboxProps,
    InputBase,
    InputBaseProps,
} from "@mantine/core";
import { observer } from "mobx-react-lite";
import {
    FormEvent,
    ForwardedRef,
    forwardRef,
    PropsWithChildren,
    ReactNode,
} from "react";

import { ComboFieldService } from "./combo-field.service";

interface ComboFieldDropdownProps extends ComboboxProps {
    value?: string | null;
    getValue?: () => string | null;
    onValueChange?: (value: string) => void;
    data?: ComboboxItem[];
    getData?: () => ComboboxItem[];
}

interface ComboFieldInputProps extends InputBaseProps {
    service: ComboFieldService;
    editable?: boolean;
    placeholder?: string;
    value?: string | null;
    getValue?: () => string | null;
    onValueChange?: (value: string) => void;
    clearable?: boolean;
}

export interface ComboFieldProps {
    service: ComboFieldService;
    dropdownProps?: ComboFieldDropdownProps;
    inputProps?: Omit<ComboFieldInputProps, "service">;
}

const renderComboFieldInput = forwardRef<
    HTMLInputElement,
    ComboFieldInputProps
>(
    (
        {
            service,
            editable = true,
            placeholder,
            value,
            getValue,
            onValueChange,
            clearable = false,
            rightSection,
            ...rest
        },
        ref,
    ) => {
        const combobox = service.combobox;
        if (!combobox) return null;

        value = value ?? getValue?.() ?? "";

        if (clearable && value && !rightSection)
            rightSection = (
                <CloseButton
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => onValueChange?.("")}
                />
            );

        const props = {
            value,
            onChange: (event: FormEvent<HTMLInputElement>) => {
                combobox.openDropdown();
                combobox.updateSelectedOptionIndex();
                onValueChange?.(event.currentTarget.value);
            },
            onClick: () => {
                combobox.openDropdown();
            },
            onFocus: () => {
                combobox.openDropdown();
            },
            onBlur: () => {
                combobox.closeDropdown();
            },
            rightSection,
            ...rest,
        };

        return (
            <InputBase
                ref={ref as ForwardedRef<HTMLInputElement>}
                placeholder={placeholder}
                readOnly={!editable}
                {...props}
            />
        );
    },
);

export const ComboFieldInput = observer(renderComboFieldInput);

function renderComboFieldDropdown({ children }: PropsWithChildren) {
    return (
        <Combobox.Dropdown>
            <Combobox.Options>{children}</Combobox.Options>
        </Combobox.Dropdown>
    );
}

export const ComboFieldDropdown = observer(renderComboFieldDropdown);

const renderComboField = forwardRef<HTMLInputElement, ComboFieldProps>(
    ({ service, dropdownProps, inputProps }, ref) => {
        const combobox = service.combobox;
        if (!combobox) return null;

        const { value, getValue, onValueChange, data, getData, ...rest } =
            dropdownProps ?? {};
        const _value = value ?? getValue?.() ?? undefined;
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

        return (
            <Combobox
                store={combobox}
                onOptionSubmit={(v, props) => {
                    inputProps?.onValueChange?.(
                        props.children?.toString() ?? "",
                    );
                    onValueChange?.(v);
                    combobox.closeDropdown();
                }}
                {...rest}
            >
                <Combobox.Target>
                    <ComboFieldInput
                        ref={ref}
                        service={service}
                        {...inputProps}
                    />
                </Combobox.Target>

                <ComboFieldDropdown>{options}</ComboFieldDropdown>
            </Combobox>
        );
    },
);

export const ComboField = observer(renderComboField);
