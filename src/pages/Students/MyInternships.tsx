import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  ClipboardCheck,
  RefreshCw,
  Star,
} from "lucide-react";
import GeneralTable from "../../components/ui/GeneralTable/GeneralTable";
import InternshipStatusBadge from "../../components/ui/StatusBadge/InternshipStatusBadge";
import ActionDropDown from "../../components/ui/ActionDropdown/ActionDropDown";
import type { Column } from "../../components/ui/GeneralTable/GeneralTable";
import { useMyInternshipHistory } from "../../hooks/useInternships";
import { formatDate } from "../../helpers/utilities";
import type {
  Internship,
  InternshipBatchRef,
  InternshipSupervisorRef,
} from "../../api/types/internship";
import ReEnrollForm from "../../components/student/forms/ReEnrollForm";

function batchName(batch: Internship["batch"]): string {
  if (!batch) return "—";
  if (typeof batch === "string") return batch;
  return batch.name ?? "—";
}

function batchSession(internship: Internship): string {
  if (internship.session) return internship.session;
  const batch = internship.batch;
  if (batch && typeof batch !== "string") {
    return (batch as InternshipBatchRef).session ?? "—";
  }
  return "—";
}

function supervisorName(supervisor: Internship["supervisor"]): string {
  if (!supervisor || typeof supervisor === "string") return "—";
  const s = supervisor as InternshipSupervisorRef;
  if (s.user) {
    return `${s.user.firstName} ${s.user.lastName}`.trim();
  }
  return s.staffId ?? "—";
}

function periodText(internship: Internship): string {
  const period =
    internship.itPeriod ??
    (internship.batch && typeof internship.batch !== "string"
      ? (internship.batch as InternshipBatchRef).itPeriod
      : undefined);
  if (!period?.startDate) return "—";
  return `${formatDate(period.startDate)} – ${
    period.endDate ? formatDate(period.endDate) : "—"
  }`;
}

/** The batch's id, whether the batch arrives populated or as a bare id. */
function batchId(batch: Internship["batch"]): string | undefined {
  if (!batch) return undefined;
  return typeof batch === "string" ? batch : batch._id;
}

export default function MyInternships() {
  const navigate = useNavigate();

  // Both pages take the internship in the path and its batch as a query, so
  // the API returns that internship's records, not just the current one's.
  const openInternshipPage = (
    row: Internship,
    page: "evaluation" | "logbooks",
  ) => {
    const b = batchId(row.batch);
    navigate(
      `/student/internships/${row._id}/${page}${b ? `?batchId=${b}` : ""}`,
    );
  };

  const { data, isLoading } = useMyInternshipHistory();
  const internships: Internship[] = data?.data ?? [];
  const [reEnrollOpen, setReEnrollOpen] = useState(false);

  const columns: Column<Internship>[] = [
    {
      header: "Batch",
      render: (row) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>{batchName(row.batch)}</span>
          {row.isCurrent && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                fontWeight: 700,
                color: "var(--color-primary)",
                background: "rgba(var(--color-primary-rgb), .12)",
                padding: "2px 7px",
                borderRadius: 20,
              }}
            >
              <Star size={10} fill="var(--color-primary)" /> Current
            </span>
          )}
        </span>
      ),
    },
    { header: "Session", render: (row) => batchSession(row) },
    { header: "IT Period", render: (row) => periodText(row) },
    { header: "Supervisor", render: (row) => supervisorName(row.supervisor) },
    {
      header: "Status",
      render: (row) => <InternshipStatusBadge status={row.itStatus} />,
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropDown
          actions={[
            {
              label: "View Evaluation",
              icon: <ClipboardCheck size={13} />,
              onClick: () => openInternshipPage(row, "evaluation"),
            },
            {
              label: "View Logbooks",
              icon: <BookOpen size={13} />,
              onClick: () => openInternshipPage(row, "logbooks"),
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <Briefcase size={20} />
          </div>
          <div>
            <h2 className="page-title">My Internships</h2>
            <p className="page-sub">
              History of your industrial training placements
            </p>
          </div>
        </div>

        <button
          type="button"
          className="add-btn"
          onClick={() => setReEnrollOpen(true)}
        >
          <RefreshCw size={15} />
          Re-enroll (Next Cycle)
        </button>
      </div>

      <div className="table-wrapper">
        <GeneralTable<Internship>
          columns={columns}
          data={internships}
          loading={isLoading}
          meta={null}
          onPageChange={() => {}}
          onLimitChange={() => {}}
        />
      </div>

      <ReEnrollForm
        isOpen={reEnrollOpen}
        onClose={() => setReEnrollOpen(false)}
      />
    </div>
  );
}
