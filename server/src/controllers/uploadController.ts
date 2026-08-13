import { Request, Response } from "express"
import cloudinary from "../config/cloudinary"

interface MulterRequest extends Request {
  file?: Express.Multer.File
}

export async function uploadImage(req: MulterRequest, res: Response) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" })
    }

    // Convert the in-memory buffer into a base64 string Cloudinary's upload API accepts
    const base64Image = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`

    const result = await cloudinary.uploader.upload(base64Image, {
      folder: "wantera/products", // keeps uploads organized inside your Cloudinary account
    })

    res.status(200).json({
      message: "Image uploaded successfully",
      url: result.secure_url,
      publicId: result.public_id, // needed later if we want to delete this specific image
    })
  } catch (error) {
    console.error("Upload error:", error)
    res.status(500).json({ message: "Image upload failed" })
  }
}