import { useState } from "react";
import { HelpCircle } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SelectFilter from "../../components/ui/SelectFilter/SelectFilter";
import ConfirmModal from "../../components/ui/ConfirmModal/ConfirmModal";
import QuizForm from "../../components/admin/forms/QuizForm";
import QuizzesTable from "../../components/admin/tables/QuizzesTable";
import QuizViewModal from "../../components/admin/view/QuizViewModal";
import { useModal } from "../../context/ModalContext";
import { useDeactivateQuiz } from "../../hooks/useQuizzes";
import type { QuizListItem } from "../../api/types/quiz";

interface FilterState {
  search: string;
  isActive: "" | "true" | "false";
  page: number;
  limit: number;
}

export default function Quizzes() {
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

  const { mutate: deactivate, isPending: deactivating } = useDeactivateQuiz();

  const [deactivateTarget, setDeactivateTarget] = useState<QuizListItem | null>(
    null,
  );

  const handleReset = () =>
    setFilters({ search: "", isActive: "", page: 1, limit: 10 });

  const openCreate = () =>
    openModal(<QuizForm key="new" isOpen onClose={closeModal} />);
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

      <div className="filter-wrapper">
        <SearchInput
          value={filters.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by title…"
          onClear={handleReset}
        />
      </div>

      <div className="filter-selects-block">
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
          onDeactivateRequest={setDeactivateTarget}
        />
      </div>

      <ConfirmModal
        isOpen={Boolean(deactivateTarget)}
        variant="danger"
        title="Deactivate Quiz"
        message={
          deactivateTarget
            ? `Are you sure you want to deactivate "${deactivateTarget.title}"?`
            : ""
        }
        confirmText="Yes, Deactivate"
        cancelText="Cancel"
        isPending={deactivating}
        onConfirm={() => {
          if (deactivateTarget)
            deactivate(deactivateTarget._id, {
              onSuccess: () => setDeactivateTarget(null),
            });
        }}
        onCancel={() => setDeactivateTarget(null)}
      />
    </div>
  );
}
