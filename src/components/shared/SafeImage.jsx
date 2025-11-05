"use client";

import { useState } from "react";

/**
 * SafeImage component with fallback for failed S3 images
 * @param {Object} props - Component props
 * @param {string} props.src - Image source URL
 * @param {string} props.alt - Image alt text
 * @param {string} props.fallbackSrc - Fallback image (default: /banner.png)
 * @param {Object} props.style - Custom styles
 * @param {string} props.className - CSS classes
 * @param {string} props.loading - Loading strategy (lazy/eager)
 * @returns {JSX.Element}
 */
export default function SafeImage({
  src,
  alt = "",
  fallbackSrc = "/banner.png",
  style = {},
  className = "",
  loading = "lazy",
  ...props
}) {
  const [imageError, setImageError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  const handleImageError = (e) => {
    if (!imageError) {
      // Cache failed image URL to prevent retries
      if (typeof window !== 'undefined' && src) {
        try {
          const failedImages = JSON.parse(sessionStorage.getItem('failedImages') || '[]');
          if (!failedImages.includes(src)) {
            failedImages.push(src);
            // Keep only last 100 failed images to prevent memory issues
            if (failedImages.length > 100) {
              failedImages.shift();
            }
            sessionStorage.setItem('failedImages', JSON.stringify(failedImages));
          }
        } catch {
          // Ignore sessionStorage errors
        }
      }
      
      setImageError(true);
      setCurrentSrc(fallbackSrc);
      // Prevent infinite error loop
      e.target.onerror = null;
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      style={style}
      className={className}
      loading={loading}
      onError={handleImageError}
      {...props}
    />
  );
}
