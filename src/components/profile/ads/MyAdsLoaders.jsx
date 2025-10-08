import ProductLoader from "@/components/shared/loaders/ProductLoader";

export default function MyAdsLoaders({ count = 2 }) {
  return (
    <>
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div className="col-lg-6 col-12 p-2" key={`loader-${index}`}>
            <ProductLoader className="my-ad" />
          </div>
        ))}
    </>
  );
}
