import fs from "fs";
import path from "path";
import { google } from "googleapis";
import dotenv from "dotenv";
import unzipper from "unzipper";
import heicConvert from "heic-convert";

dotenv.config({
  path: path.resolve(process.cwd(), "../..", ".env"),
});

async function authorize() {
  const client_id = process.env.GOOGLE_CLIENT_ID;
  const client_secret = process.env.GOOGLE_CLIENT_SECRET;
  const redirect_uri = process.env.GOOGLE_REDIRECT_URI;

  const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uri
  );

  const token = {
    access_token: process.env.GOOGLE_ACCESS_TOKEN,
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    scope: process.env.GOOGLE_ACCESS_TOKEN_SCOPE,
    token_type: process.env.GOOGLE_ACCESS_TOKEN_TYPE,
    refresh_token_expires_in: Number(
      process.env.GOOGLE_REFRESH_TOKEN_EXPIRES_IN
    ),
    expiry_date: Number(process.env.GOOGLE_REFRESH_TOKEN_EXPIRATION_DATE),
  };

  oAuth2Client.setCredentials(token);
  return oAuth2Client;
}

async function downloadFile(drive, fileId, fileName) {
  const destPath = path.join("downloads", fileName);
  const dest = fs.createWriteStream(destPath);

  const res = await drive.files.get(
    { fileId, alt: "media" },
    { responseType: "stream" }
  );

  return new Promise((resolve, reject) => {
    res.data
      .on("end", () => {
        console.log(`✅ Downloaded ${fileName}`);
        resolve(destPath); // Return the full path of the downloaded file
      })
      .on("error", reject)
      .pipe(dest);
  });
}

async function unzipFileFlatten(zipPath, extractTo) {
  return new Promise((resolve, reject) => {
    fs.createReadStream(zipPath)
      .pipe(unzipper.Parse()) // Parse entries manually
      .on("entry", async (entry) => {
        const fileName = path.basename(entry.path);
        const destPath = path.join(extractTo, fileName);

        if (entry.type === "File") {
          const writeStream = fs.createWriteStream(destPath);
          entry.pipe(writeStream);

          writeStream.on("finish", async () => {
            if (fileName.toLowerCase().endsWith(".heic")) {
              await convertHeicToJpeg(destPath);
            }
          });
        } else {
          entry.autodrain();
        }
      })
      .on("close", () => {
        console.log(`📂 Extracted and flattened: ${zipPath}`);
        fs.unlinkSync(zipPath); // delete zip after extraction
        console.log(`🗑️ Deleted zip: ${zipPath}`);
        resolve();
      })
      .on("error", reject);
  });
}

function isMediaFile(fileName) {
  const ext = fileName.toLowerCase();
  const mediaExtensions = [
    ".png",
    ".jpg",
    ".jpeg",
    ".heic",
    ".mp4",
    ".mov",
    ".webp",
  ];
  return mediaExtensions.some((e) => ext.endsWith(e));
}

async function convertHeicToJpeg(inputPath) {
  const outputPath = path.join(
    path.dirname(inputPath),
    path.basename(inputPath, path.extname(inputPath)) + ".jpg"
  );

  const inputBuffer = fs.readFileSync(inputPath);
  const outputBuffer = await heicConvert({
    buffer: inputBuffer,
    format: "JPEG",
    quality: 1,
  });

  fs.writeFileSync(outputPath, outputBuffer);
  fs.unlinkSync(inputPath);
  console.log(`🔄 Converted HEIC → JPEG: ${outputPath}`);

  return outputPath;
}

async function downloadFolder(auth, folderId) {
  const drive = google.drive({ version: "v3", auth });
  const res = await drive.files.list({
    q: `'${folderId}' in parents`,
    fields: "files(id, name)",
  });

  if (!fs.existsSync("downloads")) {
    fs.mkdirSync("downloads");
  }

  const files = res.data.files || [];

  // ZIP first
  const zipFile = files.find((f) => f.name.toLowerCase().endsWith(".zip"));
  if (zipFile) {
    console.log(`📦 Found zip file: ${zipFile.name}`);
    const zipPath = await downloadFile(drive, zipFile.id, zipFile.name);
    await unzipFileFlatten(zipPath, "downloads");
    return;
  }

  // Media files
  const mediaFiles = files.filter((f) => isMediaFile(f.name));
  if (mediaFiles.length > 0) {
    console.log(`🎥 Found ${mediaFiles.length} media files. Downloading...`);
    for (const file of mediaFiles) {
      const downloadedPath = await downloadFile(drive, file.id, file.name);
      if (file.name.toLowerCase().endsWith(".heic")) {
        await convertHeicToJpeg(downloadedPath);
      }
    }
  } else {
    console.log("⚠️ No zip or media files found.");
  }
}

export const downloadCommand = async (folderId) => {
  const auth = await authorize();
  await downloadFolder(auth, folderId);
};
