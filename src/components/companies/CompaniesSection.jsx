"use client";

import { useRef, useEffect } from "react";
import CompanyCard from "../shared/cards/CompanyCard";
import CompanyLoader from "@/components/shared/loaders/CompanyLoader";
import useGetCompanies from "@/hooks/queries/companies/useGetCompanies";
import Pagination from "@/components/shared/Pagination";

export default function CompaniesSection() {
  const sectionRef = useRef(null);

  const {
    data: companies,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    currentPage,
    lastPage,
  } = useGetCompanies();

  // Flatten and deduplicate companies by ID
  const allCompanies = companies?.pages?.flatMap((page) => page?.data?.data) ?? [];
  const uniqueCompanies = Array.from(
    new Map(allCompanies.map((company) => [company?.id, company])).values()
  );

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current) return;
      const sectionBottom = sectionRef.current.getBoundingClientRect().bottom;
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

  // Show skeleton loaders when filtering or on initial load (not during pagination)
  const isFilteringOrLoading = isFetching && !isFetchingNextPage;

  return (
    <>
      <section className="companies_section" ref={sectionRef}>
        <div className="container p-1">
          <div className="row">
            {!isFilteringOrLoading && uniqueCompanies.map((company) => (
              <div className="col-lg-4 col-md-6 col-12 p-2" key={company?.id}>
                <CompanyCard company={company} />
              </div>
            ))}

            {isFilteringOrLoading &&
              Array(6)
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
          {lastPage > 1 && (
            <Pagination currentPage={currentPage} totalPages={lastPage} />
          )}
        </div>
      </section>
    </>
  );
}
