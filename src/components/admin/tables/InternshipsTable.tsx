import { RefreshCw, Star, CheckCircle2 } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import {
  useInternships,
  useSetCurrentInternship,
} from "../../../hooks/useInternships";
import type {
  Internship,
  InternshipStatus,
  InternshipParams,
} from "../../../api/types/internship";

interface InternshipsTableProps {
  search?: string;
  status?: InternshipStatus | "";
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onChangeStatus: (internship: Internship) => void;
}

import {
  studentName,
  batchName,
  supervisorName,
} from "../../../helpers/internship";

export default function InternshipsTable({
  search,
  status,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onChangeStatus,
}: InternshipsTableProps) {
  const params: InternshipParams = {
    page,
    limit,
    ...(status ? { status } : {}),
  };

  const { data, isLoading } = useInternships(params);
  const { mutate: setCurrent } = useSetCurrentInternship();

  const rowsAll: Internship[] = data?.data ?? [];
  // Search is client-side against the current page (list endpoint has no search param).
  const rows = search
    ? rowsAll.filter((it) =>
        studentName(it).toLowerCase().includes(search.toLowerCase()),
      )
    : rowsAll;

  const meta: TableMeta | null = data
    ? {
        page: data.page,
        pages: data.pages,
        count: data.total,
        limit,
        hasPrev: data.page > 1,
        hasNext: data.page < data.pages,
      }
    : null;

  const columns: Column<Internship>[] = [
    { header: "Student", render: (row) => studentName(row) },
    { header: "Batch", render: (row) => batchName(row) },
    { header: "Session", render: (row) => row.session ?? "—" },
    {
      header: "IT Status",
      render: (row) => <StatusBadge status={row.itStatus} />,
    },
    {
      header: "Current",
      render: (row) =>
        row.isCurrent ? (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 4,
              color: "#10b981",
              fontWeight: 600,
              fontSize: 12,
            }}
          >
            <Star size={13} /> Current
          </span>
        ) : (
          <span style={{ color: "var(--color-text-secondary)", fontSize: 12 }}>
            —
          </span>
        ),
    },
    { header: "Supervisor", render: (row) => supervisorName(row) },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropDown
          actions={[
            {
              label: "Change Status",
              icon: <RefreshCw size={13} />,
              onClick: () => onChangeStatus(row),
            },
            {
              label: "Set Current",
              icon: <CheckCircle2 size={13} />,
              onClick: () => setCurrent(row._id),
              disabled: row.isCurrent,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<Internship>
      columns={columns}
      data={rows}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
