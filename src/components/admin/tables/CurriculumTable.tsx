import { Eye, Ban, Pencil } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import { useCurricula } from "../../../hooks/useCurriculum";
import type {
  CurriculumListItem,
  CurriculumParams,
} from "../../../api/types/curriculum";

interface CurriculumTableProps {
  search?: string;
  isActive?: "" | "true" | "false";
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onView: (curriculum: CurriculumListItem) => void;
  onEdit: (curriculum: CurriculumListItem) => void;
  onDeactivateRequest: (curriculum: CurriculumListItem) => void;
}

export default function CurriculumTable({
  search,
  isActive,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onView,
  onEdit,
  onDeactivateRequest,
}: CurriculumTableProps) {
  const params: CurriculumParams = {
    page,
    limit,
    ...(isActive ? { isActive: isActive === "true" } : {}),
  };

  const { data, isLoading } = useCurricula(params);

  const rowsAll: CurriculumListItem[] = data?.data ?? [];
  // Search is client-side against the current page (list endpoint has no search param).
  const rows = search
    ? rowsAll.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()),
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

  const columns: Column<CurriculumListItem>[] = [
    { header: "Name", accessor: "name" },
    {
      header: "Description",
      render: (row) => row.description ?? "—",
    },
    {
      header: "Batches",
      render: (row) => row.batchCount ?? 0,
    },
    {
      header: "Status",
      render: (row) => (
        <StatusBadge status={row.isActive ? "active" : "inactive"} />
      ),
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropDown
          actions={[
            {
              label: "View Topics",
              icon: <Eye size={13} />,
              onClick: () => onView(row),
            },
            {
              label: "Edit",
              icon: <Pencil size={13} />,
              onClick: () => onEdit(row),
            },
            {
              label: "Deactivate",
              icon: <Ban size={13} />,
              onClick: () => onDeactivateRequest(row),
              danger: true,
              disabled: !row.isActive,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<CurriculumListItem>
      columns={columns}
      data={rows}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
