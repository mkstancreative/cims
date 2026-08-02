type FooterProps = {
  year?: number;
};

export default function Footer({
  year = new Date().getFullYear(),
}: FooterProps) {
  const appName = import.meta.env.VITE_APP_NAME;
  return (
    <footer className="dash-footer">
      <p className="dash-footer__copy">
        &copy; {year} <span>{appName}</span>. All rights reserved.
      </p>
    </footer>
  );
}
