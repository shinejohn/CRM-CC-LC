import { useState, useMemo } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { SearchInput } from "./SearchInput";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
    header: string;
    accessorKey?: keyof T;
    cell?: (row: T) => React.ReactNode;
    sortable?: boolean;
}

interface DataTableProps<T> {
    columns: ColumnDef<T>[];
    data: T[];
    isLoading?: boolean;
    emptyMessage?: string;
    onRowClick?: (row: T) => void;
    searchable?: boolean;
    searchPlaceholder?: string;
    pagination?: boolean;
    pageSize?: number;
    actions?: (row: T) => React.ReactNode;
}

export function DataTable<T extends Record<string, any>>({
    columns,
    data,
    isLoading,
    emptyMessage = "No items found",
    onRowClick,
    searchable,
    searchPlaceholder = "Search...",
    pagination,
    pageSize = 10,
    actions,
}: DataTableProps<T>) {
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [sortConfig, setSortConfig] = useState<{
        key: keyof T | null;
        direction: "asc" | "desc";
    }>({ key: null, direction: "asc" });

    const handleSort = (key?: keyof T) => {
        if (!key) return;
        let direction: "asc" | "desc" = "asc";
        if (sortConfig.key === key && sortConfig.direction === "asc") {
            direction = "desc";
        }
        setSortConfig({ key, direction });
    };

    const processedData = useMemo(() => {
        let result = [...data];

        // Search
        if (search) {
            const lowerSearch = search.toLowerCase();
            result = result.filter((item) => {
                return Object.values(item).some((val) =>
                    String(val).toLowerCase().includes(lowerSearch)
                );
            });
        }

        // Sort
        if (sortConfig.key) {
            result.sort((a, b) => {
                const aVal = a[sortConfig.key as keyof T];
                const bVal = b[sortConfig.key as keyof T];

                if (aVal === bVal) return 0;

                const isAsc = sortConfig.direction === "asc" ? 1 : -1;
                if (aVal < bVal) return -1 * isAsc;
                return 1 * isAsc;
            });
        }

        return result;
    }, [data, search, sortConfig]);

    const totalPages = Math.ceil(processedData.length / pageSize);
    const paginatedData = pagination
        ? processedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
        : processedData;

    const handleSearchChange = (val: string) => {
        setSearch(val);
        setCurrentPage(1); // reset to first page
    };

    return (
        <div className="flex flex-col space-y-4">
            {searchable && (
                <div className="w-full max-w-sm">
                    <SearchInput
                        value={search}
                        onChange={handleSearchChange}
                        placeholder={searchPlaceholder}
                    />
                </div>
            )}

            <div className="rounded-xl border border-[var(--nexus-card-border)] overflow-hidden bg-[var(--nexus-card-bg)] shadow-[var(--nexus-card-shadow)]">
                <Table>
                    <TableHeader className="bg-[var(--nexus-bg-secondary)]">
                        <TableRow className="border-b border-[var(--nexus-divider)] hover:bg-transparent">
                            {columns.map((col, idx) => (
                                <TableHead
                                    key={idx}
                                    className={cn(
                                        "h-12 px-4 text-xs font-semibold text-[var(--nexus-text-tertiary)] uppercase tracking-wider",
                                        col.sortable !== false && col.accessorKey && "cursor-pointer select-none hover:text-[var(--nexus-text-primary)] transition-colors"
                                    )}
                                    onClick={() =>
                                        col.sortable !== false ? handleSort(col.accessorKey) : undefined
                                    }
                                >
                                    <div className="flex items-center space-x-1">
                                        <span>{col.header}</span>
                                        {col.accessorKey && sortConfig.key === col.accessorKey && (
                                            <span className="text-[var(--nexus-accent-primary)]">
                                                {sortConfig.direction === "asc" ? (
                                                    <ChevronUp className="w-4 h-4" />
                                                ) : (
                                                    <ChevronDown className="w-4 h-4" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                            {actions && <TableHead className="w-16" />}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-24">
                                    <LoadingState variant="table" count={pageSize} />
                                </TableCell>
                            </TableRow>
                        ) : paginatedData.length === 0 ? (
                            <TableRow className="hover:bg-transparent">
                                <TableCell colSpan={columns.length + (actions ? 1 : 0)} className="h-48">
                                    <EmptyState title={emptyMessage} />
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((row, rowIdx) => (
                                <TableRow
                                    key={rowIdx}
                                    onClick={() => onRowClick && onRowClick(row)}
                                    className={cn(
                                        "border-b border-[var(--nexus-divider)] transition-colors",
                                        onRowClick
                                            ? "cursor-pointer hover:bg-[var(--nexus-card-bg-hover)]"
                                            : "hover:bg-[var(--nexus-card-bg-hover)]"
                                    )}
                                >
                                    {columns.map((col, colIdx) => (
                                        <TableCell
                                            key={colIdx}
                                            className="px-4 py-3 text-sm text-[var(--nexus-text-primary)]"
                                        >
                                            {col.cell
                                                ? col.cell(row)
                                                : col.accessorKey
                                                    ? (row[col.accessorKey] as React.ReactNode)
                                                    : null}
                                        </TableCell>
                                    ))}
                                    {actions && (
                                        <TableCell
                                            onClick={(e) => {
                                                // Prevent row click when clicking actions
                                                if (onRowClick) e.stopPropagation();
                                            }}
                                        >
                                            {actions(row)}
                                        </TableCell>
                                    )}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {pagination && totalPages > 1 && (
                <div className="flex items-center justify-between px-2 text-sm text-[var(--nexus-text-tertiary)]">
                    <div>
                        Showing {(currentPage - 1) * pageSize + 1} to{" "}
                        {Math.min(currentPage * pageSize, processedData.length)} of{" "}
                        {processedData.length} entries
                    </div>
                    <div className="flex items-center space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="h-8 w-8 p-0 border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)]"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="h-8 w-8 p-0 border-[var(--nexus-card-border)] text-[var(--nexus-text-primary)] hover:bg-[var(--nexus-bg-secondary)]"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
