import { useState } from "react";
import { Briefcase, RefreshCw, Star } from "lucide-react";
import GeneralTable from "../../components/ui/GeneralTable/GeneralTable";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
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

export default function MyInternships() {
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
                color: "#0d9488",
                background: "rgba(13,148,136,.12)",
                padding: "2px 7px",
                borderRadius: 20,
              }}
            >
              <Star size={10} fill="#0d9488" /> Current
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
      render: (row) => <StatusBadge status={row.itStatus} />,
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
