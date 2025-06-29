import "./spreadsheet.css";

import { ActionIcon, Box, Table } from "@mantine/core";
import { IconCircleMinus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { ReactNode } from "react";

import {
    BaseTableSettings,
    FieldType,
    SpreadsheetColumnData,
    SpreadsheetRowData,
} from "@/interface";
import { SelectField } from "@/shared/select-field";
import { TextField } from "@/shared/text-field";
import { ToolTipWrapper } from "@/shared/tool-tip";

type EditCellHandler = (
    rowIndex: number,
    colKey: string,
    value: number | string | null,
) => void;
type HighlightRowHandler = (rowKey: string) => void;
type DeleteRowHandler = (rowKey: string) => void;

interface DeleteRowButtonSettings {
    rowKey: string;
    visible: boolean;
    onClick: DeleteRowHandler;
}

interface CellSettings {
    rowKey: string;
    rowIndex: number;
    colIndex: number;
    colData: SpreadsheetColumnData;
    value: string;
    onChange: EditCellHandler;
}

interface RowSettings {
    index: number;
    data: SpreadsheetRowData;
    colData: SpreadsheetColumnData[];
    onEditCell: EditCellHandler;
    onHighlightRow: HighlightRowHandler;
    onUnhighlightRow: HighlightRowHandler;
    onDeleteRow: DeleteRowHandler;
}

export interface SpreadsheetSettings extends BaseTableSettings {
    rowData: SpreadsheetRowData[];
    columnData: SpreadsheetColumnData[];
    onEditCell: EditCellHandler;
    onHighlightRow: HighlightRowHandler;
    onUnhighlightRow: HighlightRowHandler;
    onDeleteRow: DeleteRowHandler;
}

function renderDeleteRowButton({
    rowKey,
    visible,
    onClick,
}: DeleteRowButtonSettings) {
    const visibility = visible ? "visible" : "hidden";
    return (
        <ToolTipWrapper label="Delete">
            <ActionIcon
                id={`delete-spreadsheet-row-${rowKey}`}
                variant="subtle"
                color="red"
                size="sm"
                style={{ visibility }}
                onClick={() => onClick(rowKey)}
            >
                <IconCircleMinus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

const DeleteRowButton = observer(renderDeleteRowButton);

function renderSpreadsheetCell({
    rowIndex,
    colData,
    value,
    onChange,
}: CellSettings) {
    let className = "word-table-data-cell";

    if (colData.visible) return <Table.Td className={className + " hidden"} />;

    let field: ReactNode;

    if (colData.type == FieldType.TEXT)
        field = (
            <TextField
                value={value}
                onChange={(e) =>
                    onChange(rowIndex, colData.key, e.currentTarget.value)
                }
                variant="unstyled"
            />
        );
    else if (colData.type == FieldType.SELECT)
        field = (
            <SelectField
                placeholder=""
                clearable={false}
                data={colData.options}
                value={value}
                onChange={(v) => onChange(rowIndex, colData.key, v)}
                variant="unstyled"
            />
        );
    else field = null;

    return <Table.Td className={className}>{field}</Table.Td>;
}

const SpreadsheetCell = observer(renderSpreadsheetCell);

function renderSpreadsheetRow({
    index,
    data,
    colData,
    onEditCell,
    onHighlightRow,
    onUnhighlightRow,
    onDeleteRow,
}: RowSettings) {
    const cells: ReactNode[] = colData.map((column, j) => {
        const value = String(data.values[column.key]);
        return (
            <SpreadsheetCell
                key={`spreadsheet-cell-${data.key}-${column}`}
                rowKey={data.key}
                rowIndex={index}
                colIndex={j}
                colData={column}
                value={value}
                onChange={onEditCell}
            />
        );
    });

    return (
        <Table.Tr
            onMouseEnter={() => onHighlightRow(data.key)}
            onMouseLeave={() => onUnhighlightRow(data.key)}
        >
            {cells}
            <Table.Td className="word-table-action-cell">
                <DeleteRowButton
                    rowKey={data.key}
                    visible={data.highlighted}
                    onClick={onDeleteRow}
                />
            </Table.Td>
        </Table.Tr>
    );
}

const SpreadsheetRow = observer(renderSpreadsheetRow);

function renderSpreadsheet({
    rowData,
    columnData,
    onEditCell,
    onHighlightRow,
    onUnhighlightRow,
    onDeleteRow,
    ...rest
}: SpreadsheetSettings) {
    const headers = columnData.map((column) => {
        let className = "spreadsheet-data-cell";
        if (!column.visible) className += " hidden";
        return (
            <Table.Th
                key={`spreadsheet-header-${column}`}
                className={className}
            >
                {column.label}
            </Table.Th>
        );
    });
    const actionHeader = <Table.Th key="spreadsheet-header-action" />;

    const rows = rowData.map((row, i) => (
        <SpreadsheetRow
            key={`spreadsheet-row-${row.key}`}
            index={i}
            data={row}
            colData={columnData}
            onEditCell={onEditCell}
            onHighlightRow={onHighlightRow}
            onUnhighlightRow={onUnhighlightRow}
            onDeleteRow={onDeleteRow}
        />
    ));

    return (
        <Box className="spreadsheet" {...rest}>
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

export const Spreadsheet = observer(renderSpreadsheet);
