import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeftRight,
  BookOpen,
  Briefcase,
  ClipboardCheck,
  Eye,
  RefreshCw,
  Star,
} from "lucide-react";
import GeneralTable from "../../components/ui/GeneralTable/GeneralTable";
import InternshipStatusBadge from "../../components/ui/StatusBadge/InternshipStatusBadge";
import ActionDropDown from "../../components/ui/ActionDropdown/ActionDropDown";
import type { Column } from "../../components/ui/GeneralTable/GeneralTable";
import { useMyInternshipHistory } from "../../hooks/useInternships";
import type {
  Internship,
  InternshipSupervisorRef,
} from "../../api/types/internship";
import { useSelectedInternship } from "../../context/useInternship";
import {
  internshipBatch,
  internshipPeriod,
  internshipSession,
} from "../../helpers/internship";
import ReEnrollForm from "../../components/student/forms/ReEnrollForm";

function supervisorName(supervisor: Internship["supervisor"]): string {
  if (!supervisor || typeof supervisor === "string") return "—";
  const s = supervisor as InternshipSupervisorRef;
  if (s.user) {
    return `${s.user.firstName} ${s.user.lastName}`.trim();
  }
  return s.staffId ?? "—";
}

export default function MyInternships() {
  const navigate = useNavigate();

  // Viewing an internship's pages selects it in the top-bar switcher, so
  // every student page then shows that internship's records.
  const { selected, select } = useSelectedInternship();
  const openInternshipPage = (row: Internship, path: string) => {
    select(row._id);
    navigate(path);
  };

  const { data, isLoading } = useMyInternshipHistory();
  const internships: Internship[] = data?.data ?? [];
  const [reEnrollOpen, setReEnrollOpen] = useState(false);

  const columns: Column<Internship>[] = [
    {
      header: "Batch",
      render: (row) => (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>
            {internshipBatch(row)?.name ?? "—"}
          </span>
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
          {/* The one the student pages are showing, when it's a past one */}
          {!row.isCurrent && row._id === selected?._id && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 3,
                fontSize: 11,
                fontWeight: 700,
                color: "#a16207",
                background: "rgba(202, 138, 4, .14)",
                padding: "2px 7px",
                borderRadius: 20,
              }}
            >
              <Eye size={10} /> Viewing
            </span>
          )}
        </span>
      ),
    },
    { header: "Session", render: (row) => internshipSession(row) ?? "—" },
    { header: "IT Period", render: (row) => internshipPeriod(row) },
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
              onClick: () => openInternshipPage(row, "/student/evaluation"),
            },
            {
              label: "View Logbooks",
              icon: <BookOpen size={13} />,
              onClick: () => openInternshipPage(row, "/student/logbook"),
            },
            {
              label: "Switch to this internship",
              icon: <ArrowLeftRight size={13} />,
              onClick: () => openInternshipPage(row, "/student/dashboard"),
              disabled: row._id === selected?._id,
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
