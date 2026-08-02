import { useMemo, useState } from "react";
import "./GeneralTable.css";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100] as const;

export interface TableMeta {
  page: number;
  pages: number;
  count: number;
  limit: number;
  hasPrev: boolean;
  hasNext: boolean;
}

export interface Column<T = Record<string, unknown>> {
  header: React.ReactNode;
  accessor?: string;
  render?: (row: T, rowIndex: number) => React.ReactNode;
}

export interface GeneralTableProps<T = Record<string, unknown>> {
  columns?: Column<T>[];
  data?: T[];
  loading?: boolean;
  /** Pass when using server-side pagination */
  meta?: TableMeta | null;
  /** Called with the new page number on server-side pagination */
  onPageChange?: (page: number) => void;
  /** Called with the new limit on server-side pagination */
  onLimitChange?: (limit: number) => void;
  /** Return extra props to spread onto each <tr> */
  rowProps?: (
    row: T,
    rowIndex: number,
  ) => React.HTMLAttributes<HTMLTableRowElement>;
}

type PageItem = number | "…";

function getValue(obj: unknown, path: string | undefined): unknown {
  if (!path) return undefined;
  return path.split(".").reduce<unknown>((o, key) => {
    if (o !== null && typeof o === "object") {
      return (o as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

function GeneralTable<T = Record<string, unknown>>({
  columns = [],
  data = [],
  loading = false,
  meta = null,
  onPageChange,
  onLimitChange,
  rowProps = () => ({}),
}: GeneralTableProps<T>) {
  // ── CLIENT-SIDE state (only used when meta is null) ──────────────────────
  const [clientPage, setClientPage] = useState(1);
  const [clientPageSize, setClientPageSize] = useState(10);

  // ── Derive all display values from either meta (server) or local state ───
  const isServer = Boolean(meta);
  const currentPage = isServer ? meta!.page : clientPage;
  const totalPages = isServer
    ? meta!.pages
    : Math.max(1, Math.ceil(data.length / clientPageSize));
  const totalCount = isServer ? meta!.count : data.length;
  const hasPrev = isServer ? meta!.hasPrev : clientPage > 1;
  const hasNext = isServer ? meta!.hasNext : clientPage < totalPages;
  const limit = isServer ? meta!.limit : clientPageSize;

  const displayData: T[] = isServer
    ? data
    : data.slice(
        (clientPage - 1) * clientPageSize,
        clientPage * clientPageSize,
      );

  const displayStart = totalCount === 0 ? 0 : (currentPage - 1) * limit + 1;
  const displayEnd =
    totalCount === 0 ? 0 : displayStart - 1 + displayData.length;

  // ── Navigation ────────────────────────────────────────────────────────────
  const goTo = (p: number): void => {
    if (p < 1 || p > totalPages) return;
    if (isServer) {
      onPageChange?.(p);
    } else {
      setClientPage(p);
    }
  };

  // ── Smart page number list: always show first, last, ±2 around current ───
  const pageNums = useMemo((): PageItem[] => {
    const nums = new Set<number>([1, totalPages]);
    for (
      let i = Math.max(2, currentPage - 2);
      i <= Math.min(totalPages - 1, currentPage + 2);
      i++
    ) {
      nums.add(i);
    }
    const sorted = [...nums].sort((a, b) => a - b);
    const result: PageItem[] = [];
    let prev: number | null = null;
    for (const n of sorted) {
      if (prev !== null && n - prev > 1) result.push("…");
      result.push(n);
      prev = n;
    }
    return result;
  }, [currentPage, totalPages]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const renderCellValue = (
    row: T,
    col: Column<T>,
    rowIndex: number,
  ): React.ReactNode => {
    if (col.render) {
      return col.render(row, rowIndex);
    }
    const value = getValue(row, col.accessor);
    if (value === null || value === undefined) return "—";
    if (typeof value === "object") {
      return ((value as Record<string, unknown>).name as string) ?? "—";
    }
    return String(value);
  };

  return (
    <div className="general-table-wrapper">
      {/* ── Table ── */}
      <div className="general-table">
        <table>
          <thead>
            <tr>
              {columns.map((col, i) => (
                <th key={i}>{col.header}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              Array.from({ length: limit }).map((_, rowIndex) => (
                <tr key={rowIndex}>
                  {columns.map((_, colIndex) => (
                    <td key={colIndex}>
                      <div className="skeleton" />
                    </td>
                  ))}
                </tr>
              ))
            ) : displayData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="table-state">
                  <span className="table-empty-icon">📭</span>
                  <span>No records found</span>
                </td>
              </tr>
            ) : (
              displayData.map((row, rowIndex) => (
                <tr key={rowIndex} {...rowProps(row, rowIndex)}>
                  {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                      {renderCellValue(row, col, rowIndex)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer (hidden while loading or empty) ── */}
      {!loading && totalCount > 0 && (
        <div className="table-footer">
          {/* Count */}
          <span className="table-count">
            Showing {displayStart}–{displayEnd} of {totalCount}
          </span>

          {/* Page buttons */}
          <div className="table-pagination">
            <button
              className="page-btn"
              onClick={() => goTo(currentPage - 1)}
              disabled={!hasPrev}
            >
              ‹
            </button>

            {pageNums.map((n, i) =>
              n === "…" ? (
                <span key={`gap-${i}`} className="page-gap">
                  …
                </span>
              ) : (
                <button
                  key={n}
                  className={`page-btn ${n === currentPage ? "active" : ""}`}
                  onClick={() => goTo(n)}
                >
                  {n}
                </button>
              ),
            )}

            <button
              className="page-btn"
              onClick={() => goTo(currentPage + 1)}
              disabled={!hasNext}
            >
              ›
            </button>
          </div>

          {/* Page size selector */}
          <select
            className="page-size-select"
            value={limit}
            onChange={(e) => {
              const val = Number(e.target.value);
              if (isServer) {
                onLimitChange?.(val);
              } else {
                setClientPageSize(val);
                setClientPage(1);
              }
            }}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s} / page
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}

export default GeneralTable;
