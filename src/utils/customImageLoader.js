/**
 * Custom Next.js Image Loader with 403 error handling
 * This loader attempts to load images and falls back gracefully on errors
 */

export default function customImageLoader({ src, width, quality }) {
  // If the image is from S3 and likely to fail, return a placeholder
  // This prevents Next.js from trying to optimize failed images
  if (src.includes('monsbah-s3-shared-bucket.s3.me-south-1.amazonaws.com')) {
    // Check if we're in browser and have cached this as a failed image
    if (typeof window !== 'undefined') {
      const failedImages = JSON.parse(sessionStorage.getItem('failedImages') || '[]');
      if (failedImages.includes(src)) {
        return '/banner.png';
      }
    }
  }
  
  // For external URLs, return as-is (Next.js will handle optimization)
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // For local images, use Next.js default behavior
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality || 75}`;
}
