import express from "express";
import { uploadAvatar, uploadBanner, removeBanner } from "../controllers/user.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.js";
import multer from "multer";

const router = express.Router();

// Wrapper to handle multer errors gracefully
const handleAvatarUpload = (req, res, next) => {
  const uploadSingle = upload.single("avatar");

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

const handleBannerUpload = (req, res, next) => {
  const uploadSingle = upload.single("banner");

  uploadSingle(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ message: `Upload error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ message: err.message });
    }
    next();
  });
};

router.post("/:id/avatar", protectRoute, handleAvatarUpload, uploadAvatar);
router.post("/:id/banner", protectRoute, handleBannerUpload, uploadBanner);
router.delete("/:id/banner", protectRoute, removeBanner);

export default router;
