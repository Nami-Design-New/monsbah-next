/**
 * Ensure URL uses HTTPS protocol
 * Fixes mixed content issues for CDN compatibility
 * 
 * @param {string} url - The URL to sanitize
 * @returns {string} - HTTPS URL
 */
export function ensureHttps(url) {
  if (!url || typeof url !== 'string') {
    return url;
  }

  // Already HTTPS
  if (url.startsWith('https://')) {
    return url;
  }

  // Convert HTTP to HTTPS
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://');
  }

  // Relative or protocol-relative URL
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  // Already a relative path
  return url;
}

/**
 * Sanitize image URL for Next.js Image component
 * Ensures HTTPS and validates image extension
 * 
 * @param {string} src - Image source URL
 * @param {string} fallback - Fallback image path
 * @returns {string} - Sanitized image URL
 */
export function sanitizeImageUrl(src, fallback = '/banner.webp') {
  if (!src || typeof src !== 'string') {
    return fallback;
  }

  const trimmedSrc = src.trim();
  
  // Check if it's a valid image extension
  const validExtensions = /\.(jpg|jpeg|png|webp|avif|gif|svg)(\?|$)/i;
  if (!validExtensions.test(trimmedSrc)) {
    return fallback;
  }

  // Ensure HTTPS
  return ensureHttps(trimmedSrc);
}

/**
 * Optimize image URL parameters for CDN
 * 
 * @param {string} url - Image URL
 * @param {Object} _options - Optimization options (reserved for future use)
 * @returns {string} - Optimized URL
 */
export function optimizeImageUrl(url, _options = {}) {
  let optimizedUrl = ensureHttps(url);

  // If it's an external URL, return as is (Next.js will optimize it)
  if (typeof window !== 'undefined' && 
      optimizedUrl.startsWith('https://') && 
      !optimizedUrl.includes(window.location.hostname)) {
    return optimizedUrl;
  }

  return optimizedUrl;
}

/**
 * Preload critical images for faster LCP
 * 
 * @param {Array<string>} imageUrls - Array of image URLs to preload
 */
export function preloadImages(imageUrls) {
  if (typeof window === 'undefined') return;

  imageUrls.forEach(url => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = ensureHttps(url);
    link.type = 'image/webp';
    document.head.appendChild(link);
  });
}

/**
 * Check if image URL is from CDN
 * 
 * @param {string} url - Image URL
 * @returns {boolean} - True if from CDN
 */
export function isFromCDN(url) {
  if (!url) return false;
  
  const cdnDomains = [
    'cloudflare',
    'amazonaws.com',
    'digitaloceanspaces.com',
    'cdn.',
  ];

  return cdnDomains.some(domain => url.includes(domain));
}
