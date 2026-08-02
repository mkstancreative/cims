import { CheckCircle, AlertCircle } from "lucide-react";
import CustomModal from "../CustomModal/CustomModal";

export interface ImportError {
  row: string;
  error: string;
}

export interface ImportData {
  total: number;
  successful: number;
  failed: number;
  errors: ImportError[];
}

export interface ImportResponse {
  success: boolean;
  message: string;
  data: ImportData;
}

interface ImportResultProps {
  isOpen: boolean;
  result: ImportResponse;
  onClose: () => void;
  title?: string;
  successLabel?: string;
  failedLabel?: string;
}

export default function ImportResult({
  isOpen,
  result,
  onClose,
  title = "Import Results",
  successLabel = "successful",
  failedLabel = "failed",
}: ImportResultProps) {
  const hasErrors = result.data.failed > 0;

  return (
    <CustomModal isOpen={isOpen} onClose={onClose} title={title} size="medium">
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {/* Summary Card */}
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: hasErrors
              ? "rgba(239,68,68,0.05)"
              : "rgba(16,185,129,0.05)",
            border: `1px solid ${hasErrors ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"}`,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          {hasErrors ? (
            <AlertCircle size={24} color="#ef4444" />
          ) : (
            <CheckCircle size={24} color="#10b981" />
          )}
          <div>
            <h4 style={{ 
              margin: 0, 
              fontSize: 15, 
              fontWeight: 700, 
              color:"var(--color-text-primary)"
            }}>
              {result.message}
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 13,
                color: "var(--color-text-secondary)",
              }}
            >
              {result.data.successful} {successLabel}, {result.data.failed}{" "}
              {failedLabel}.
            </p>
          </div>
        </div>

        {/* Error List */}
        {result.data.errors.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "#ef4444",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Error Details
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
                maxHeight: 300,
                overflowY: "auto",
                paddingRight: 4,
              }}
              className="custom-scrollbar"
            >
              {result.data.errors.map((err, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    padding: "10px 12px",
                    background: "var(--color-bg-secondary)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 13,
                    gap: 15,
                  }}
                >
                  <span
                    style={{
                      fontWeight: 600,
                      color: "var(--color-text-primary)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {err.row}
                  </span>
                  <span style={{ color: "#ef4444", textAlign: "right" }}>
                    {err.error}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          className="modal-submit"
          onClick={onClose}
          style={{ width: "100%", marginTop: 10 }}
        >
          Close
        </button>
      </div>
    </CustomModal>
  );
}
