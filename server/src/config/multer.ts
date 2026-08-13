import multer from "multer"

// We use memory storage — the file stays in RAM temporarily as a Buffer,
// which we then stream directly to Cloudinary. No file ever touches our disk,
// which avoids the ephemeral-storage problem entirely.
const storage = multer.memoryStorage()

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max per file
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true)
    } else {
      cb(new Error("Only image files are allowed"))
    }
  },
})