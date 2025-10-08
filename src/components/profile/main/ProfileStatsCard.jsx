import { Link } from "@/i18n/navigation";

export default function ProfileStatsCard({ href, count, label, ariaLabel }) {
  return (
    <Link
      aria-label={ariaLabel || label}
      href={href}
      className="col-lg-3 col-md-6 col-6 p-2"
    >
      <div className="Box_rate">
        <h2>{count}</h2>
        <div className="icon_rate">
          <p>{label}</p>
        </div>
      </div>
    </Link>
  );
}
