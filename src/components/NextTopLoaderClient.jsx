"use client";
import NextTopLoader from "nextjs-toploader";

export default function NextTopLoaderClient() {
  return (
    <NextTopLoader
      color="#ffd902"
      initialPosition={0.08}
      crawlSpeed={10}
      height={3}
      crawl={true}
      showSpinner={false}
      easing="ease"
      speed={100}
      shadow="0 0 10px #1abc9c,0 0 5px #1abc9c"
    />
  );
}
