"use client";

import { useEffect, useRef } from "react";
import PersonCard from "../shared/cards/PersonCard";
import PersonLoader from "../shared/loaders/PersonLoader";
import { useGetFollowings } from "@/hooks/queries/follow/useGetFollowings";

export default function FollowingList({ userId }) {
  const sectionRef = useRef();
  const {
    data: followers,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetFollowings(userId);
  const allFollowers =
    followers?.pages?.flatMap((page) => page?.data?.data) ?? [];

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
    <section className="row" ref={sectionRef}>
      {allFollowers?.map((person) => (
        <div className="col-lg-4 col-md-6 col-12 p-2" key={person.id}>
          <PersonCard person={person} />
        </div>
      ))}{" "}
      {(isLoading || isFetchingNextPage) && (
        <>
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <div className="col-lg-4 col-md-6 col-12 p-2" key={index}>
                <PersonLoader />
              </div>
            ))}
        </>
      )}
    </section>
  );
}
