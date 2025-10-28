"use client";

import useGetSettings from "@/hooks/queries/settings/useGetSettings";

export default function HomeSettingsHeader() {
  const { data, isLoading, error } = useGetSettings();

  if (isLoading || error || !data) {
    return null;
  }

  const { name, meta_title: metaTitle } = data;

  if (!metaTitle && !name) {
    return null;
  }

  return (
    <section className="home_settings_header">
      <div className="container py-3 text-center">
        {metaTitle && <h1 className="fs-2 fw-bold mb-1">{metaTitle}</h1>}
        {name && <p className="text-muted mb-0">{name}</p>}
      </div>
    </section>
  );
}

