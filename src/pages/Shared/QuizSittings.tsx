import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardCheck, ClipboardList } from "lucide-react";
import GeneralTable from "../../components/ui/GeneralTable/GeneralTable";
import type {
  Column,
  TableMeta,
} from "../../components/ui/GeneralTable/GeneralTable";
import StatusBadge from "../../components/ui/StatusBadge/StatusBadge";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import AddButton from "../../components/ui/AddButton/AddButton";
import ActionDropDown from "../../components/ui/ActionDropdown/ActionDropDown";
import OpenSittingForm from "../../components/admin/forms/OpenSittingForm";
import { useModal } from "../../context/ModalContext";
import { useAuth } from "../../context/useAuth";
import { useQuizSessions } from "../../hooks/useQuizSessions";
import { formatDateTime } from "../../helpers/utilities";
import type {
  QuizSession,
  QuizSessionStatus,
} from "../../api/types/quizSession";

interface FilterState {
  status: QuizSessionStatus | "";
  page: number;
  limit: number;
}

function batchLabel(session: QuizSession): string {
  const b = session.batch;
  if (b && typeof b === "object") {
    return b.session ? `${b.name} — ${b.session}` : b.name;
  }
  return "—";
}

function counts(session: QuizSession) {
  if (session.summary) return session.summary;
  const total = session.records?.length ?? 0;
  const present = session.records?.filter((r) => r.present).length ?? 0;
  return { total, present, absent: total - present };
}

/**
 * Sitting history, per batch. A supervisor's list is scoped to their own
 * batches by the API, so the same page serves both roles.
 */
export default function QuizSittings() {
  const navigate = useNavigate();
  const { openModal, closeModal } = useModal();
  const { user } = useAuth();
  const rolePrefix = user?.role === "supervisor" ? "/supervisor" : "/admin";

  const [filters, setFilters] = useState<FilterState>({
    status: "",
    page: 1,
    limit: 10,
  });

  const { data, isLoading } = useQuizSessions({
    page: filters.page,
    limit: filters.limit,
    ...(filters.status ? { status: filters.status } : {}),
  });

  const sessions: QuizSession[] = data?.data ?? [];
  const currentPage = data?.page ?? 1;
  const pages = data?.pages ?? 1;
  const meta: TableMeta | null = data
    ? {
        page: currentPage,
        pages,
        count: data.total ?? sessions.length,
        limit: filters.limit,
        hasPrev: currentPage > 1,
        hasNext: currentPage < pages,
      }
    : null;

  const openRollCall = (session: QuizSession) =>
    navigate(`${rolePrefix}/quiz-sittings/${session._id}`);

  const columns: Column<QuizSession>[] = [
    { header: "Batch", render: (row) => batchLabel(row) },
    { header: "Sitting", render: (row) => `#${row.sitting}` },
    { header: "Status", render: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Present",
      render: (row) => {
        const c = counts(row);
        return `${c.present} / ${c.total}`;
      },
    },
    {
      header: "Absent",
      render: (row) => String(counts(row).absent),
    },
    {
      header: "Opened",
      render: (row) => formatDateTime(row.openedAt ?? row.createdAt),
    },
    {
      header: "Actions",
      render: (row) => (
        <ActionDropDown
          actions={[
            {
              label: row.status === "closed" ? "View roll" : "Take attendance",
              icon: <ClipboardCheck size={13} />,
              onClick: () => openRollCall(row),
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
            <ClipboardList size={20} />
          </div>
          <div>
            <h2 className="page-title">Quiz Sittings</h2>
            <p className="page-sub">
              Attendance is taken before a batch sits its quiz
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton
            text="Open Sitting"
            onClick={() =>
              openModal(<OpenSittingForm isOpen onClose={closeModal} />)
            }
          />
        </div>
      </div>

      <div className="filter-selects-block">
        <SelectFilter
          label="Status"
          options={[
            { value: "", label: "All Status" },
            { value: "open", label: "Open" },
            { value: "unlocked", label: "Unlocked" },
            { value: "closed", label: "Closed" },
          ]}
          value={filters.status}
          onChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              status: value as QuizSessionStatus | "",
              page: 1,
            }))
          }
          name="status"
        />
        <ResetButton
          onClick={() => setFilters({ status: "", page: 1, limit: 10 })}
        />
      </div>

      <div className="table-wrapper">
        <GeneralTable<QuizSession>
          columns={columns}
          data={sessions}
          loading={isLoading}
          meta={meta}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) =>
            setFilters((prev) => ({ ...prev, limit: l, page: 1 }))
          }
          rowProps={(row) => ({
            style: { cursor: "pointer" },
            onClick: () => openRollCall(row),
          })}
        />
      </div>
    </div>
  );
}
