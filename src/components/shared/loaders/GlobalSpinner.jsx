"use client";

export default function GlobalSpinner() {
  return (
    <div className="global-spinner-overlay">
      <div className="global-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    </div>
  );
}
