import { Router } from "express";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import { requireAuth } from "../middlewares/auth.middleware";

const router = Router();

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || ".jpg";
    const safeExt = extension.toLowerCase();
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image files are allowed"));
      return;
    }
    cb(null, true);
  },
});

router.post("/image", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "image file is required" });
    return;
  }

  const baseUrl = `${req.protocol}://${req.get("host")}`;
  const publicUrl = `${baseUrl}/uploads/${req.file.filename}`;

  res.status(201).json({
    message: "Image uploaded",
    url: publicUrl,
    fileName: req.file.filename,
  });
});

export default router;

