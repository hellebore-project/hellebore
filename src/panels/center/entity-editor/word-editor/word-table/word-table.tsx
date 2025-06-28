import "./word-table.css";

import { ActionIcon, Box, Table } from "@mantine/core";
import { IconCircleMinus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";

import {
    BaseTableSettings,
    GrammaticalGender,
    GrammaticalNumber,
    GrammaticalPerson,
    WordKey,
    WordTableColumnName,
} from "@/interface";
import { getService } from "@/services";
import { TextField } from "@/shared/text-field";
import { ToolTipWrapper } from "@/shared/tool-tip";
import { ReactNode } from "react";
import { SelectField } from "@/shared/select-field";
import { numericEnumMapping } from "@/utils/enums";

const GRAMMATICAL_NUMBERS = Object.entries(
    numericEnumMapping(GrammaticalNumber),
).map(([k, v]) => ({ label: k, value: String(v) }));
const GRAMMATICAL_GENDERS = Object.entries(
    numericEnumMapping(GrammaticalGender),
).map(([k, v]) => ({ label: k, value: String(v) }));
const GRAMMATICAL_PERSONS = Object.entries(
    numericEnumMapping(GrammaticalPerson),
).map(([k, v]) => ({ label: k, value: String(v) }));

interface DeleteWordButtonSettings {
    wordKey: WordKey;
}

interface WordCellSettings {
    wordKey: WordKey;
    columnName: WordTableColumnName;
}

interface WordRowSettings {
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

function renderWordCell({ wordKey, columnName }: WordCellSettings) {
    const service = getService();
    const wordEditor = service.view.entityEditor.lexicon;

    let field: ReactNode;

    if (columnName == WordTableColumnName.Spelling)
        field = (
            <TextField
                getValue={() => wordEditor.getWord(wordKey).spelling}
                onChange={(e) =>
                    wordEditor.setSpelling(wordKey, e.currentTarget.value)
                }
                variant="unstyled"
            />
        );
    else if (columnName == WordTableColumnName.Translations)
        field = (
            <TextField
                getValue={() => wordEditor.getTranslations(wordKey)}
                onChange={(e) =>
                    wordEditor.setTranslations(wordKey, e.currentTarget.value)
                }
                variant="unstyled"
            />
        );
    else if (columnName == WordTableColumnName.Number)
        field = (
            <SelectField
                placeholder=""
                clearable={false}
                data={GRAMMATICAL_NUMBERS}
                getValue={() => wordEditor.getNumber(wordKey)}
                onChange={(v) => wordEditor.setNumber(wordKey, Number(v))}
                variant="unstyled"
            />
        );
    else if (columnName == WordTableColumnName.Gender)
        field = (
            <SelectField
                placeholder=""
                clearable={false}
                data={GRAMMATICAL_GENDERS}
                getValue={() => wordEditor.getGender(wordKey)}
                onChange={(v) => wordEditor.setGender(wordKey, Number(v))}
                variant="unstyled"
            />
        );
    else if (columnName == WordTableColumnName.Person)
        field = (
            <SelectField
                placeholder=""
                clearable={false}
                data={GRAMMATICAL_PERSONS}
                getValue={() => wordEditor.getPerson(wordKey)}
                onChange={(v) => wordEditor.setPerson(wordKey, Number(v))}
                variant="unstyled"
            />
        );
    else return null;

    let className = "word-table-data-cell";
    if (!wordEditor.visibleProperties.has(columnName)) className += " hidden";
    return <Table.Td className={className}>{field}</Table.Td>;
}

const WordCell = observer(renderWordCell);

const PROPERTY_ORDER = [
    WordTableColumnName.Spelling,
    WordTableColumnName.Translations,
    WordTableColumnName.Gender,
    WordTableColumnName.Number,
    WordTableColumnName.Person,
];

function renderWordRow({ wordKey }: WordRowSettings) {
    const service = getService();
    const wordEditor = service.view.entityEditor.lexicon;

    const cells: ReactNode[] = PROPERTY_ORDER.map((colName) => (
        <WordCell
            key={`word-table-cell-${wordKey}-${colName}`}
            wordKey={wordKey}
            columnName={colName}
        />
    ));

    return (
        <Table.Tr
            onMouseEnter={() => wordEditor.highlightWord(wordKey)}
            onMouseLeave={() => wordEditor.unhighlightWord(wordKey)}
        >
            {cells}
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

    const headers = PROPERTY_ORDER.map((col) => {
        let className = "word-table-data-cell";
        if (!wordEditor.visibleProperties.has(col)) className += " hidden";
        return (
            <Table.Th key={`word-table-header-${col}`} className={className}>
                {col}
            </Table.Th>
        );
    });
    const actionHeader = <Table.Th key="word-table-header-action" />;

    const rows = wordEditor.filteredKeys.map((key) => (
        <WordRow key={`word-row-${key}`} wordKey={key} />
    ));

    return (
        <Box className="word-table" {...settings}>
            <Table striped highlightOnHover withRowBorders={false}>
                <Table.Thead>
                    <Table.Tr>
                        {headers}
                        {actionHeader}
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>{rows}</Table.Tbody>
            </Table>
        </Box>
    );
}

export const WordTable = observer(renderWordTable);
