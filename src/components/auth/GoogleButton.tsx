import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GIS_SRC = "https://accounts.google.com/gsi/client";

/**
 * Real Google sign-in only runs once a client ID is configured. Until then the
 * button is a placeholder that explains it isn't available yet.
 */
export const isGoogleEnabled = Boolean(CLIENT_ID);

// Minimal typing for the parts of Google Identity Services we use.
interface GoogleIdApi {
  initialize: (config: {
    client_id: string;
    callback: (response: { credential: string }) => void;
    ux_mode?: "popup" | "redirect";
    auto_select?: boolean;
  }) => void;
  renderButton: (parent: HTMLElement, options: Record<string, unknown>) => void;
}

declare global {
  interface Window {
    google?: { accounts: { id: GoogleIdApi } };
  }
}

let gisPromise: Promise<GoogleIdApi> | null = null;

/** Loads the Google Identity Services script once per page. */
function loadGis(): Promise<GoogleIdApi> {
  if (window.google?.accounts?.id) {
    return Promise.resolve(window.google.accounts.id);
  }
  if (!gisPromise) {
    gisPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GIS_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () =>
        window.google?.accounts?.id
          ? resolve(window.google.accounts.id)
          : reject(new Error("Google Identity Services did not load"));
      script.onerror = () => {
        gisPromise = null; // let a later mount retry
        reject(new Error("Google Identity Services did not load"));
      };
      document.head.appendChild(script);
    });
  }
  return gisPromise;
}

/** The fields Google puts in the ID token that registration can prefill. */
export interface GoogleProfile {
  email: string;
  firstName: string;
  lastName: string;
}

/**
 * Reads the profile out of a Google ID token for prefilling a form. This does
 * NOT verify the token — anything trusted must be checked by the server.
 */
export function readGoogleProfile(idToken: string): GoogleProfile | null {
  try {
    const payload = idToken.split(".")[1];
    const json = decodeURIComponent(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        .split("")
        .map((c) => `%${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    const claims = JSON.parse(json) as {
      email?: string;
      given_name?: string;
      family_name?: string;
    };
    return {
      email: claims.email ?? "",
      firstName: claims.given_name ?? "",
      lastName: claims.family_name ?? "",
    };
  } catch {
    return null;
  }
}

interface GoogleButtonProps {
  onCredential: (idToken: string) => void;
  disabled?: boolean;
  /** Draws an "OR" divider on this side of the button. */
  divider?: "before" | "after";
  dividerLabel?: string;
  /** Shown when the button is clicked before Google sign-in is set up. */
  unavailableMessage?: string;
}

/** Google's four-colour "G". */
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

/**
 * "Continue with Google". With a client ID it is Google's own button (sized to
 * its container); without one — or if Google's script can't load — it is a
 * look-alike placeholder that tells the user it isn't available yet.
 */
export default function GoogleButton({
  onCredential,
  disabled,
  divider,
  dividerLabel = "or",
  unavailableMessage = "Google sign-in is coming soon. Please use your email and password for now.",
}: GoogleButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onCredentialRef = useRef(onCredential);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    onCredentialRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGis()
      .then((gis) => {
        const el = containerRef.current;
        if (cancelled || !el) return;
        gis.initialize({
          client_id: CLIENT_ID,
          callback: ({ credential }) => onCredentialRef.current(credential),
          ux_mode: "popup",
          auto_select: false,
        });
        gis.renderButton(el, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "center",
          // Google caps the button at 400px.
          width: Math.min(400, Math.floor(el.offsetWidth)),
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const useRealButton = isGoogleEnabled && !failed;

  const line = (
    <div className="auth-divider" role="separator">
      <span>{dividerLabel}</span>
    </div>
  );

  return (
    <>
      {divider === "before" && line}
      {useRealButton ? (
        <div
          ref={containerRef}
          className={`auth-google${disabled ? " is-disabled" : ""}`}
          aria-busy={disabled}
        />
      ) : (
        <button
          type="button"
          className="auth-google-btn"
          disabled={disabled}
          onClick={() =>
            toast.info(unavailableMessage, { toastId: "google-unavailable" })
          }
        >
          <GoogleLogo />
          Continue with Google
        </button>
      )}
      {divider === "after" && line}
    </>
  );
}
