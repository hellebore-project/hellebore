import "./spreadsheet.css";

import { ActionIcon, Table, TooltipProps } from "@mantine/core";
import { IconCircleMinus } from "@tabler/icons-react";
import { observer } from "mobx-react-lite";
import { HTMLAttributes, ReactNode } from "react";

import { OutsideEventHandler } from "@/components/lib/outside-event-handler";
import { SelectField, SelectFieldProps } from "@/components/lib/select-field";
import { TextField } from "@/components/lib/text-field";
import { ToolTipWrapper } from "@/components/lib/tool-tip";

import { SpreadsheetFieldType } from "./spreadsheet.interface";
import { SpreadsheetService } from "./spreadsheet.service";

interface SpreadsheetCellCommonProps {
    selectProps?: SelectFieldProps;
}

interface SpreadsheetCellProps<K extends string, M>
    extends SpreadsheetCellCommonProps {
    rowIndex: number;
    colIndex: number;
    service: SpreadsheetService<K, M>;
}

interface DeleteSpreadsheetRowButton {
    rowKey: string;
    visible: boolean;
    onClick: (rowKey: string) => void;
    tooltipProps?: Omit<TooltipProps, "label">;
}

interface SpreadsheetRowProps<K extends string, M> {
    index: number;
    service: SpreadsheetService<K, M>;
    cellProps?: SpreadsheetCellCommonProps;
    tooltipProps?: Omit<TooltipProps, "label">;
}

interface SpreadsheetProps<K extends string, M>
    extends HTMLAttributes<HTMLDivElement> {
    service: SpreadsheetService<K, M>;
    cellProps?: SpreadsheetCellCommonProps;
    tooltipProps?: Omit<TooltipProps, "label">;
}

function renderDeleteRowButton({
    rowKey,
    visible,
    onClick,
    tooltipProps,
}: DeleteSpreadsheetRowButton) {
    const visibility = visible ? "visible" : "hidden";
    return (
        <ToolTipWrapper label="Delete" {...tooltipProps}>
            <ActionIcon
                id={`delete-spreadsheet-row-${rowKey}`}
                variant="subtle"
                color="red"
                size="sm"
                aria-label="Delete row"
                style={{ visibility }}
                onClick={() => onClick(rowKey)}
            >
                <IconCircleMinus size={18} />
            </ActionIcon>
        </ToolTipWrapper>
    );
}

const DeleteRowButton = observer(renderDeleteRowButton);

function renderSpreadsheetCell<K extends string, M>({
    rowIndex,
    colIndex,
    service,
    selectProps,
}: SpreadsheetCellProps<K, M>) {
    const data = service.data.getCell(rowIndex, colIndex);
    const colData = service.data.getColumnData(colIndex);

    let className = "spreadsheet-cell-data";
    if (data.selected) className += " selected";

    let onMouseDown: React.MouseEventHandler | undefined = undefined;
    let onMouseEnter: React.MouseEventHandler | undefined = undefined;

    let field: ReactNode = data.label;

    if (data.editable) {
        className += " compact";

        if (colData.type === SpreadsheetFieldType.TEXT) {
            field = (
                <TextField
                    ref={service.reference.editableCellRef}
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
        } else if (colData.type === SpreadsheetFieldType.SELECT) {
            field = (
                <SelectField
                    ref={service.reference.editableCellRef}
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
                    {...selectProps}
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

function renderSpreadsheetRow<K extends string, M>({
    index,
    service,
    cellProps,
    tooltipProps,
}: SpreadsheetRowProps<K, M>) {
    const row = service.data.rowData[index];
    const cells: ReactNode[] = service.data.columnData.map((col, j) => {
        return (
            <SpreadsheetCell
                key={`spreadsheet-cell-${row.key}-${col.key}`}
                rowIndex={index}
                colIndex={j}
                service={service}
                {...cellProps}
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
                    tooltipProps={tooltipProps}
                />
            </Table.Td>
        </Table.Tr>
    );
}

const SpreadsheetRow = observer(renderSpreadsheetRow);

function renderSpreadsheet<K extends string, M>({
    service,
    cellProps,
    tooltipProps,
    ...rest
}: SpreadsheetProps<K, M>) {
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
            cellProps={cellProps}
            tooltipProps={tooltipProps}
        />
    ));

    return (
        <OutsideEventHandler
            className="spreadsheet"
            service={service.reference.outsideEvent}
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
