import { Search, X } from "lucide-react";
import "./SearchInput.css";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
}

function SearchInput({
  value,
  onChange,
  onClear,
  placeholder,
}: SearchInputProps) {
  return (
    <div className="search-box">
      <Search size={15} className="search-icon" />
      <input
        type="text"
        placeholder={placeholder || "Search by name, ID or email…"}
        value={value}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
          onChange(e.target.value)
        }
        className="search-input"
        autoFocus
      />
      {value && (
        <button className="search-clear" onClick={onClear}>
          <X size={15} />
        </button>
      )}
    </div>
  );
}

export default SearchInput;
