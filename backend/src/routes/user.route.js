import express from "express";
import { uploadAvatar } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js";
import multer from "multer";

const router = express.Router();

// Wrapper to handle multer errors gracefully
const handleAvatarUpload = (req, res, next) => {
  const uploadSingle = upload.single("avatar");

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g., file too large)
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred or our custom fileFilter error
      return res.status(400).json({ message: err.message });
    }
    // Everything went fine
    next();
  });
};

router.post("/:id/avatar", protectRoute, handleAvatarUpload, uploadAvatar);

export default router;
