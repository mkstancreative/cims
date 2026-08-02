import { CheckCircle2, XCircle } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import { useReviewQueue } from "../../../hooks/useRegistrations";
import type {
  Registration,
  ReviewQueueParams,
} from "../../../api/types/registration";

interface RegistrationsTableProps {
  search?: string;
  status?: string;
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onEnroll: (registration: Registration) => void;
  onReject: (registration: Registration) => void;
}

// ── Helpers to read polymorphic refs ──────────────────────────────────────────
export function applicantName(reg: Registration): string {
  if (reg.student && typeof reg.student === "object") {
    const u = reg.student.user;
    if (u) return `${u.firstName} ${u.lastName}`.trim();
  }
  return "—";
}
function regNumber(reg: Registration): string {
  if (reg.student && typeof reg.student === "object") {
    return reg.student.registrationNumber ?? "—";
  }
  return "—";
}
function institutionName(reg: Registration): string {
  if (reg.institution && typeof reg.institution === "object") {
    return reg.institution.name;
  }
  return "—";
}

export default function RegistrationsTable({
  search,
  status,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onEnroll,
  onReject,
}: RegistrationsTableProps) {
  const params: ReviewQueueParams = {
    page,
    limit,
    ...(status ? { status } : {}),
  };

  const { data, isLoading } = useReviewQueue(params);

  const rowsAll: Registration[] = data?.data ?? [];
  // Search is client-side against the current page (list endpoint has no search param).
  const rows = search
    ? rowsAll.filter(
        (r) =>
          applicantName(r).toLowerCase().includes(search.toLowerCase()) ||
          regNumber(r).toLowerCase().includes(search.toLowerCase()),
      )
    : rowsAll;

  const currentPage = data?.page ?? 1;
  const pages = data?.pages ?? 1;
  const meta: TableMeta | null = data
    ? {
        page: currentPage,
        pages,
        count: data.total ?? rowsAll.length,
        limit,
        hasPrev: currentPage > 1,
        hasNext: currentPage < pages,
      }
    : null;

  const columns: Column<Registration>[] = [
    { header: "Applicant", render: (row) => applicantName(row) },
    { header: "Reg. Number", render: (row) => regNumber(row) },
    {
      header: "Program",
      render: (row) => `${row.program.type} — ${row.program.level}`,
    },
    { header: "Institution", render: (row) => institutionName(row) },
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
