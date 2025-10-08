"use client";
import useGetCompanies from "@/hooks/queries/companies/useGetCompanies";
import React, { useEffect, useRef } from "react";
import CompanyCard from "../shared/cards/CompanyCard";
import CompanyLoader from "../shared/loaders/CompanyLoader";

export default function CompaniesList() {
  const sectionRef = useRef();
  const {
    data: companies,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetCompanies();

  const allCompanies =
    companies?.pages?.flatMap((page) => page?.data?.data) ?? [];

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const section = sectionRef.current;
      const sectionBottom = section.getBoundingClientRect().bottom;
      const viewportHeight = window.innerHeight;

      if (
        sectionBottom <= viewportHeight + 200 &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);
  return (
    <div className="row" ref={sectionRef}>
      {allCompanies?.map((company) => (
        <div className="col-lg-4 col-md-6 col-12 p-2" key={company?.id}>
          <CompanyCard company={company} />
        </div>
      ))}
      {(isLoading || isFetchingNextPage) && (
        <>
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div
                className="col-lg-4 col-md-6 col-12 p-2"
                key={`loader-${index}`}
              >
                <CompanyLoader />
              </div>
            ))}
        </>
      )}
    </div>
  );
}
