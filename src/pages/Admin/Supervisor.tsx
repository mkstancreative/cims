import { useState } from "react";
import { UserRound } from "lucide-react";
import AddButton from "../../components/ui/AddButton/AddButton";
import SearchInput from "../../components/ui/SearchInput/SearchInput";
import ResetButton from "../../components/ui/ResetButton/ResetButton";
import SupervisorForm from "../../components/admin/forms/SupervisorForm";
import SupervisorsTable from "../../components/admin/tables/SupervisorsTable";
import { useModal } from "../../context/ModalContext";

interface FilterState {
  search: string;
  page: number;
  limit: number;
}

export default function SupervisorPage() {
  const { openModal, closeModal } = useModal();

  const [filter, setFilter] = useState<FilterState>({
    search: "",
    page: 1,
    limit: 10,
  });

  const setField = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K],
  ) => setFilter((prev) => ({ ...prev, [key]: value, page: 1 }));

  const handleReset = () => setFilter({ search: "", page: 1, limit: 10 });

  const openCreate = () =>
    openModal(<SupervisorForm key="new" isOpen onClose={closeModal} />);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-left">
          <div className="page-icon orange">
            <UserRound size={20} />
          </div>
          <div>
            <h2 className="page-title">Supervisors</h2>
            <p className="page-sub">
              Manage clinical supervisors in the institution
            </p>
          </div>
        </div>
        <div className="page-header-right">
          <AddButton text="Add Supervisor" onClick={openCreate} />
        </div>
      </div>

      <div className="filter-wrapper">
        <SearchInput
          value={filter.search}
          onChange={(val) => setField("search", val)}
          placeholder="Search by name, staff ID…"
          onClear={handleReset}
        />
      </div>

      <div className="filter-selects-block">
        <ResetButton onClick={handleReset} />
      </div>

      <div className="table-wrapper">
        <SupervisorsTable
          search={filter.search}
          page={filter.page}
          limit={filter.limit}
          onPageChange={(p) => setFilter((prev) => ({ ...prev, page: p }))}
          onLimitChange={(l) => setField("limit", l)}
        />
      </div>
    </div>
  );
}
