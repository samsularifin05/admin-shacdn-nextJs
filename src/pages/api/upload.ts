import type { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const form = formidable({
    multiples: false,
    keepExtensions: true,
  });

  return new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) {
        console.error("Upload error:", err);
        res.status(500).json({ message: "Upload failed" });
        return resolve(undefined);
      }

      const file = Array.isArray(files.file) ? files.file[0] : files.file;
      if (!file) {
        res.status(400).json({ message: "No file uploaded" });
        return resolve(undefined);
      }

      const uploadDirName =
        (Array.isArray(fields.uploadDir)
          ? fields.uploadDir[0]
          : fields.uploadDir) || "uploads";
      const targetDir = path.join(process.cwd(), "public", uploadDirName);

      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const fileName = `${Date.now()}-${file.originalFilename}`;
      const targetPath = path.join(targetDir, fileName);

      fs.rename(file.filepath, targetPath, (renameErr) => {
        if (renameErr) {
          console.error("Rename error:", renameErr);
          res.status(500).json({ message: "Failed to save file" });
          return resolve(undefined);
        }

        const relativePath = `/${uploadDirName}/${fileName}`;
        res.status(200).json({ url: relativePath });
        resolve(undefined);
      });
    });
  });
}
