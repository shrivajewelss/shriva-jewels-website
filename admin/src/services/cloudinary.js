/**
 * Cloudinary image management service.
 * Follows strict security rules:
 * - API secret is NEVER exposed to client.
 * - Client uses cloud_name + upload preset or server-signed endpoint.
 * - Generates auto-format (f_auto) and auto-quality (q_auto) responsive URLs.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "shriva_jewels";

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && CLOUD_NAME !== "your-cloudinary-cloud-name");

/**
 * Generate optimized Cloudinary delivery URL with automatic format and compression.
 */
export function getOptimizedImageUrl(publicIdOrUrl, { width = 800, height = null, crop = "limit" } = {}) {
  if (!publicIdOrUrl) return "/images/products/p02.jpg";

  // If already an absolute URL not on Cloudinary, return as is
  if (publicIdOrUrl.startsWith("http") && !publicIdOrUrl.includes("res.cloudinary.com")) {
    return publicIdOrUrl;
  }

  // If already a full Cloudinary URL, inject transformations
  if (publicIdOrUrl.includes("res.cloudinary.com")) {
    const parts = publicIdOrUrl.split("/upload/");
    if (parts.length === 2) {
      const transform = `f_auto,q_auto,w_${width}${height ? `,h_${height}` : ""},c_${crop}`;
      return `${parts[0]}/upload/${transform}/${parts[1]}`;
    }
    return publicIdOrUrl;
  }

  if (!isCloudinaryConfigured) {
    return publicIdOrUrl.startsWith("/") ? publicIdOrUrl : `/${publicIdOrUrl}`;
  }

  const transform = `f_auto,q_auto,w_${width}${height ? `,h_${height}` : ""},c_${crop}`;
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transform}/${publicIdOrUrl}`;
}

/**
 * Generate small thumbnail URL for admin tables & storefront galleries
 */
export function getThumbnailUrl(publicIdOrUrl) {
  return getOptimizedImageUrl(publicIdOrUrl, { width: 160, height: 213, crop: "fill" });
}

/**
 * Upload an image file to Cloudinary.
 * If credentials are not configured, provides a clean warning and local preview fallback.
 */
export async function uploadProductImage(file) {
  if (!isCloudinaryConfigured) {
    // Graceful local preview mode until real Cloudinary credentials are provided
    const localUrl = URL.createObjectURL(file);
    return {
      public_id: `local_${Date.now()}`,
      secure_url: localUrl,
      width: 800,
      height: 1067,
      format: file.type.split("/")[1] || "jpg",
      bytes: file.size ?? null,
      isLocalFallback: true,
      notice: "Cloudinary credentials not yet configured in .env. Stored as local preview.",
    };
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error?.message || `Upload failed with status ${res.status}`);
    }

    const data = await res.json();
    return {
      public_id: data.public_id,
      secure_url: data.secure_url,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes ?? file.size ?? null,
      isLocalFallback: false,
    };
  } catch (err) {
    throw new Error(`Cloudinary upload error: ${err.message}`);
  }
}
