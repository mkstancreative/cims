import { useState, type DragEvent } from "react";
import {
  ArrowDown,
  ArrowUp,
  Ban,
  CheckCircle,
  GripVertical,
  Pencil,
} from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import { useDurations, useReorderDurations } from "../../../hooks/useDurations";
import type { Duration, DurationParams } from "../../../api/types/duration";
import { durationLabel, formatPrice } from "../../../helpers/duration";
import "./DurationsTable.css";

interface DurationsTableProps {
  isActive?: "" | "true" | "false";
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onEdit: (duration: Duration) => void;
  onToggleStatusRequest: (duration: Duration) => void;
}

function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function DurationsTable({
  isActive,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onEdit,
  onToggleStatusRequest,
}: DurationsTableProps) {
  const params: DurationParams = {
    page,
    limit,
    ...(isActive ? { isActive: isActive === "true" } : {}),
  };

  const { data, isLoading } = useDurations(params);
  const { mutate: reorder, isPending: reordering } = useReorderDurations();

  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  /** Holds the dragged-to order until the server confirms it. */
  const [pendingOrder, setPendingOrder] = useState<string[] | null>(null);

  const fetched: Duration[] = data?.data ?? [];

  // `sortOrder` IS the display order, so sort by it rather than trusting the
  // response order; the week range breaks ties deterministically.
  const sorted = [...fetched].sort(
    (a, b) =>
      (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.minWeeks - b.minWeeks,
  );

  const rows = pendingOrder
    ? (pendingOrder
        .map((id) => sorted.find((d) => d._id === id))
        .filter(Boolean) as Duration[])
    : sorted;

  const draggable = !isLoading && !reordering && rows.length > 1;

  /**
   * Persists a new visual order.
   *
   * The visible rows' existing `sortOrder` values are treated as a pool of
   * slots and handed back out in the new order. That keeps rows we cannot see
   * — filtered out, or on another page — exactly where they were, instead of
   * renumbering the whole list from a partial view.
   */
  const persist = (nextRows: Duration[]) => {
    const slots = rows
      .map((r) => r.sortOrder ?? 0)
      .sort((a, b) => a - b);

    // Tied slots (everything defaulting to 0) would make the reorder a no-op,
    // so spread them out from the lowest one.
    const distinct = new Set(slots).size === slots.length;
    const finalSlots = distinct ? slots : slots.map((_, i) => slots[0] + i);

    const writes = nextRows
      .map((row, i) => ({ row, sortOrder: finalSlots[i] }))
      .filter(({ row, sortOrder }) => (row.sortOrder ?? 0) !== sortOrder)
      .map(({ row, sortOrder }) => ({ id: row._id, sortOrder }));

    if (!writes.length) return;

    setPendingOrder(nextRows.map((r) => r._id));
    reorder(writes, { onSettled: () => setPendingOrder(null) });
  };

  const moveBy = (duration: Duration, delta: number) => {
    const from = rows.findIndex((r) => r._id === duration._id);
    const to = from + delta;
    if (from < 0 || to < 0 || to >= rows.length) return;
    persist(moveItem(rows, from, to));
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) return;
    const from = rows.findIndex((r) => r._id === dragId);
    const to = rows.findIndex((r) => r._id === targetId);
    if (from < 0 || to < 0) return;
    persist(moveItem(rows, from, to));
  };

  const currentPage = data?.page ?? 1;
  const pages = data?.pages ?? 1;
  const meta: TableMeta | null = data
    ? {
        page: currentPage,
        pages,
        count: data.total ?? rows.length,
        limit,
        hasPrev: currentPage > 1,
        hasNext: currentPage < pages,
      }
    : null;

  const columns: Column<Duration>[] = [
    {
      header: "",
      render: () => (
        <span
          className={`dt-grip${draggable ? "" : " dt-grip--off"}`}
          title={
            draggable
              ? "Drag to reorder"
              : "Reordering needs at least two durations"
          }
          aria-hidden="true"
        >
          <GripVertical size={15} />
        </span>
      ),
    },
    // `label` is derived server-side — render it, never rebuild it.
    { header: "Period", render: (row) => durationLabel(row) },
    {
      header: "Weeks",
      render: (row) => `${row.minWeeks} – ${row.maxWeeks}`,
    },
    { header: "Price", render: (row) => formatPrice(row.price) },
    {
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.isActive === false ? "inactive" : "active"} />
      ),
    },
    {
      header: "Actions",
      render: (row, rowIndex) => {
        const active = row.isActive !== false;
        return (
          <ActionDropDown
            actions={[
              {
                label: "Edit",
                icon: <Pencil size={13} />,
                onClick: () => onEdit(row),
              },
              // Dragging is not reachable by keyboard, so the same move is
              // available here.
              {
                label: "Move up",
                icon: <ArrowUp size={13} />,
                onClick: () => moveBy(row, -1),
                disabled: !draggable || rowIndex === 0,
              },
              {
                label: "Move down",
                icon: <ArrowDown size={13} />,
                onClick: () => moveBy(row, 1),
                disabled: !draggable || rowIndex === rows.length - 1,
              },
              {
                label: active ? "Deactivate" : "Activate",
                icon: active ? <Ban size={13} /> : <CheckCircle size={13} />,
                onClick: () => onToggleStatusRequest(row),
                danger: active,
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <div className={`dt-wrap${reordering ? " dt-wrap--saving" : ""}`}>
      {reordering && <span className="dt-saving">Saving order…</span>}

      <GeneralTable<Duration>
        columns={columns}
        data={rows}
        loading={isLoading}
        meta={meta}
        onPageChange={onPageChange}
        onLimitChange={onLimitChange}
        rowProps={(row) => {
          if (!draggable) return {};
          const isDragging = dragId === row._id;
          const isOver = overId === row._id && dragId !== row._id;
          return {
            draggable: true,
            className: `dt-row${isDragging ? " dt-row--dragging" : ""}${
              isOver ? " dt-row--over" : ""
            }`,
            onDragStart: (e: DragEvent<HTMLTableRowElement>) => {
              setDragId(row._id);
              e.dataTransfer.effectAllowed = "move";
              // Firefox refuses to start a drag without payload.
              e.dataTransfer.setData("text/plain", row._id);
            },
            onDragOver: (e: DragEvent<HTMLTableRowElement>) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setOverId(row._id);
            },
            onDragLeave: () =>
              setOverId((prev) => (prev === row._id ? null : prev)),
            onDrop: (e: DragEvent<HTMLTableRowElement>) => {
              e.preventDefault();
              handleDrop(row._id);
              setDragId(null);
              setOverId(null);
            },
            onDragEnd: () => {
              setDragId(null);
              setOverId(null);
            },
          };
        }}
      />
    </div>
  );
}
