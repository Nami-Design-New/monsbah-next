// Optimized image sizes for product cards
// Based on actual display dimensions to reduce image payload

export const PRODUCT_CARD_SIZES = {
  // For product grid (desktop: ~180px, tablet: ~200px, mobile: 100vw)
  grid: '(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 180px',
  
  // For product list (desktop: ~250px, tablet: ~200px, mobile: 100vw)  
  list: '(max-width: 640px) 100vw, (max-width: 1024px) 40vw, 250px',
  
  // For hero slider (full width)
  hero: '100vw',
  
  // For category icons (small, fixed size)
  categoryIcon: '96px',
  
  // For product detail page (large)
  productDetail: '(max-width: 640px) 100vw, (max-width: 1024px) 60vw, 600px',
};

export const IMAGE_QUALITY = {
  thumbnail: 75,
  card: 80,
  hero: 85,
  detail: 90,
};
