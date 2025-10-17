/**
 * Custom image loader for static export
 * Handles images for AWS S3 deployment
 */

export default function imageLoader({ src, width, quality }) {
  // For static export, just return the src as-is
  // This prevents Next.js from trying to optimize images
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }
  
  // For local images, ensure they work with static export
  if (src.startsWith('/')) {
    return src;
  }
  
  return `/${src}`;
}