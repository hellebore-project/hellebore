import "./spreadsheet.css";

import { ActionIcon, Box, Table } from "@mantine/core";
import { IconCircleMinus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { ReactNode, useEffect, useRef } from "react";

import {
    BaseTableSettings,
    FieldType,
    SpreadsheetCellData,
    SpreadsheetColumnData,
} from "@/interface";
import { SelectField } from "@/shared/select-field";
import { TextField } from "@/shared/text-field";
import { ToolTipWrapper } from "@/shared/tool-tip";
import { SpreadsheetService } from "./spreadsheet-service";

interface SpreadsheetCellSettings {
    rowIndex: number;
    colIndex: number;
    colData: SpreadsheetColumnData;
    data: SpreadsheetCellData;
    service: SpreadsheetService;
}

interface DeleteSpreadsheetRowButton {
    rowKey: string;
    visible: boolean;
    onClick: (rowKey: string) => void;
}

interface SpreadsheetRowSettings {
    index: number;
    service: SpreadsheetService;
}

interface SpreadsheetSettings extends BaseTableSettings {
    service: SpreadsheetService;
}

function renderDeleteRowButton({
    rowKey,
    visible,
    onClick,
}: DeleteSpreadsheetRowButton) {
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
    colIndex,
    colData,
    data,
    service,
}: SpreadsheetCellSettings) {
    let className = "spreadsheet-cell-data";
    if (data.selected) className += " selected";

    let onClick: React.MouseEventHandler | undefined = undefined;

    let field: ReactNode = data?.label ?? data.value;

    if (data.editable) {
        className += " compact";

        if (colData.type === FieldType.TEXT) {
            field = (
                <TextField
                    ref={service.editableCellField}
                    value={data.value}
                    onChange={(e) =>
                        service.editCell(
                            rowIndex,
                            colIndex,
                            e.currentTarget.value,
                        )
                    }
                    onBlur={() =>
                        service.toggleCellEditMode(rowIndex, colIndex, false)
                    }
                    onKeyDown={(e) => service.handleKeyDown(e)}
                    variant="unstyled"
                />
            );
        } else if (colData.type === FieldType.SELECT) {
            field = (
                <SelectField
                    ref={service.editableCellField}
                    placeholder=""
                    clearable={false}
                    data={colData.options}
                    value={data.value}
                    onChange={(v) => service.editCell(rowIndex, colIndex, v)}
                    onBlur={() =>
                        service.toggleCellEditMode(rowIndex, colIndex, false)
                    }
                    onKeyDown={(e) => service.handleKeyDown(e)}
                    variant="unstyled"
                />
            );
        }
    } else {
        onClick = () => {
            if (!data.selected) {
                service.selectCell(rowIndex, colIndex);
            } else {
                service.toggleCellEditMode(rowIndex, colIndex, true);
            }
        };
    }

    return (
        <Table.Td className={className} tabIndex={0} onClick={onClick}>
            {field}
        </Table.Td>
    );
}

const SpreadsheetCell = observer(renderSpreadsheetCell);

function renderSpreadsheetRow({ index, service }: SpreadsheetRowSettings) {
    const row = service.rowData[index];
    const cells: ReactNode[] = service.columnData.map((col, j) => {
        const cellData = row.cells[col.key];
        return (
            <SpreadsheetCell
                key={`spreadsheet-cell-${row.key}-${col.key}`}
                rowIndex={index}
                colIndex={j}
                colData={col}
                data={cellData}
                service={service}
            />
        );
    });

    return (
        <Table.Tr
            className="spreadsheet-row"
            onMouseEnter={() => service.highlightRow(row.key)}
            onMouseLeave={() => service.unhighlightRow(row.key)}
        >
            {cells}
            <Table.Td className="spreadsheet-cell-action">
                <DeleteRowButton
                    rowKey={row.key}
                    visible={row.highlighted}
                    onClick={(rowKey) => service.deleteRow(rowKey)}
                />
            </Table.Td>
        </Table.Tr>
    );
}

const SpreadsheetRow = observer(renderSpreadsheetRow);

function renderSpreadsheet({ service, ...rest }: SpreadsheetSettings) {
    const headers: ReactNode[] = [];

    for (const colData of service.columnData) {
        headers.push(
            <Table.Th
                key={`spreadsheet-header-${colData.key}`}
                className="spreadsheet-cell-data"
            >
                {colData.label}
            </Table.Th>,
        );
    }

    const actionHeader = (
        <Table.Th
            key="spreadsheet-header-action"
            className="spreadsheet-cell-action"
        />
    );
    const actionColumn = (
        <col span={headers.length + 1} className="spreadsheet-column-action" />
    );

    const rows = service.rowData.map((row, i) => (
        <SpreadsheetRow
            key={`spreadsheet-row-${row.key}`}
            index={i}
            service={service}
        />
    ));

    return (
        <Box
            className="spreadsheet"
            ref={service.sheet}
            tabIndex={0}
            onKeyDown={(e) => service.handleKeyDown(e)}
            {...rest}
        >
            <Table
                layout="fixed"
                striped
                highlightOnHover
                withRowBorders={false}
            >
                <colgroup>{actionColumn}</colgroup>
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
