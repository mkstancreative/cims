import { useState, useRef, useEffect } from "react";
import html2pdf from "html2pdf.js";
import { toast } from "react-toastify";
import { useGetMyCertificate } from "./useCertificate";
import type { AdminCertificateRequest } from "../api/types/certificate";

interface Html2PdfOptions {
  margin?: number | [number, number] | [number, number, number, number];
  filename?: string;
  image?: { type: "jpeg" | "png" | "webp"; quality: number };
  html2canvas?: {
    scale: number;
    useCORS?: boolean;
    letterRendering?: boolean;
    logging?: boolean;
    backgroundColor?: string;
    windowWidth?: number;
  };
  jsPDF?: {
    unit: string;
    format: string | [number, number];
    orientation: "portrait" | "landscape";
  };
}

export const useCertificateDownload = () => {
  const certRef = useRef<HTMLDivElement>(null);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [certData, setCertData] = useState<AdminCertificateRequest | null>(
    null,
  );
  const { mutate: fetchCertData } = useGetMyCertificate();

  const handleDownloadCert = async (canDownload: boolean) => {
    if (!canDownload) {
      toast.warning("Certificate is not ready for download yet.");
      return;
    }

    setDownloadingCert(true);

    fetchCertData(undefined, {
      onSuccess: (res) => {
        if (res.success) {
          setCertData(res.data);
        } else {
          setDownloadingCert(false);
          toast.error("Failed to fetch certificate details.");
        }
      },
      onError: () => {
        setDownloadingCert(false);
        toast.error("An error occurred while fetching certificate details.");
      },
    });
  };

  useEffect(() => {
    const generatePDF = async () => {
      if (certData && downloadingCert) {
        // Small delay to ensure the DOM is fully painted with certData
        await new Promise((resolve) => setTimeout(resolve, 300));

        const element = certRef.current;
        if (!element) return;

        try {
          const opt: Html2PdfOptions = {
            margin: [0, 0],
            filename: `SIWES_Certificate_${certData.student.registrationNumber}.pdf`,
            image: { type: "jpeg", quality: 0.95 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              logging: false, // Turn off logging
              backgroundColor: "#ffffff",
              windowWidth: 1200, // Fixed width for consistent rendering
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          };

          await html2pdf().from(element).set(opt).save();
          toast.success("Certificate downloaded successfully!");
        } catch (error) {
          console.error("PDF Error:", error);
          toast.error("Failed to generate PDF. Please try again.");
        } finally {
          setCertData(null);
          setDownloadingCert(false);
        }
      }
    };

    generatePDF();
  }, [certData, downloadingCert]);

  return {
    certRef,
    downloadingCert,
    certData,
    handleDownloadCert,
  };
};

export const useRequestFormDownload = () => {
  const reqRef = useRef<HTMLDivElement>(null);
  const [downloadingReq, setDownloadingReq] = useState(false);

  const handleDownloadReq = async () => {
    if (!reqRef.current || downloadingReq) return;
    setDownloadingReq(true);
    try {
      const opt: Html2PdfOptions = {
        margin: [0, 0],
        filename: "SIWES_IT_Request_Form.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };
      await html2pdf().set(opt).from(reqRef.current).save();
    } catch (e: unknown) {
      console.error("Request form download failed:", e);
    } finally {
      setDownloadingReq(false);
    }
  };

  return {
    reqRef,
    downloadingReq,
    handleDownloadReq,
  };
};
