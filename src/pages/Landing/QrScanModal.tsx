import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { createPortal } from "react-dom";
import jsQR from "jsqr";
import { ImageUp, ScanQrCode, X } from "lucide-react";
import "./QrScanModal.css";

/** The browser's own QR reader (Chrome / Android). jsQR covers the rest. */
interface NativeBarcodeDetector {
  detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]>;
}
type BarcodeDetectorCtor = new (opts: {
  formats: string[];
}) => NativeBarcodeDetector;

function nativeDetector(): NativeBarcodeDetector | null {
  const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
    .BarcodeDetector;
  try {
    return Ctor ? new Ctor({ formats: ["qr_code"] }) : null;
  } catch {
    return null;
  }
}

/**
 * A certificate QR holds the verification link
 * (`…/certificates/verify?certificateNumber=…`, or the older
 * `…/certificates/verify/<number>`). Plain text is taken as the number.
 */
function certificateNumberFrom(text: string): string {
  const raw = text.trim();
  try {
    const url = new URL(raw);
    const fromQuery = url.searchParams.get("certificateNumber");
    if (fromQuery) return fromQuery;
    const match = url.pathname.match(/\/certificates\/verify\/(.+)$/);
    if (match) return decodeURIComponent(match[1]);
  } catch {
    /* not a URL */
  }
  return raw;
}

/** Decode a QR from a drawable source with jsQR, scaled down for speed. */
function decodeWithJsQR(
  source: CanvasImageSource,
  width: number,
  height: number,
  canvas: HTMLCanvasElement,
): string | null {
  const scale = Math.min(1, 720 / Math.max(width, height));
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  return jsQR(data, canvas.width, canvas.height)?.data ?? null;
}

function cameraError(err: unknown): string {
  const name = (err as { name?: string })?.name;
  if (name === "NotAllowedError")
    return "Camera access was blocked. Allow it in your browser settings, or upload a photo of the QR code instead.";
  if (name === "NotFoundError" || name === "OverconstrainedError")
    return "No camera was found on this device. Upload a photo of the QR code instead.";
  if (!window.isSecureContext)
    return "The camera only works on a secure (https) page. Upload a photo of the QR code instead.";
  return "The camera couldn't be started. Upload a photo of the QR code instead.";
}

interface QrScanModalProps {
  onClose: () => void;
  /** Called once with the certificate number read from the QR code. */
  onResult: (certificateNumber: string) => void;
}

/**
 * Scans a certificate's QR code with the camera — or from an uploaded photo
 * when there's no camera or access is refused. Render it only while open.
 */
export default function QrScanModal({ onClose, onResult }: QrScanModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const doneRef = useRef(false);
  const [status, setStatus] = useState<"starting" | "scanning" | "error">(
    "starting",
  );
  const [message, setMessage] = useState("");

  const finish = (text: string) => {
    if (doneRef.current) return;
    const number = certificateNumberFrom(text);
    if (!number) return;
    doneRef.current = true;
    onResult(number);
  };

  // Start the camera and read frames until a QR code turns up.
  useEffect(() => {
    let cancelled = false;
    let frame = 0;
    let stream: MediaStream | null = null;
    const detector = nativeDetector();
    const canvas = (canvasRef.current ??= document.createElement("canvas"));

    const tick = async () => {
      const video = videoRef.current;
      if (cancelled || doneRef.current || !video) return;
      if (video.readyState >= 2 && video.videoWidth) {
        try {
          const text = detector
            ? ((await detector.detect(video))[0]?.rawValue ?? null)
            : decodeWithJsQR(
                video,
                video.videoWidth,
                video.videoHeight,
                canvas,
              );
          if (text) return finish(text);
        } catch {
          /* a bad frame — try the next one */
        }
      }
      frame = requestAnimationFrame(tick);
    };

    (async () => {
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus("error");
        setMessage(cameraError(null));
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });
        if (cancelled) return;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = stream;
        await video.play();
        setStatus("scanning");
        frame = requestAnimationFrame(tick);
      } catch (err) {
        if (cancelled) return;
        setStatus("error");
        setMessage(cameraError(err));
      }
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      stream?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Esc closes; the page behind doesn't scroll while open.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const onPhoto = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = (canvasRef.current ??= document.createElement("canvas"));
      const text = decodeWithJsQR(
        img,
        img.naturalWidth,
        img.naturalHeight,
        canvas,
      );
      URL.revokeObjectURL(url);
      if (text) finish(text);
      else {
        setStatus((s) => (s === "scanning" ? s : "error"));
        setMessage(
          "No QR code was found in that photo. Try a clearer, closer shot.",
        );
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setMessage("That file couldn't be read as an image.");
    };
    img.src = url;
  };

  return createPortal(
    <div
      className="qrs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qrs-title"
    >
      <div className="qrs__backdrop" onClick={onClose} />
      <div className="qrs__panel">
        <header className="qrs__head">
          <span className="qrs__icon">
            <ScanQrCode size={18} />
          </span>
          <div>
            <h2 id="qrs-title">Scan certificate QR code</h2>
            <p>Point your camera at the QR code printed on the certificate.</p>
          </div>
          <button
            type="button"
            className="qrs__close"
            onClick={onClose}
            aria-label="Close scanner"
          >
            <X size={18} />
          </button>
        </header>

        <div className={`qrs__view qrs__view--${status}`}>
          <video ref={videoRef} playsInline muted />
          {status !== "error" && (
            <span className="qrs__frame" aria-hidden="true" />
          )}
          {status === "scanning" && (
            <span className="qrs__beam" aria-hidden="true" />
          )}
          {status === "starting" && (
            <span className="qrs__note">Starting camera…</span>
          )}
          {status === "error" && (
            <span className="qrs__note qrs__note--error">{message}</span>
          )}
        </div>

        {status === "scanning" && message && (
          <p className="qrs__hint qrs__hint--error">{message}</p>
        )}

        <label className="qrs__upload">
          <ImageUp size={16} />
          Upload a photo of the QR code
          <input type="file" accept="image/*" onChange={onPhoto} hidden />
        </label>
      </div>
    </div>,
    document.body,
  );
}
