import { ActionIcon, Table } from "@mantine/core";
import { observer } from "mobx-react-lite";

import { getService } from "@/services";
import { TextField } from "@/shared/text-field";
import { ToolTipWrapper } from "@/shared/tool-tip";
import { IconCircleMinus } from "@tabler/icons-react";
import { CENTER_BG_COLOR } from "@/constants";
import { WordKey } from "@/interface";

const DATA_COLUMN_STYLE = {
    border: "calc(0.0625rem * var(--mantine-scale)) solid var(--table-border-color)",
};

const ACTION_COLUMN_STYLE = {
    backgroundColor: CENTER_BG_COLOR,
    border: "none",
};

interface WordRowSettings {
    wordKey: WordKey;
}

interface DeleteWordButtonSettings {
    wordKey: WordKey;
}

function renderDeleteWordButton({ wordKey }: DeleteWordButtonSettings) {
    const service = getService();
    const wordEditor = service.view.entityEditor.lexicon;
    const visible = wordEditor.isWordHighlighted(wordKey)
        ? "visible"
        : "hidden";
    return (
        <ToolTipWrapper label="Delete">
            <ActionIcon
                key="delete-word"
                variant="subtle"
                color="red"
                size="sm"
                style={{ visibility: visible }}
                // TODO: delete word
            >
                <IconCircleMinus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

const DeleteWordButton = observer(renderDeleteWordButton);

function renderWordRow({ wordKey }: WordRowSettings) {
    const service = getService();
    const wordEditor = service.view.entityEditor.lexicon;
    return (
        <Table.Tr
            onMouseEnter={() => wordEditor.highlightWord(wordKey)}
            onMouseLeave={() => wordEditor.unhighlightWord(wordKey)}
        >
            <Table.Td style={DATA_COLUMN_STYLE}>
                <TextField
                    variant="unstyled"
                    getValue={() => wordEditor.getWord(wordKey).spelling}
                    onChange={(e) =>
                        wordEditor.setSpelling(wordKey, e.currentTarget.value)
                    }
                />
            </Table.Td>
            <Table.Td style={DATA_COLUMN_STYLE}>
                <TextField
                    variant="unstyled"
                    getValue={() => wordEditor.getTranslations(wordKey)}
                    onChange={(e) =>
                        wordEditor.setTranslations(
                            wordKey,
                            e.currentTarget.value,
                        )
                    }
                />
            </Table.Td>
            <Table.Td style={ACTION_COLUMN_STYLE}>
                <DeleteWordButton wordKey={wordKey} />
            </Table.Td>
        </Table.Tr>
    );
}

const WordRow = observer(renderWordRow);

function renderWordTable() {
    const service = getService();
    const wordEditor = service.view.entityEditor.lexicon;

    const rows = wordEditor.filteredKeys.map((key) => (
        <WordRow key={`word-row-${key}`} wordKey={key} />
    ));

    return (
        <Table striped highlightOnHover withRowBorders={false}>
            <Table.Thead>
                <Table.Tr>
                    <Table.Th style={DATA_COLUMN_STYLE}>Word</Table.Th>
                    <Table.Th style={DATA_COLUMN_STYLE}>Meaning</Table.Th>
                    <Table.Th></Table.Th>
                </Table.Tr>
            </Table.Thead>

            <Table.Tbody>{rows}</Table.Tbody>
        </Table>
    );
}

export const WordTable = observer(renderWordTable);
