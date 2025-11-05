/**
 * Custom error handler for suppressing S3 403 errors
 * This prevents console spam when S3 images fail to load
 */

// Suppress upstream image errors globally
if (typeof window === 'undefined') {
  const originalConsoleError = console.error;
  
  console.error = (...args) => {
    // Convert all arguments to a searchable string
    const errorString = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg?.message) return arg.message;
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    // Check if this is an upstream image error
    const isImageError = 
      errorString.includes('upstream image response failed') ||
      errorString.includes('upstream response is invalid') ||
      errorString.includes('statusCode: 403') ||
      errorString.includes('"url" parameter is valid but upstream response is invalid') ||
      errorString.includes('monsbah-s3-shared-bucket.s3.me-south-1.amazonaws.com') ||
      (errorString.includes('Error:') && errorString.includes('403'));
    
    // Completely suppress all image errors (even in development)
    // These are known S3 permission issues that don't affect functionality
    if (!isImageError) {
      originalConsoleError.apply(console, args);
    }
    // Optionally log to a file or monitoring service instead
    // else {
    //   // Log to your monitoring service here
    // }
  };
}

export {};
