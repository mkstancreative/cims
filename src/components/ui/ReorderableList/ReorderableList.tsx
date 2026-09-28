import { useState, type DragEvent, type ReactNode } from "react";
import { toast } from "react-toastify";
import { ChevronDown, ChevronUp, GripVertical } from "lucide-react";
import "../../admin/forms/BuilderForm.css";

/** Remove first, then insert — inserting without removing duplicates a row. */
function moveItem<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
}

interface ReorderableListProps<T> {
  /** The server-confirmed order. */
  items: T[];
  getId: (item: T) => string;
  /** Names the item in announcements and button labels. */
  getLabel: (item: T) => string;
  /**
   * Persist the WHOLE list in its new order. Resolve once the new order is in
   * `items` (e.g. written to the query cache); reject to roll the drop back.
   */
  onReorder: (next: T[]) => Promise<unknown>;
  /** Lock reordering (e.g. while a sibling add/remove is saving). */
  disabled?: boolean;
  /** Top-align the row when items span several lines. */
  multiline?: boolean;
  renderItem: (item: T, index: number) => ReactNode;
  /** Trailing per-row controls, e.g. a remove button. */
  renderActions?: (item: T, index: number) => ReactNode;
}

/**
 * An ordered list reordered by drag and drop, or by the ↑/↓ buttons on each
 * row for keyboard and screen-reader users. Every move sends the complete new
 * order once, applied optimistically and rolled back if the save fails; a
 * second move waits until the first is confirmed.
 */
export function ReorderableList<T>({
  items,
  getId,
  getLabel,
  onReorder,
  disabled = false,
  multiline = false,
  renderItem,
  renderActions,
}: ReorderableListProps<T>) {
  /** The dropped order, shown until the save settles. */
  const [pending, setPending] = useState<T[] | null>(null);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const list = pending ?? items;
  const saving = pending !== null;
  const locked = disabled || saving;

  const move = (from: number, to: number) => {
    // Never compute a second reorder from a list the server hasn't confirmed.
    if (locked || from === to || to < 0 || to >= list.length) return;

    const next = moveItem(list, from, to);
    const ids = next.map(getId);
    // Cheap guard against a move that duplicated a row instead of moving it.
    if (new Set(ids).size !== ids.length) {
      toast.error("That move produced a duplicate, so it wasn't saved.");
      return;
    }

    const label = getLabel(list[from]);
    setPending(next);
    setAnnouncement(`Moved ${label} to position ${to + 1} of ${next.length}.`);
    onReorder(next)
      .catch(() =>
        setAnnouncement("The new order couldn't be saved, so it was put back."),
      )
      // Success: `items` already holds the confirmed order. Failure: falling
      // back to `items` IS the rollback.
      .finally(() => setPending(null));
  };

  const endDrag = () => {
    setDragIndex(null);
    setOverIndex(null);
  };

  return (
    <>
      <p className="sr-only" role="status" aria-live="polite">
        {announcement}
      </p>

      <ol className="builder-form" style={{ gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
        {list.map((item, i) => {
          const label = getLabel(item);
          return (
            <li
              key={getId(item)}
              className={`builder-card${
                dragIndex === i ? " builder-card--dragging" : ""
              }${overIndex === i && dragIndex !== i ? " builder-card--over" : ""}`}
              style={{ padding: "10px 12px" }}
              draggable={list.length > 1 && !locked}
              onDragStart={(e: DragEvent<HTMLLIElement>) => {
                setDragIndex(i);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", String(i));
              }}
              onDragOver={(e: DragEvent<HTMLLIElement>) => {
                if (dragIndex === null) return;
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                setOverIndex(i);
              }}
              onDragLeave={() => setOverIndex((prev) => (prev === i ? null : prev))}
              onDrop={(e: DragEvent<HTMLLIElement>) => {
                e.preventDefault();
                if (dragIndex !== null) move(dragIndex, i);
                endDrag();
              }}
              onDragEnd={endDrag}
            >
              <div
                className="builder-card-head"
                style={multiline ? { alignItems: "flex-start" } : undefined}
              >
                <span className="builder-grip" aria-hidden="true">
                  <GripVertical size={14} />
                </span>
                {/* Numbered off the index — any `order` field is a sort key. */}
                <span className="builder-subnum">{i + 1}.</span>
                <div style={{ flex: 1, minWidth: 0 }}>{renderItem(item, i)}</div>
                <span className="builder-move">
                  <button
                    type="button"
                    className="builder-move-btn"
                    onClick={() => move(i, i - 1)}
                    // aria-disabled, not disabled: a disabled button drops
                    // keyboard focus mid-save, so repeated presses would break.
                    aria-disabled={locked || i === 0}
                    aria-label={`Move ${label} up`}
                    title="Move up"
                  >
                    <ChevronUp size={13} />
                  </button>
                  <button
                    type="button"
                    className="builder-move-btn"
                    onClick={() => move(i, i + 1)}
                    aria-disabled={locked || i === list.length - 1}
                    aria-label={`Move ${label} down`}
                    title="Move down"
                  >
                    <ChevronDown size={13} />
                  </button>
                </span>
                {renderActions?.(item, i)}
              </div>
            </li>
          );
        })}
      </ol>
    </>
  );
}
