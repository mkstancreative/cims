import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import { useSupervisors } from "../../../hooks/useSupervisors";
import type {
  Supervisor,
  SupervisorParams,
} from "../../../api/types/supervisor";

interface SupervisorsTableProps {
  search?: string;
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
}

export default function SupervisorsTable({
  search,
  page,
  limit,
  onPageChange,
  onLimitChange,
}: SupervisorsTableProps) {
  const params: SupervisorParams = {
    page,
    limit,
    ...(search ? { search } : {}),
  };

  const { data, isLoading } = useSupervisors(params);
  const supervisors: Supervisor[] = data?.data ?? [];

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

  const columns: Column<Supervisor>[] = [
    {
      header: "Name",
      render: (sv) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>
            {sv.user.firstName} {sv.user.lastName}
          </span>
          <span
            style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}
          >
            {sv.user.email}
          </span>
        </div>
      ),
    },
    { header: "Phone", render: (sv) => sv.user.phone ?? "—" },
    { header: "Staff ID", render: (sv) => sv.staffId ?? "—" },
    { header: "Specialization", render: (sv) => sv.specialization ?? "—" },
    {
      header: "Students",
      render: (sv) => sv.currentStudentCount ?? 0,
    },
  ];

  return (
    <GeneralTable<Supervisor>
      columns={columns}
      data={supervisors}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
