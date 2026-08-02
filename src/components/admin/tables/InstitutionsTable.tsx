import { Pencil, Ban, CheckCircle } from "lucide-react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";
import ActionDropDown from "../../ui/ActionDropdown/ActionDropDown";
import { useInstitutions } from "../../../hooks/useInstitutions";
import type {
  Institution,
  InstitutionParams,
} from "../../../api/types/institution";

interface InstitutionsTableProps {
  search?: string;
  isActive?: "" | "true" | "false";
  page: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onEdit: (institution: Institution) => void;
  onToggleStatusRequest: (institution: Institution) => void;
}

export default function InstitutionsTable({
  search,
  isActive,
  page,
  limit,
  onPageChange,
  onLimitChange,
  onEdit,
  onToggleStatusRequest,
}: InstitutionsTableProps) {
  const params: InstitutionParams = {
    page,
    limit,
    ...(search ? { search } : {}),
    ...(isActive ? { isActive: isActive === "true" } : {}),
  };

  const { data, isLoading } = useInstitutions(params);

  const institutions: Institution[] = data?.data ?? [];

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

  const columns: Column<Institution>[] = [
    { header: "Name", accessor: "name" },
    { header: "Code", accessor: "code" },
    { header: "Address", accessor: "address" },
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
              label: "Edit",
              icon: <Pencil size={13} />,
              onClick: () => onEdit(row),
            },
            {
              label: row.isActive ? "Deactivate" : "Activate",
              icon: row.isActive ? (
                <Ban size={13} />
              ) : (
                <CheckCircle size={13} />
              ),
              onClick: () => onToggleStatusRequest(row),
              danger: row.isActive,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<Institution>
      columns={columns}
      data={institutions}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
