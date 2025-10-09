import "./title-field.css";

import { Divider, Group, Popover, Text } from "@mantine/core";
import { IconExclamationCircle } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { getService } from "@/client";
import { TextField } from "@/shared/text-field";

const TITLE_FIELD_STYLES = { input: { fontSize: 34, paddingBottom: 10 } };

function renderTitleField() {
    const service = getService();
    let error: string | null = null;
    if (service.entryEditor.info.title == "") error = "Empty title";
    if (!service.entryEditor.info.isTitleUnique) error = "Duplicate title";

    let className = "title-field";
    if (error) className += " error";

    return (
        <>
            <Popover
                opened={Boolean(error)}
                position="right"
                withArrow
                portalProps={{ target: service.sharedPortalSelector }}
            >
                <Popover.Target>
                    <TextField
                        className={className}
                        variant="unstyled"
                        styles={TITLE_FIELD_STYLES}
                        placeholder="Title"
                        getValue={() => service.entryEditor.info.title}
                        onChange={(event) => {
                            service.entryEditor.info.title =
                                event.currentTarget.value;
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
