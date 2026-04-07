// Upload images to Cloudinary
export async function uploadImagesToCloudinary(files) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(`Upload failed for ${file.name}`);
    }

    const data = await response.json();

    return {
      url: data.secure_url,
      publicId: data.public_id, // 🔥 المهم
    };
  });

  return await Promise.all(uploadPromises);
}

// Extract public_id from a Cloudinary image URL
function extractPublicIdFromUrl(url) {
  if (!url || typeof url !== "string") return null;
  // With version: .../v1234567890/folder/name.jpg
  let match = url.match(/\/v\d+\/(.+)\.\w+$/);
  if (match) return match[1];
  // Without version: .../image/upload/folder/name.jpg or .../image/upload/transform/folder/name.jpg
  match = url.match(/\/image\/upload\/(.+)\.\w+$/);
  if (match) {
    const path = match[1];
    const parts = path.split("/");
    // Remove transformation prefix (e.g. w_100,h_100,c_fill) if present
    if (parts[0]?.includes(",")) {
      return parts.slice(1).join("/");
    }
    return path;
  }
  return null;
}

/**
 * Delete images from Cloudinary by providing an array of image URLs.
 * MUST be called from the server (API route, Server Action) - uses CLOUDINARY_API_SECRET.
 *
 * @param {string[]} imageUrls - Array of Cloudinary image URLs to delete
 * @returns {Promise<{deleted: string[], failed: {publicId: string, error: string}[]}>}
 */
export async function deleteImagesFromCloudinary(imageUrls) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error(
      "Cloudinary API credentials not configured. deleteImagesFromCloudinary must run on the server with CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.",
    );
  }

  const urls = Array.isArray(imageUrls) ? imageUrls : [imageUrls];
  const publicIds = urls.map(extractPublicIdFromUrl).filter(Boolean);

  if (publicIds.length === 0) {
    return { deleted: [], failed: [] };
  }

  const { createHmac } = await import("node:crypto");

  const results = await Promise.allSettled(
    publicIds.map(async (publicId) => {
      const timestamp = Math.round(Date.now() / 1000);
      const paramsToSign = { public_id: publicId, timestamp };
      const sortedParams = Object.keys(paramsToSign)
        .sort()
        .map((k) => `${k}=${paramsToSign[k]}`)
        .join("&");
      const signature = createHmac("sha1", apiSecret)
        .update(sortedParams)
        .digest("hex");

      const body = new URLSearchParams({
        public_id: publicId,
        timestamp: String(timestamp),
        api_key: apiKey,
        signature,
      });

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`,
        {
          method: "POST",
          body: body.toString(),
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        },
      );

      if (!response.ok) {
        const err = await response.text();
        throw new Error(`Delete failed for ${publicId}: ${err}`);
      }

      return publicId;
    }),
  );

  const deleted = [];
  const failed = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      deleted.push(result.value);
    } else {
      failed.push({
        publicId: publicIds[i],
        error: result.reason?.message ?? "Unknown error",
      });
    }
  });

  return { deleted, failed };
}
