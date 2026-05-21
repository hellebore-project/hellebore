import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { DataTableService } from "@/lib/components/data-table/data-table-service.svelte";
import { MockedInvoker } from "@tests/utils/mocks";

describe("DataTableService", () => {
    let service;
    let onSetValueMock;
    let onCancelEditMock;

    beforeEach(() => {
        onSetValueMock = vi.fn();
        onCancelEditMock = vi.fn();
        service = new DataTableService({
            id: "test-table",
            columns: [
                { key: "name", type: "text" },
                { key: "age", type: "number" },
            ],
            onSetValue: onSetValueMock,
            onCancelEdit: onCancelEditMock,
        });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it("should initialize with given columns", () => {
        expect(service.columns).toHaveLength(2);
        expect(service.columns[0].key).toBe("name");
    });

    it("should call onFilter when a text column filter is set", () => {
        service.setTextColumnFilter("name", "John");
        expect(onSetValueMock).not.toHaveBeenCalled();
        expect(service.getColumnFilter("name")).toEqual(["John"]);
    });

    it("should clear column filters", () => {
        service.setTextColumnFilter("name", "John");
        service.clearColumnFilter("name");
        expect(service.getColumnFilter("name")).toEqual([]);
    });

    it("should toggle column filter values", () => {
        service.toggleColumnFilter("age", "30");
        expect(service.isColumnFilterChecked("age", "30")).toBe(true);
    });
});
