import "./title-field.css";

import { Divider, Group, Popover, Text } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { TextField } from "@/components/react/lib/text-field";

import { EntryInfoService } from "../entry-info.service";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };

interface TitleFieldProps {
    service: EntryInfoService;
}

function renderTitleField({ service }: TitleFieldProps) {
    let error: string | null;
    if (!service.loaded) error = null;
    else if (service.title == "") error = "Empty title";
    else if (!service.isTitleUnique) error = "Duplicate title";
    else error = null;

    let className = "title-field";
    if (error) className += " error";

    return (
        <>
            <Popover
                opened={Boolean(error)}
                position="right"
                withArrow
                portalProps={{
                    target: service.fetchPortalSelector.produce(),
                }}
            >
                <Popover.Target>
                    <TextField
                        className={className}
                        variant="unstyled"
                        styles={TITLE_FIELD_STYLES}
                        placeholder="Title"
                        getValue={() => service.title}
                        onChange={(event) => {
                            service.title = event.currentTarget.value;
                        }}
                    />
                </Popover.Target>
                <Popover.Dropdown>
                    <Group gap="xs">
                        <IconExclamationCircle />
                        <Text className="title-field-error-text" size="sm">
                            {error}
                        </Text>
                    </Group>
                </Popover.Dropdown>
            </Popover>

            <Divider className="divider" />
        </>
    );
}

export const TitleField = observer(renderTitleField);
