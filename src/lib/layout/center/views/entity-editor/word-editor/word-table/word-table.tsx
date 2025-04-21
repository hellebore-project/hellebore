import "./word-table.css";

import { ActionIcon, Box, Table } from "@mantine/core";
import { IconCircleMinus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import { BaseTableSettings, WordKey } from "@/interface";
import { getService } from "@/services";
import { TextField } from "@/shared/text-field";
import { ToolTipWrapper } from "@/shared/tool-tip";

interface WordRowSettings {
    wordKey: WordKey;
}

interface DeleteWordButtonSettings {
    wordKey: WordKey;
}

export interface WordTableSettings extends BaseTableSettings {}

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
                onClick={() => wordEditor.deleteWord(wordKey)}
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
            <Table.Td className="word-table-data-cell">
                <TextField
                    variant="unstyled"
                    getValue={() => wordEditor.getWord(wordKey).spelling}
                    onChange={(e) =>
                        wordEditor.setSpelling(wordKey, e.currentTarget.value)
                    }
                />
            </Table.Td>
            <Table.Td className="word-table-data-cell">
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
            <Table.Td className="word-table-action-cell">
                <DeleteWordButton wordKey={wordKey} />
            </Table.Td>
        </Table.Tr>
    );
}

const WordRow = observer(renderWordRow);

function renderWordTable(settings: WordTableSettings) {
    const service = getService();
    const wordEditor = service.view.entityEditor.lexicon;

    const rows = wordEditor.filteredKeys.map((key) => (
        <WordRow key={`word-row-${key}`} wordKey={key} />
    ));

    return (
        <Box className="word-table" {...settings}>
            <Table striped highlightOnHover withRowBorders={false}>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th className="word-table-data-cell">
                            Word
                        </Table.Th>
                        <Table.Th className="word-table-data-cell">
                            Meaning
                        </Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>

                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Box>
    );
}

export const WordTable = observer(renderWordTable);
