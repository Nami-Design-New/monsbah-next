"use client";

import { Link } from "@/i18n/navigation";
import { isValidVideoExtension } from "@/utils/helpers";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ImageLoad from "../loaders/ImageLoad";
import SafeImage from "../SafeImage";

function ProductCard({ product }) {
  const t = useTranslations();
  const router = useRouter();
  const [isImageLoaded] = useState(true);

  const handleCardClick = () => {
    router.push(`/product/${product?.slug}-id=${product?.id}`);
  };

  return (
    <Link
      role="link"
      aria-label={`View product: ${product.name}`}
      tabIndex={0}
     href={`/product/${product?.slug}-id=${product?.id}`}
      onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
      className="product_vertical cursor-pointer outline-none   "
    >
      <div className="img  position-relative ">
        {isValidVideoExtension(product?.image) ? (
          <video
            src={product.image}
            autoPlay
            loop
            muted
            playsInline
          />
        ) : (
          <>
            {/* Use SafeImage component with automatic fallback */}
            <SafeImage
              src={product.image}
              alt={product.alt || product.name}
              fallbackSrc="/banner.png"
              style={{ 
                width: '100%', 
                height: '100%', 
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0
              }}
              loading="lazy"
            />
          </>
        )}

        <ImageLoad isImageLoaded={isImageLoaded} />

        <div className="thums_pro">
          <span className="type">{t(`${product?.type}`)}</span>
          {product?.is_popular ? (
            <span className="popular">
             {t("popular")}
            </span>
          ) : (
            <></>
          )}
        </div>
      </div>

      <div className="content">
        <div className="title">
          <h3>{product.name}</h3>
        </div>

        <h3 className="price">
          <span>{product?.price}</span> {product?.currency?.name}
        </h3>

        <ul>
          <li className="w-100">
            <i className="fa-light fa-location-dot" aria-hidden="true" />{" "}
            {product.country?.name}
          </li>

          <li style={{ flex: 1 }}>
            <Link
              href="/profile"
              aria-label={`Go to ${product.user?.username}'s profile`}
              onClick={(e) => e.stopPropagation()} // Prevent card navigation
            >
              <i className="fa-light fa-user" aria-hidden="true" />{" "}
              {product.user?.username}
            </Link>
          </li>

          <li>
            <i className="fa-light fa-clock" aria-hidden="true" />{" "}
            {product.date}
          </li>
        </ul>
      </div>
    </Link>
  );
}

export default ProductCard;
