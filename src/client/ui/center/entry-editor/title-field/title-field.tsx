import "./title-field.css";

import { Divider, Group, Popover, Text } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { EntryInfoService, getService } from "@/client";
import { TextField } from "@/shared/text-field";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };

interface TitleFieldProps {
    service: EntryInfoService;
}

function renderTitleField({ service }: TitleFieldProps) {
    const client = getService();

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
                portalProps={{ target: client.sharedPortalSelector }}
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
