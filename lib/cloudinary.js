"use server";

export async function uploadImagesToCloudinary(files) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!response.ok) throw new Error(`Upload failed for ${file.name}`);

    const data = await response.json();

    return {
      url: data.secure_url, // "https://res.cloudinary.com/..."
      publicId: data.public_id, // "folder/image_id"
    };
  });

  return await Promise.all(uploadPromises);
  // Returns: [{ url: "https://...", publicId: "..." }, ...]
}

export async function deleteImagesFromCloudinary(imagesArray) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!apiKey || !apiSecret) {
    throw new Error("Cloudinary API credentials not configured.");
  }

  if (!imagesArray || imagesArray.length === 0) {
    return { deleted: [], failed: [] };
  }

  // ✅ Extract publicId from each image object
  const publicIds = imagesArray.map((img) =>
    typeof img === "string" ? img : img.publicId
  );

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
        }
      );

      const data = await response.json();

      if (!response.ok || data.result !== "ok") {
        throw new Error(`Failed to delete: ${publicId}`);
      }

      return publicId;
    })
  );

  const deleted = [];
  const failed = [];

  results.forEach((result, i) => {
    if (result.status === "fulfilled") {
      deleted.push(result.value);
    } else {
      failed.push({ publicId: publicIds[i], error: result.reason?.message });
    }
  });

  return { deleted, failed };
}
