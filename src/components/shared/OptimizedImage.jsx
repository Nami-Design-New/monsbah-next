"use client";

import Image from "next/image";
import { sanitizeImageUrl } from "@/utils/imageOptimization";

/**
 * Optimized Image Component with CDN support
 * - Ensures HTTPS URLs
 * - Lazy loading by default
 * - Optimized for Cloudflare CDN
 * - WebP/AVIF format support
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill,
  priority = false,
  quality = 85,
  sizes,
  className,
  style,
  fallback = "/banner.webp",
  ...props
}) {
  // Sanitize image URL to ensure HTTPS and valid format
  const safeSrc = sanitizeImageUrl(src, fallback);

  // Common props for Next.js Image
  const imageProps = {
    src: safeSrc,
    alt: alt || "Image",
    quality,
    // Lazy loading unless priority is set
    loading: priority ? "eager" : "lazy",
    // Enable placeholder blur for better UX
    placeholder: "blur",
    blurDataURL: "data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",
    className,
    style,
    ...props,
  };

  if (fill) {
    return (
      <Image
        {...imageProps}
        fill
        sizes={sizes || "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"}
      />
    );
  }

  return (
    <Image
      {...imageProps}
      width={width}
      height={height}
      sizes={sizes}
    />
  );
}
