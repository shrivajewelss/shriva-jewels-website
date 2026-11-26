/**
 * Resolve product/category image URLs strictly from database `image_url` values.
 * External URLs (e.g. Cloudinary) are returned as-is; relative paths resolve locally.
 */
export function resolveImageUrl(image) {
  if (!image) return "";
  if (
    image.startsWith("http://") ||
    image.startsWith("https://") ||
    image.startsWith("data:") ||
    image.startsWith("blob:")
  ) {
    return image;
  }
  return image.startsWith("/") ? image : `/${image}`;
}

export function resolveFallbackImageUrl(image) {
  return resolveImageUrl(image);
}
