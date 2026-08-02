import React from "react";
import GeneralTable from "../../ui/GeneralTable/GeneralTable";
import type { TableMeta, Column } from "../../ui/GeneralTable/GeneralTable";
import { Eye } from "lucide-react";
import type { AdminCertificateRequest } from "../../../api/types/certificate";
import StatusBadge from "../../ui/StatusBadge/StatusBadge";

interface AdminCertTableProps {
  requests: AdminCertificateRequest[];
  meta: TableMeta | null;
  loading: boolean;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onView: (id: string) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
}

function CheckBox({
  checked,
  indeterminate,
  onChange,
}: {
  checked: boolean;
  indeterminate?: boolean;
  onChange: () => void;
}) {
  return (
    <input
      type="checkbox"
      checked={checked}
      ref={(el) => {
        if (el) el.indeterminate = !!indeterminate;
      }}
      onChange={onChange}
      style={{
        width: 15,
        height: 15,
        cursor: "pointer",
        accentColor: "var(--color-accent)",
      }}
    />
  );
}

const AdminCertTable: React.FC<AdminCertTableProps> = ({
  requests,
  meta,
  loading,
  onPageChange,
  onLimitChange,
  onView,
  selectedIds,
  onSelectionChange,
}) => {
  const selectableRequests = requests.filter(
    (r) => r.approvalStatus === "pending",
  );

  const allSelected =
    selectableRequests.length > 0 &&
    selectableRequests.every((s) => selectedIds.has(s._id));
  const someSelected = selectableRequests.some((s) => selectedIds.has(s._id));

  const toggleAll = () => {
    const next = new Set<string>(selectedIds);
    if (allSelected) {
      selectableRequests.forEach((s) => next.delete(s._id));
    } else {
      selectableRequests.forEach((s) => next.add(s._id));
    }
    onSelectionChange(next);
  };

  const toggleOne = (id: string) => {
    const next = new Set<string>(selectedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    onSelectionChange(next);
  };

  const columns: Column<AdminCertificateRequest>[] = [
    {
      header: (
        <CheckBox
          checked={allSelected}
          indeterminate={someSelected && !allSelected}
          onChange={toggleAll}
        />
      ) as unknown as React.ReactNode,
      render: (row) =>
        row.approvalStatus === "pending" ? (
          <CheckBox
            checked={selectedIds.has(row._id)}
            onChange={() => toggleOne(row._id)}
          />
        ) : null,
    },
    {
      header: "Student",
      render: (req) => (
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={{ fontWeight: 600 }}>
            {req.user.firstName} {req.user.lastName}
          </span>
          <span
            style={{ fontSize: 11.5, color: "var(--color-text-secondary)" }}
          >
            {req.student.registrationNumber}
          </span>
        </div>
      ),
    },
    {
      header: "Department",
      accessor: "student.department.name",
    },
    {
      header: "Level",
      render: (req) =>
        `${req.student.program.type} ${req.student.program.level}`,
    },
    {
      header: "Graduation",
      render: (req) => `${req.graduationMonth} ${req.graduationYear}`,
    },
    {
      header: "Payment",
      render: (req) => <StatusBadge status={req.paymentStatus} />,
    },
    {
      header: "Approval",
      render: (req) => <StatusBadge status={req.approvalStatus} />,
    },
    {
      header: "Request Date",
      render: (req) => new Date(req.createdAt).toLocaleDateString(),
    },
    {
      header: "Actions",
      render: (req) => (
        <div
          style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}
        >
          <button
            onClick={() => onView(req._id)}
            className="action-btn"
            title="View Details"
            style={{
              padding: "6px",
              background: "#f1f5f9",
              borderRadius: "6px",
              color: "#334155",
            }}
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <GeneralTable<AdminCertificateRequest>
      data={requests}
      columns={columns}
      loading={loading}
      meta={meta}
      onPageChange={onPageChange}
      onLimitChange={onLimitChange}
    />
  );
};

export default AdminCertTable;
