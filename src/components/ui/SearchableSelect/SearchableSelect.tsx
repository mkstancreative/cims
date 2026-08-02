import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { createPortal } from "react-dom";
import type { KeyboardEvent } from "react";
import React from "react";
import "./SearchableSelect.css";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SearchableSelectProps {
  options: SelectOption[];
  value?: string | string[];
  onChange: (value: string | string[]) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  label?: string;
  disabled?: boolean;
  multiple?: boolean;
  clearable?: boolean;
  loading?: boolean;
  noOptionsText?: string;
  className?: string;
  maxHeight?: number;
}

// ── helpers ────────────────────────────────────────────────────────────────

const normalize = (s: string) => (s ?? "").toLowerCase().trim();

function groupOptions(options: SelectOption[]) {
  const groups: Record<string, SelectOption[]> = {};
  const ungrouped: SelectOption[] = [];
  options.forEach((o) => {
    if (o.group) {
      groups[o.group] = groups[o.group] ?? [];
      groups[o.group].push(o);
    } else {
      ungrouped.push(o);
    }
  });
  return { groups, ungrouped };
}

// ── component ──────────────────────────────────────────────────────────────

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Select an option…",
  searchPlaceholder = "Search…",
  label,
  disabled = false,
  multiple = false,
  clearable = false,
  loading = false,
  noOptionsText = "No options found",
  className = "",
  maxHeight = 280,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ── derived values ──────────────────────────────────────────────────────

  const selectedValues = useMemo<string[]>(() => {
    if (multiple) {
      return Array.isArray(value) ? value : value ? [value] : [];
    }
    return value ? [value as string] : [];
  }, [multiple, value]);

  const filtered = options.filter(
    (o) => o.label != null && normalize(o.label).includes(normalize(query)),
  );

  const { groups, ungrouped } = groupOptions(filtered);
  const flatFiltered = [...ungrouped, ...Object.values(groups).flat()];

  // ── handlers ────────────────────────────────────────────────────────────

  const openMenu = useCallback(() => {
    if (disabled) return;
    setTriggerRect(containerRef.current?.getBoundingClientRect() ?? null);
    setOpen(true);
    setFocusedIdx(-1);
    setTimeout(() => searchRef.current?.focus(), 0);
  }, [disabled]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    setQuery("");
    setFocusedIdx(-1);
  }, []);

  const selectOption = useCallback(
    (option: SelectOption) => {
      if (option.disabled) return;
      if (multiple) {
        const next = selectedValues.includes(option.value)
          ? selectedValues.filter((v) => v !== option.value)
          : [...selectedValues, option.value];
        onChange(next);
      } else {
        onChange(option.value);
        closeMenu();
      }
    },
    [multiple, selectedValues, onChange, closeMenu],
  );

  const clearSelection = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(multiple ? [] : "");
    },
    [multiple, onChange],
  );

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        dropdownRef.current?.contains(target)
      ) {
        return;
      }
      closeMenu();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [closeMenu]);

  // handle positioning updates
  useEffect(() => {
    if (!open) return;
    const update = () => {
      setTriggerRect(containerRef.current?.getBoundingClientRect() ?? null);
    };
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [open]);

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        openMenu();
      }
      return;
    }
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIdx((i) => Math.min(i + 1, flatFiltered.length - 1));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIdx((i) => Math.max(i - 1, 0));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIdx >= 0 && flatFiltered[focusedIdx]) {
          selectOption(flatFiltered[focusedIdx]);
        }
        break;
      case "Escape":
        closeMenu();
        break;
    }
  };

  // scroll focused item into view
  useEffect(() => {
    if (focusedIdx < 0 || !listRef.current) return;
    const item = listRef.current.querySelector<HTMLLIElement>(
      `[data-idx="${focusedIdx}"]`,
    );
    item?.scrollIntoView({ block: "nearest" });
  }, [focusedIdx]);

  // ── display label ───────────────────────────────────────────────────────

  const displayLabel = () => {
    if (selectedValues.length === 0) return null;
    if (multiple) {
      return selectedValues.map((v) => {
        const opt = options.find((o) => o.value === v);
        return (
          <span key={v} className="ss-tag">
            {opt?.label ?? v}
            <button
              type="button"
              className="ss-tag-remove"
              onClick={(e) => {
                e.stopPropagation();
                onChange(selectedValues.filter((x) => x !== v));
              }}
              aria-label={`Remove ${opt?.label ?? v}`}
            >
              <svg
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ width: "8px", height: "8px" }}
              >
                <path
                  d="M1 1L9 9M9 1L1 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </span>
        );
      });
    }
    const opt = options.find((o) => o.value === selectedValues[0]);
    return (
      <span className="ss-single-label">{opt?.label ?? selectedValues[0]}</span>
    );
  };

  // ── render options ──────────────────────────────────────────────────────

  const renderOptions = (): React.ReactElement[] | React.ReactElement => {
    if (loading) {
      return (
        <li className="ss-state-item">
          <span className="ss-spinner" aria-hidden="true" />
          Loading…
        </li>
      );
    }
    if (flatFiltered.length === 0) {
      return <li className="ss-state-item ss-empty">{noOptionsText}</li>;
    }

    const rows: React.ReactElement[] = [];
    let globalIdx = 0;

    const renderItem = (
      option: SelectOption,
      idx: number,
    ): React.ReactElement => {
      const selected = selectedValues.includes(option.value);
      const focused = focusedIdx === idx;
      return (
        <li
          key={option.value}
          data-idx={idx}
          role="option"
          aria-selected={selected}
          aria-disabled={option.disabled}
          className={[
            "ss-option",
            selected ? "ss-option--selected" : "",
            focused ? "ss-option--focused" : "",
            option.disabled ? "ss-option--disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          onMouseDown={(e) => {
            e.preventDefault();
            selectOption(option);
          }}
          onMouseEnter={() => setFocusedIdx(idx)}
        >
          {multiple && (
            <span
              className={`ss-checkbox${selected ? " ss-checkbox--checked" : ""}`}
              aria-hidden="true"
            >
              {selected && (
                <svg
                  viewBox="0 0 10 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1 4L3.8 7L9 1"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </span>
          )}
          <span className="ss-option-label">{option.label}</span>
          {!multiple && selected && (
            <svg
              className="ss-check-icon"
              viewBox="0 0 10 8"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 4L3.8 7L9 1"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </li>
      );
    };

    // ungrouped first
    ungrouped
      .filter((o) => normalize(o.label).includes(normalize(query)))
      .forEach((option) => {
        rows.push(renderItem(option, globalIdx));
        globalIdx++;
      });

    // then groups
    Object.entries(groups).forEach(([groupName, groupOpts]) => {
      const visibleOpts = groupOpts.filter((o) =>
        normalize(o.label).includes(normalize(query)),
      );
      if (visibleOpts.length === 0) return;
      rows.push(
        <li
          key={`group-${groupName}`}
          className="ss-group-label"
          role="presentation"
        >
          {groupName}
        </li>,
      );
      visibleOpts.forEach((option) => {
        rows.push(renderItem(option, globalIdx));
        globalIdx++;
      });
    });

    return rows;
  };

  const hasValue = selectedValues.length > 0;

  // ── JSX ─────────────────────────────────────────────────────────────────

  return (
    <div
      ref={containerRef}
      className={`ss-root${disabled ? " ss-root--disabled" : ""} ${className}`}
      onKeyDown={handleKeyDown}
    >
      {label && (
        <label className="ss-label" onClick={openMenu}>
          {label}
        </label>
      )}

      {/* Trigger */}
      <div
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-disabled={disabled}
        tabIndex={disabled ? -1 : 0}
        className={`ss-trigger${open ? " ss-trigger--open" : ""}${hasValue ? " ss-trigger--has-value" : ""}`}
        onClick={open ? closeMenu : openMenu}
      >
        <div className="ss-value-area">
          {hasValue ? (
            displayLabel()
          ) : (
            <span className="ss-placeholder">{placeholder}</span>
          )}
        </div>

        <div className="ss-controls">
          {clearable && hasValue && (
            <button
              type="button"
              className="ss-clear-btn"
              onClick={clearSelection}
              tabIndex={-1}
              aria-label="Clear selection"
            >
              <svg
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2 2L8 8M8 2L2 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
          <span
            className={`ss-chevron${open ? " ss-chevron--up" : ""}`}
            aria-hidden="true"
          >
            <svg
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>

      {/* Dropdown — rendered in a portal to escape modal overflow clipping */}
      {open &&
        triggerRect &&
        createPortal(
          <div
            ref={dropdownRef}
            className="ss-dropdown"
            role="dialog"
            style={{
              position: "fixed",
              top: triggerRect.bottom + 6,
              left: triggerRect.left,
              width: triggerRect.width,
            }}
          >
            <div className="ss-search-wrap">
              <svg
                className="ss-search-icon"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="6.5"
                  cy="6.5"
                  r="4.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />
                <path
                  d="M10 10L14 14"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
              <input
                ref={searchRef}
                type="text"
                className="ss-search"
                placeholder={searchPlaceholder}
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setFocusedIdx(-1);
                }}
                onKeyDown={(e) => e.stopPropagation()}
                aria-label="Search options"
              />
              {query && (
                <button
                  type="button"
                  className="ss-search-clear"
                  onClick={() => {
                    setQuery("");
                    searchRef.current?.focus();
                  }}
                  tabIndex={-1}
                  aria-label="Clear search"
                >
                  <svg
                    viewBox="0 0 10 10"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    style={{ width: "10px", height: "10px" }}
                  >
                    <path
                      d="M1 1L9 9M9 1L1 9"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              )}
            </div>

            <ul
              ref={listRef}
              role="listbox"
              aria-multiselectable={multiple}
              className="ss-list"
              style={{ maxHeight }}
            >
              {renderOptions()}
            </ul>

            {multiple && selectedValues.length > 0 && (
              <div className="ss-footer">
                <span className="ss-count">
                  {selectedValues.length} selected
                </span>
                <button
                  type="button"
                  className="ss-clear-all"
                  onClick={() => onChange([])}
                >
                  Clear all
                </button>
              </div>
            )}
          </div>,
          document.body,
        )}
    </div>
  );
}
