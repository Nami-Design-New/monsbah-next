"use client";
import { useEffect, useState } from "react";

function BackToTop() {
  const circleRadius = 49;
  const circumference = 2 * Math.PI * circleRadius;

  const [dashOffset, setDashOffset] = useState(circumference);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const documentHeight = document.documentElement.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollableHeight = documentHeight - windowHeight;

      const scrollPercentage = scrollTop / scrollableHeight;
      const newDashOffset = circumference - circumference * scrollPercentage;
      setDashOffset(newDashOffset);

      // Show after scrolling down 500px
      setVisible(scrollTop > 500);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [circumference]);

  return (
    <div
      className={`back-to-top ${visible ? "active-progress" : ""}`}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <svg
        className={`svg-content ${visible ? "progress-circle" : ""}`}
        width="100%"
        height="100%"
        viewBox="-1 -1 102 102"
        fill="#fff"
      >
        <path
          d="M50,1 a49,49 0 0,1 0,98 a49,49 0 0,1 0,-98"
          style={{
            transition: "stroke-dashoffset 300ms ease-in-out",
            strokeDasharray: `${circumference}, ${circumference}`,
            strokeDashoffset: dashOffset,
          }}
        ></path>
      </svg>
    </div>
  );
}

export default BackToTop;
