import { useState } from "react";
import { Upload, X, Star, ArrowLeft, ArrowRight } from "lucide-react";
import { uploadProductImage } from "../services/cloudinary.js";

export default function ImageUploader({ images = [], onChange, maxImages = 5 }) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (images.length + files.length > maxImages) {
      setError(`Maximum ${maxImages} images permitted per product.`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const uploadedUrls = [];
      for (const file of files) {
        const res = await uploadProductImage(file);
        uploadedUrls.push(res.secure_url);
      }
      onChange([...images, ...uploadedUrls].slice(0, maxImages));
    } catch (err) {
      setError(err.message || "Failed to upload image.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    const url = prompt("Enter image URL (e.g. /images/products/p01.jpg or https://...):");
    if (url && url.trim()) {
      if (images.length >= maxImages) {
        setError(`Maximum ${maxImages} images permitted.`);
        return;
      }
      onChange([...images, url.trim()]);
    }
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, idx) => idx !== index);
    onChange(updated);
  };

  const handleSetMain = (index) => {
    if (index === 0) return;
    const selected = images[index];
    const rest = images.filter((_, idx) => idx !== index);
    onChange([selected, ...rest]);
  };

  const handleMove = (index, direction) => {
    const targetIdx = index + direction;
    if (targetIdx < 0 || targetIdx >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-medium text-muted uppercase tracking-wider">
          Product Images ({images.length}/{maxImages})
        </label>
        <button
          type="button"
          onClick={handleAddUrl}
          className="text-xs text-maroon hover:underline font-medium"
        >
          + Add Image via URL
        </button>
      </div>

      {/* Grid of uploaded images */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {images.map((url, idx) => {
          const isMain = idx === 0;
          return (
            <div
              key={idx}
              className={`group relative aspect-[3/4] overflow-hidden rounded-lg border-2 bg-sand ${
                isMain ? "border-maroon shadow-md" : "border-line"
              }`}
            >
              <img
                src={url.startsWith("http") || url.startsWith("/") ? url : `/${url}`}
                alt={`Product thumbnail ${idx + 1}`}
                className="h-full w-full object-cover"
              />

              {/* Main Image Badge */}
              {isMain && (
                <div className="absolute top-1.5 left-1.5 rounded bg-maroon px-1.5 py-0.5 text-[9px] font-semibold text-cream uppercase tracking-wider shadow">
                  Main
                </div>
              )}

              {/* Action Toolbar Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between p-1.5 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center">
                  {!isMain ? (
                    <button
                      type="button"
                      onClick={() => handleSetMain(idx)}
                      title="Set as main image"
                      className="rounded bg-white/90 p-1 text-ink hover:text-maroon shadow-sm"
                    >
                      <Star size={12} />
                    </button>
                  ) : <div />}
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    title="Remove image"
                    className="rounded bg-red-600/90 p-1 text-white hover:bg-red-700 shadow-sm"
                  >
                    <X size={12} />
                  </button>
                </div>

                <div className="flex justify-center gap-2">
                  {idx > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      title="Move left"
                      className="rounded bg-white/90 p-1 text-ink hover:text-maroon shadow-sm"
                    >
                      <ArrowLeft size={12} />
                    </button>
                  )}
                  {idx < images.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      title="Move right"
                      className="rounded bg-white/90 p-1 text-ink hover:text-maroon shadow-sm"
                    >
                      <ArrowRight size={12} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Upload Slot */}
        {images.length < maxImages && (
          <label className="relative flex aspect-[3/4] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-line bg-cream/60 hover:border-maroon hover:bg-sand/30 transition-colors p-2 text-center">
            <Upload size={20} className="text-muted mb-1" />
            <span className="text-xs font-medium text-ink">Upload Photo</span>
            <span className="text-[10px] text-muted mt-0.5">JPG, PNG, WebP</span>
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploading}
              onChange={handleFileChange}
              className="sr-only"
            />
          </label>
        )}
      </div>

      {uploading && (
        <p className="text-xs text-maroon flex items-center gap-1.5 animate-pulse">
          <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-maroon border-t-transparent" />
          Uploading image to storage...
        </p>
      )}

      {error && <p className="text-xs text-red-700">{error}</p>}
    </div>
  );
}
