export async function uploadImagesToCloudinary(files) {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  // Upload all files in parallel
  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    try {
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
      return data.secure_url; // Return the Cloudinary URL
    } catch (error) {
      console.error(`Error uploading ${file.name}:`, error);
      throw error; // Re-throw to handle in caller
    }
  });

  // Wait for all uploads to complete
  const urls = await Promise.all(uploadPromises);
  return urls;
}
