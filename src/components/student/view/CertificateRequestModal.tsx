import React, { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { useRequestCertificate } from "../../../hooks/useCertificate";
import CustomModal from "../../ui/CustomModal/CustomModal";
import Spinner from "../../ui/Spinner/Spinner";

interface CertificateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CertificateRequestModal: React.FC<
  CertificateRequestModalProps
> = ({ isOpen, onClose }) => {
  const { mutate: request, isPending } = useRequestCertificate();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 15 }, (_, i) =>
    (currentYear - i).toString(),
  );

  const [formData, setFormData] = useState({
    graduationYear: currentYear.toString(),
    graduationMonth: "January",
    graduationDate: new Date().toISOString().split("T")[0],
    placeOfIT: "",
  });

  const [schooledInPoly, setSchooledInPoly] = useState(true);
  const [files, setFiles] = useState<{ [key: string]: File | null }>({
    ndStatementOfResult: null,
    itDischargeLetter: null,
    hndStatementOfResult: null,
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles({ ...files, [e.target.name]: e.target.files[0] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();

    // Append text fields
    data.append("graduationYear", formData.graduationYear);
    data.append("graduationMonth", formData.graduationMonth);
    data.append("graduationDate", formData.graduationDate);
    data.append("placeOfIT", formData.placeOfIT);

    // Append files
    if (files.ndStatementOfResult) {
      data.append("ndStatementOfResult", files.ndStatementOfResult);
    }
    if (files.itDischargeLetter) {
      data.append("itDischargeLetter", files.itDischargeLetter);
    }
    if (!schooledInPoly && files.hndStatementOfResult) {
      data.append("hndStatementOfResult", files.hndStatementOfResult);
    }

    request(data, {
      onSuccess: (res) => {
        if (res?.success !== false) {
          onClose();
        }
      },
    });
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={onClose}
      title="Request IT Certificate"
      subtitle="Provide your graduation and placement details"
      icon={<CheckCircle2 size={18} />}
      size="medium"
      footer={
        <>
          <button
            className="modal-cancel"
            type="button"
            onClick={() => onClose()}
            disabled={isPending}
          >
            Cancel
          </button>
          <button
            className="modal-submit"
            type="submit"
            form="cert-request-form"
            disabled={isPending}
          >
            {isPending ? <Spinner size={14} color="#fff" /> : "Submit Request"}
          </button>
        </>
      }
    >
      <form id="cert-request-form" onSubmit={handleSubmit} className="form-grid">
        <div className="form-group col-2">
          <label className="modal-label">Graduation Year</label>
          <select
            name="graduationYear"
            className="modal-input"
            value={formData.graduationYear}
            onChange={handleInputChange}
            required
          >
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Graduation Month</label>
          <select
            name="graduationMonth"
            className="modal-input"
            value={formData.graduationMonth}
            onChange={handleInputChange}
            required
          >
            <option value="January">January</option>
            <option value="February">February</option>
            <option value="March">March</option>
            <option value="April">April</option>
            <option value="May">May</option>
            <option value="June">June</option>
            <option value="July">July</option>
            <option value="August">August</option>
            <option value="September">September</option>
            <option value="October">October</option>
            <option value="November">November</option>
            <option value="December">December</option>
          </select>
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Exact Graduation Date</label>
          <input
            type="date"
            name="graduationDate"
            className="modal-input"
            value={formData.graduationDate}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">Place of IT</label>
          <input
            type="text"
            name="placeOfIT"
            className="modal-input"
            placeholder="e.g. Netpro International"
            value={formData.placeOfIT}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group col-4">
          <label className="modal-label">Did you do your ND in FPNO?</label>
          <div style={{ display: "flex", gap: "24px", marginTop: "8px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "var(--color-text-primary)",
              }}
            >
              <input
                type="radio"
                name="schooledInPoly"
                checked={schooledInPoly === true}
                onChange={() => setSchooledInPoly(true)}
              />
              Yes, I attended FPNO
            </label>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                fontSize: "14px",
                color: "var(--color-text-primary)",
              }}
            >
              <input
                type="radio"
                name="schooledInPoly"
                checked={schooledInPoly === false}
                onChange={() => setSchooledInPoly(false)}
              />
              No, I attended another institution
            </label>
          </div>
        </div>

        <div className="section-title-divider">Required Documents</div>

        <div className="form-group col-2">
          <label className="modal-label">ND Statement of Result</label>
          <input
            type="file"
            className="modal-input"
            name="ndStatementOfResult"
            onChange={handleFileChange}
            required
          />
        </div>

        <div className="form-group col-2">
          <label className="modal-label">IT Discharge Letter</label>
          <input
            type="file"
            className="modal-input"
            name="itDischargeLetter"
            onChange={handleFileChange}
            required
          />
        </div>

        {!schooledInPoly && (
          <div className="form-group col-2">
            <label className="modal-label">HND Statement of Result</label>
            <input
              type="file"
              className="modal-input"
              name="hndStatementOfResult"
              onChange={handleFileChange}
              required={!schooledInPoly}
            />
          </div>
        )}
      </form>
    </CustomModal>
  );
};
