import { Eye, Book } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { StudentSummary } from "../../../api/types/schoolSupervisor";
import type { Column, TableMeta } from "../../ui/GeneralTable/GeneralTable";
import ActionDropdown from "../../ui/ActionDropdown/ActionDropDown";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

interface AssignedStudentTableProps {
  data: StudentSummary[];
  isLoading: boolean;
  meta: TableMeta;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onView: (student: StudentSummary) => void;
}

export default function AssignedStudentTable({
  data,
  isLoading,
  meta,
  onPageChange,
  onLimitChange,
  onView,
}: AssignedStudentTableProps) {
  const navigate = useNavigate();

  const columns: Column<StudentSummary>[] = [
    {
      header: "Name",
      render: (row) => `${row.user.firstName} ${row.user.lastName}`,
    },
    {
      header: "Reg. Number",
      render: (row) => row.registrationNumber,
    },
    {
      header: "Department",
      render: (row) => row.department.name,
    },
    {
      header: "Program",
      render: (row) => `${row.program.type} - ${row.program.level}`,
    },
    {
      header: "Status",
      render: (row) => <StatusBadge status={row.itStatus} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropdown
          actions={[
            {
              label: "View Details",
              icon: <Eye size={13} />,
              onClick: () => onView(row),
            },
            {
              label: "View Logbooks",
              icon: <Book size={13} />,
              onClick: () =>
                navigate(`/supervisor/students/${row._id}/logbooks`),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <GeneralTable<StudentSummary>
      columns={columns}
      data={data}
      loading={isLoading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
}
