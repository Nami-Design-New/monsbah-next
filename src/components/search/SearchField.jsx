"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "use-intl";

export default function SearchField() {
  const t = useTranslations();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQuery = searchParams.get("search") || "";
  const [search, setSearch] = useState(initialQuery);

  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    if (search) {
      params.set("search", search);
    } else {
      params.delete("search");
    }

    router.push(`?${params.toString()}`);
  };

  return (
    <form className="search_header" onSubmit={handleSubmit}>
      <input
        type="search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder={t("searchPlaceholder")}
      />
      <button aria-label="Search">
        <i className="fa-regular fa-magnifying-glass"></i>
      </button>
    </form>
  );
}
