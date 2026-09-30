import { useState } from "react";
import { HelpCircle } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import StatusChangeDialog from "../../components/ui/Lifecycle/StatusChangeDialog";
import DeleteDialog from "../../components/ui/Lifecycle/DeleteDialog";
import type { LifecycleTarget } from "../../helpers/lifecycle";
import QuizForm from "../../components/admin/forms/QuizForm";
import QuizzesTable from "../../components/admin/tables/QuizzesTable";
import QuizViewModal from "../../components/admin/view/QuizViewModal";
import { useModal } from "../../context/ModalContext";
import { useLiveQuizSittings } from "../../hooks/useQuizSessions";
import type { QuizListItem } from "../../api/types/quiz";

interface FilterState {
  search: string;
  isActive: "" | "true" | "false";
  page: number;
  limit: number;
}

export default function Quizzes() {
  // Quizzes being sat right now can't be edited — disable, don't let it fail.
  const liveSittings = useLiveQuizSittings();
  const { openModal, closeModal } = useModal();

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    isActive: "",
    page: 1,
    limit: 10,
  });

  const setField = <K extends keyof FilterState>(
    field: K,
    value: FilterState[K],
  ) => setFilters((prev) => ({ ...prev, [field]: value, page: 1 }));

  const [statusTarget, setStatusTarget] = useState<LifecycleTarget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<LifecycleTarget | null>(null);
  const asTarget = (q: QuizListItem): LifecycleTarget => ({
    _id: q._id,
    name: q.title,
    isActive: q.isActive,
  });

  const handleReset = () =>
    setFilters({ search: "", isActive: "", page: 1, limit: 10 });

  const openCreate = () =>
    openModal(<QuizForm key="new" isOpen onClose={closeModal} />);
  const openEdit = (quiz: QuizListItem) =>
    openModal(
      <QuizForm
        key={quiz._id}
        isOpen
        onClose={closeModal}
        editingId={quiz._id}
      />,
    );
  const openView = (quiz: QuizListItem) =>
    openModal(
      <QuizViewModal key={quiz._id} isOpen onClose={closeModal} id={quiz._id} />,
    );

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <HelpCircle size={20} />
          </div>
          <div>
            <h2 className="page-title">Quizzes</h2>
            <p className="page-sub">Manage assessment quizzes</p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton text="Add Quiz" onClick={openCreate} />
        </div>
      </div>

      {/* ── Search + filters ── */}
      <div className="filter-selects-block filter-selects-block--with-search">
        <div className="filter-search-field">
          <span className="filter-label">Search</span>
          <SearchInput
            value={filters.search}
            onChange={(val) => setField("search", val)}
            placeholder="Search by title…"
            onClear={() => setField("search", "")}
          />
        </div>
        <SelectFilter
          label="Status"
          options={[
            { value: "", label: "All Status" },
            { value: "true", label: "Active" },
            { value: "false", label: "Inactive" },
          ]}
          value={filters.isActive}
          onChange={(value) =>
            setField("isActive", value as FilterState["isActive"])
          }
          name="isActive"
        />
        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <QuizzesTable
          search={filters.search}
          isActive={filters.isActive}
          page={filters.page}
          limit={filters.limit}
          onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
          onView={openView}
          onEdit={openEdit}
          liveSittings={liveSittings}
          onToggleStatusRequest={(q) => setStatusTarget(asTarget(q))}
          onDeleteRequest={(q) => setDeleteTarget(asTarget(q))}
        />
      </div>

      <StatusChangeDialog
        resource="quiz"
        target={statusTarget}
        onClose={() => setStatusTarget(null)}
      />
      <DeleteDialog
        key={deleteTarget?._id ?? "none"}
        resource="quiz"
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
