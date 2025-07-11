import sharp from "sharp";
import fs from "fs/promises";
import path from "path";
import cloudinary from "../services/cloudinary.js";

export const compressImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded." });
    }

    const compressedFilePaths = [];

    // Compress images
    for (const file of req.files) {
      const { path: originalPath, filename } = file;
      const compressedPath = path.join(
        path.dirname(originalPath),
        `${filename}.webp`
      );

      await sharp(originalPath)
        .resize({ width: 1200, withoutEnlargement: true }) // optional: adjust as needed
        .webp({ quality: 80 }) // adjust quality here
        .toFile(compressedPath);

      compressedFilePaths.push(compressedPath);
    }

    const uploadPromises = compressedFilePaths.map(async (filePath) => {
      const originalName = path.parse(filePath).name;
      console.log(originalName);

      const result = await cloudinary.uploader.upload(filePath, {
        folder: "tsa",
        resource_type: "image",
      });

      // Clean up compressed file after upload
      await fs.unlink(filePath);
      return result.secure_url;
    });

    // Optional: remove original files too
    const originalPaths = req.files.map((file) => file.path);
    await Promise.all(originalPaths.map((p) => fs.unlink(p)));

    const uploadedUrls = await Promise.all(uploadPromises);

    return res.status(200).json({ urls: uploadedUrls });
  } catch (error) {
    console.error("Compression error:", error);
    return res
      .status(500)
      .json({ message: "Failed to compress/upload images." });
  }
};
