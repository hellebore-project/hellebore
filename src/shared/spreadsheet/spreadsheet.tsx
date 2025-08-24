import "./spreadsheet.css";

import { ActionIcon, Table } from "@mantine/core";
import { IconCircleMinus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { HTMLAttributes, ReactNode } from "react";

import { FieldType } from "@/constants";
import { OutsideEventHandler } from "@/shared/outside-event-handler";
import { SelectField } from "@/shared/select-field";
import { TextField } from "@/shared/text-field";
import { ToolTipWrapper } from "@/shared/tool-tip";
import { SpreadsheetService } from "./spreadsheet.service";

interface SpreadsheetCellSettings {
    rowIndex: number;
    colIndex: number;
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

interface SpreadsheetSettings extends HTMLAttributes<HTMLDivElement> {
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
    service,
}: SpreadsheetCellSettings) {
    const data = service.data.getCell(rowIndex, colIndex);
    const colData = service.data.getColumnData(colIndex);

    let className = "spreadsheet-cell-data";
    if (data.selected) className += " selected";

    let onMouseDown: React.MouseEventHandler | undefined = undefined;
    let onMouseEnter: React.MouseEventHandler | undefined = undefined;

    let field: ReactNode = data.label;

    if (data.editable) {
        className += " compact";

        if (colData.type === FieldType.TEXT) {
            field = (
                <TextField
                    ref={service.data.editableCellElement}
                    value={data.value}
                    onChange={(e) =>
                        service.data.editCell(
                            rowIndex,
                            colIndex,
                            e.currentTarget.value,
                        )
                    }
                    onBlur={() =>
                        service.data.toggleCellEditMode(
                            rowIndex,
                            colIndex,
                            false,
                        )
                    }
                    variant="unstyled"
                />
            );
        } else if (colData.type === FieldType.SELECT) {
            field = (
                <SelectField
                    ref={service.data.editableCellElement}
                    placeholder=""
                    clearable={false}
                    allowDeselect={false}
                    data={colData.options}
                    value={data.value}
                    defaultValue={colData.defaultValue}
                    onChange={(v) =>
                        service.data.editCell(rowIndex, colIndex, v)
                    }
                    variant="unstyled"
                />
            );
        }
    } else {
        onMouseDown = (e) => service.onCellMouseDown(e, rowIndex, colIndex);
        onMouseEnter = (e) => service.onCellMouseEnter(e, rowIndex, colIndex);
    }

    return (
        <Table.Td
            className={className}
            tabIndex={0}
            onMouseDown={onMouseDown}
            onMouseEnter={onMouseEnter}
        >
            {field}
        </Table.Td>
    );
}

const SpreadsheetCell = observer(renderSpreadsheetCell);

function renderSpreadsheetRow({ index, service }: SpreadsheetRowSettings) {
    const row = service.data.rowData[index];
    const cells: ReactNode[] = service.data.columnData.map((col, j) => {
        return (
            <SpreadsheetCell
                key={`spreadsheet-cell-${row.key}-${col.key}`}
                rowIndex={index}
                colIndex={j}
                service={service}
            />
        );
    });

    return (
        <Table.Tr
            className="spreadsheet-row"
            onMouseEnter={() => service.data.highlightRow(row.key)}
            onMouseLeave={() => service.data.unhighlightRow(row.key)}
        >
            {cells}
            <Table.Td className="spreadsheet-cell-action">
                <DeleteRowButton
                    rowKey={row.key}
                    visible={row.highlighted ?? false}
                    onClick={(rowKey) => service.data.deleteRow(rowKey)}
                />
            </Table.Td>
        </Table.Tr>
    );
}

const SpreadsheetRow = observer(renderSpreadsheetRow);

function renderSpreadsheet({ service, ...rest }: SpreadsheetSettings) {
    const headers: ReactNode[] = [];

    for (const colData of service.data.columnData) {
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

    const rows = service.data.rowData.map((row, i) => (
        <SpreadsheetRow
            key={`spreadsheet-row-${row.key}`}
            index={i}
            service={service}
        />
    ));

    return (
        <OutsideEventHandler
            className="spreadsheet"
            service={service.outsideEvent}
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
        </OutsideEventHandler>
    );
}

export const Spreadsheet = observer(renderSpreadsheet);
