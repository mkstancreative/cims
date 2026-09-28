import { useEffect, useId, useRef, useState } from "react";
import { ChevronRight, Filter, Search, X } from "lucide-react";
import "./FilterPopover.css";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterSection {
  key: string;
  label: string;
  /** The choices. Omit when the section is an `input`. */
  options?: FilterOption[];
  /**
   * Allow several choices (checkboxes). `value` / `onChange` then carry them
   * comma-separated, e.g. "pending,failed" — "" means none.
   */
  multiple?: boolean;
  /** Makes the section a free-text, date or number filter instead of a list. */
  input?: {
    placeholder?: string;
    type?: "text" | "date" | "number";
    min?: number;
  };
  /** How the value reads on the section row and its chip (e.g. a date). */
  formatValue?: (value: string) => string;
  /** Small note under the section's controls. */
  hint?: string;
  /** The selected value ("" = no filter, unless `defaultValue` says otherwise). */
  value: string;
  /** The value that counts as "not filtered" (e.g. a status that's on by default). */
  defaultValue?: string;
  onChange: (value: string) => void;
}

/** Options shown before "View all…" / searching. */
const VISIBLE = 5;
/** Lists longer than this get a search box. */
const SEARCHABLE_FROM = 7;

const isActive = (s: FilterSection) => s.value !== (s.defaultValue ?? "");
const selectedValues = (s: FilterSection) =>
  s.value.split(",").filter(Boolean);

const optionLabel = (s: FilterSection) => {
  if (s.multiple)
    return selectedValues(s)
      .map((v) => s.options?.find((o) => o.value === v)?.label ?? v)
      .join(", ");
  return (
    s.options?.find((o) => o.value === s.value)?.label ??
    s.formatValue?.(s.value) ??
    s.value
  );
};

interface FilterPopoverProps {
  sections: FilterSection[];
  onClearAll: () => void;
}

/**
 * "Filters" button with an active-count badge that opens a panel of
 * collapsible, single-choice filter sections.
 */
export function FilterPopover({ sections, onClearAll }: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [showAll, setShowAll] = useState<Record<string, boolean>>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  const activeCount = sections.filter(isActive).length;

  // Close on outside click and Escape (returning focus to the trigger).
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggleOpen = () => {
    // Open on the first filtered section, or the first one.
    if (!open) setExpanded((sections.find(isActive) ?? sections[0])?.key ?? null);
    setOpen(!open);
  };

  return (
    <div className="fp" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`fp-trigger${open ? " is-open" : ""}`}
        onClick={toggleOpen}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <Filter size={16} />
        Filters
        {activeCount > 0 && (
          <span className="fp-trigger__badge" aria-label={`${activeCount} active`}>
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div id={panelId} className="fp-panel" role="dialog" aria-label="Filters">
          <div className="fp-panel__head">
            <h3>Filters</h3>
            <button
              type="button"
              className="fp-link fp-link--danger"
              onClick={onClearAll}
              disabled={activeCount === 0}
            >
              Clear all
            </button>
          </div>

          <div className="fp-panel__body">
            {sections.map((section) => {
              const isOpen = expanded === section.key;
              const options = section.options ?? [];
              const query = (queries[section.key] ?? "").trim().toLowerCase();
              const searchable =
                !section.input && options.length >= SEARCHABLE_FROM;
              const matches = query
                ? options.filter((o) => o.label.toLowerCase().includes(query))
                : options;
              const expandedList = showAll[section.key] || Boolean(query);
              const chosen = section.multiple
                ? selectedValues(section)
                : [section.value];
              const isChosen = (v: string) => chosen.includes(v);
              // Keep chosen options visible even when the list is cut short.
              const visible = expandedList
                ? matches
                : matches.filter((o, i) => i < VISIBLE || isChosen(o.value));
              const toggle = (v: string) =>
                section.onChange(
                  isChosen(v)
                    ? chosen.filter((c) => c !== v).join(",")
                    : [...chosen, v].join(","),
                );
              const hidden = matches.length - visible.length;
              const bodyId = `${panelId}-${section.key}`;

              return (
                <section
                  key={section.key}
                  className={`fp-section${isOpen ? " is-open" : ""}`}
                >
                  <button
                    type="button"
                    className="fp-section__head"
                    onClick={() => setExpanded(isOpen ? null : section.key)}
                    aria-expanded={isOpen}
                    aria-controls={bodyId}
                  >
                    <ChevronRight size={15} className="fp-section__chevron" />
                    <span className="fp-section__label">{section.label}</span>
                    {isActive(section) && (
                      <span className="fp-section__value">
                        {optionLabel(section)}
                      </span>
                    )}
                  </button>

                  {isOpen && section.input && (
                    <div id={bodyId} className="fp-section__body">
                      <input
                        type={section.input.type ?? "text"}
                        min={section.input.min}
                        className="fp-search__input"
                        placeholder={section.input.placeholder}
                        aria-label={section.label}
                        value={section.value}
                        onChange={(e) => section.onChange(e.target.value)}
                      />
                      {section.hint && <p className="fp-hint">{section.hint}</p>}
                    </div>
                  )}

                  {isOpen && !section.input && (
                    <div id={bodyId} className="fp-section__body">
                      {searchable && (
                        <div className="fp-search">
                          <input
                            type="text"
                            className="fp-search__input"
                            placeholder={`Search ${section.label.toLowerCase()}`}
                            aria-label={`Search ${section.label.toLowerCase()}`}
                            value={queries[section.key] ?? ""}
                            onChange={(e) =>
                              setQueries((q) => ({
                                ...q,
                                [section.key]: e.target.value,
                              }))
                            }
                          />
                          <Search size={15} className="fp-search__icon" />
                        </div>
                      )}

                      <div
                        className="fp-options"
                        role={section.multiple ? "group" : "radiogroup"}
                        aria-label={section.label}
                      >
                        {visible.map((option) => (
                          <label key={option.value} className="fp-option">
                            <input
                              type={section.multiple ? "checkbox" : "radio"}
                              name={bodyId}
                              value={option.value}
                              checked={isChosen(option.value)}
                              onChange={() =>
                                section.multiple
                                  ? toggle(option.value)
                                  : section.onChange(option.value)
                              }
                            />
                            <span>{option.label}</span>
                          </label>
                        ))}
                        {matches.length === 0 && (
                          <p className="fp-empty">No matches</p>
                        )}
                      </div>

                      {section.hint && <p className="fp-hint">{section.hint}</p>}

                      {hidden > 0 && (
                        <button
                          type="button"
                          className="fp-link"
                          onClick={() =>
                            setShowAll((s) => ({ ...s, [section.key]: true }))
                          }
                        >
                          View all ({matches.length})…
                        </button>
                      )}
                    </div>
                  )}
                </section>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/** Removable chips for the filters currently applied. */
export function ActiveFilterChips({
  sections,
  onClearAll,
}: FilterPopoverProps) {
  const active = sections.filter(isActive);
  if (active.length === 0) return null;

  return (
    <div className="fp-chips" aria-label="Active filters">
      {active.map((section) => (
        <span key={section.key} className="fp-chip">
          <span className="fp-chip__label">{section.label}:</span>
          {optionLabel(section)}
          <button
            type="button"
            className="fp-chip__remove"
            onClick={() => section.onChange(section.defaultValue ?? "")}
            aria-label={`Remove ${section.label} filter`}
          >
            <X size={12} />
          </button>
        </span>
      ))}
      {active.length > 1 && (
        <button
          type="button"
          className="fp-link fp-link--danger fp-chips__clear"
          onClick={onClearAll}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
