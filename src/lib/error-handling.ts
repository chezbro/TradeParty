// Create a new error handling utility
export const captureError = (error: Error, context?: Record<string, any>) => {
  console.error('Error:', error, context);
  
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    return;
  }

  // In production, you can add error reporting service
  // TODO: Add your preferred error reporting service here
}; 