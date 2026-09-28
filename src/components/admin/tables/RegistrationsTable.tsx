import { CheckCircle2, XCircle } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import { useReviewQueue } from "../../../hooks/useRegistrations";
import {
  applicantName,
  durationKey,
  regNumber,
  institutionName,
} from "../../../helpers/registration";
import { durationLabel } from "../../../helpers/duration";
import type {
  Registration,
  ReviewQueueParams,
} from "../../../api/types/registration";

interface RegistrationsTableProps {
  /** The queue query — filters plus `page` / `limit`. Empty values are dropped. */
  params: ReviewQueueParams;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onEnroll: (registration: Registration) => void;
  onReject: (registration: Registration) => void;
  /** Ids ticked for bulk enrolment. */
  selectedIds: ReadonlySet<string>;
  onToggleRow: (registration: Registration) => void;
  /** Tick or untick every selectable row on the current page. */
  onTogglePage: (registrations: Registration[], select: boolean) => void;
  /**
   * The duration group (see `durationKey`) the selection is locked to, or
   * null while nothing is selected. Rows outside it can't be ticked — one
   * bulk enrolment never mixes durations.
   */
  lockedDuration: string | null;
}

/** Only registrations awaiting enrolment can be enrolled. */
const isSelectable = (r: Registration) => r.status === "new";

export default function RegistrationsTable({
  params: rawParams,
  onPageChange,
  onLimitChange,
  onEnroll,
  onReject,
  selectedIds,
  onToggleRow,
  onTogglePage,
  lockedDuration,
}: RegistrationsTableProps) {
  // Only send filters that are set, and trim the search box.
  const params = Object.fromEntries(
    Object.entries({ ...rawParams, search: rawParams.search?.trim() }).filter(
      ([, v]) => v !== undefined && v !== "",
    ),
  ) as ReviewQueueParams;
  const limit = params.limit ?? 10;

  const { data, isLoading } = useReviewQueue(params);

  const rows: Registration[] = data?.data ?? [];
  const eligible = rows.filter(isSelectable);

  // "Select all" works within one duration: the locked one, or — before
  // anything is picked — the page's, if every eligible row shares it.
  const pageKeys = new Set(eligible.map(durationKey));
  const targetKey =
    lockedDuration ?? (pageKeys.size === 1 ? [...pageKeys][0] : null);
  const selectable = targetKey
    ? eligible.filter((r) => durationKey(r) === targetKey)
    : [];
  const pageSelected = selectable.filter((r) => selectedIds.has(r._id)).length;
  const allOnPage = selectable.length > 0 && pageSelected === selectable.length;
  const headerHint =
    eligible.length > 0 && selectable.length === 0
      ? lockedDuration
        ? "No applicants on this page share the selected duration"
        : "These applicants paid for different durations — filter by duration to select all"
      : "Select all awaiting enrolment on this page";

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

  const columns: Column<Registration>[] = [
    {
      header: (
        <input
          type="checkbox"
          className="reg-select-box"
          aria-label={headerHint}
          title={headerHint}
          checked={allOnPage}
          ref={(el) => {
            if (el) el.indeterminate = pageSelected > 0 && !allOnPage;
          }}
          disabled={selectable.length === 0}
          onChange={() => onTogglePage(selectable, !allOnPage)}
        />
      ),
      render: (row) => {
        if (!isSelectable(row)) return null;
        const otherDuration =
          lockedDuration !== null && durationKey(row) !== lockedDuration;
        const label = otherDuration
          ? `${applicantName(row)} paid for a different duration than your selection`
          : `Select ${applicantName(row)}`;
        return (
          <input
            type="checkbox"
            className="reg-select-box"
            aria-label={label}
            title={otherDuration ? label : undefined}
            checked={selectedIds.has(row._id)}
            disabled={otherDuration}
            onChange={() => onToggleRow(row)}
          />
        );
      },
    },
    { header: "Applicant", render: (row) => applicantName(row) },
    { header: "Reg. Number", render: (row) => regNumber(row) },
    {
      header: "Program",
      render: (row) => `${row.program.type} — ${row.program.level}`,
    },
    { header: "Institution", render: (row) => institutionName(row) },
    {
      header: "Duration",
      render: (row) =>
        row.duration ? (
          durationLabel(row.duration)
        ) : (
          <span style={{ color: "var(--color-text-muted)" }}>—</span>
        ),
    },
    {
      header: "Payment",
      render: (row) => <StatusBadge status={row.payment.status} />,
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      header: "Actions",
      render: (row) => {
        if (row.status !== "new") {
          return (
            <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>
              —
            </span>
          );
        }
        return (
          <ActionDropDown
            actions={[
              {
                label: "Enroll",
                icon: <CheckCircle2 size={13} />,
                onClick: () => onEnroll(row),
              },
              {
                label: "Reject",
                icon: <XCircle size={13} />,
                onClick: () => onReject(row),
                danger: true,
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <GeneralTable<Registration>
      columns={columns}
      data={rows}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
