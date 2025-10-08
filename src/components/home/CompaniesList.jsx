"use client";

import { useRef, useEffect } from "react";
import CompanyLoader from "@/components/shared/loaders/CompanyLoader";
import CompanyCard from "../shared/cards/CompanyCard";
import useGetCompanies from "@/hooks/queries/companies/useGetCompanies";

export default function CompaniesList() {
  const sectionRef = useRef(null);

  const {
    data: companiesData,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
  } = useGetCompanies();

  const allCompanies =
    companiesData?.pages?.flatMap((page) => page?.data?.data) ?? [];

  useEffect(() => {
    const handleScroll = () => {
      const section = sectionRef.current;
      if (!section) return;

      const sectionBottom = section.getBoundingClientRect().bottom;
      const viewportHeight = window.innerHeight;

      if (sectionBottom <= viewportHeight + 200) {
        if (hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <section className="companies_section" ref={sectionRef}>
      <div className="container p-1">
        <div className="row">
          {allCompanies.map((company) => (
            <div className="col-lg-4 col-md-6 col-12 p-2" key={company?.id}>
              <CompanyCard company={company} />
            </div>
          ))}
          {(isLoading || isFetchingNextPage) &&
            Array(3)
              .fill(0)
              .map((_, index) => (
                <div
                  className="col-lg-4 col-md-6 col-12 p-2"
                  key={`loader-${index}`}
                >
                  <CompanyLoader />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
}
