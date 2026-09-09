import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

export const uploadAvatar = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;

    // Verify req.user.id === req.params.id
    if (req.user._id.toString() !== userIdToUpdate) {
      return res.status(403).json({ message: "Forbidden: You can only update your own avatar." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // Convert multer buffer to base64 dataURI
    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    // Upload to Cloudinary with transformations
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
      folder: "fortflux_avatars",
      transformation: [
        { width: 300, height: 300, crop: "fill", gravity: "face" }
      ]
    });

    // Delete old avatar if it exists
    if (user.avatarCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(user.avatarCloudinaryId);
      } catch (destroyError) {
        console.error("Failed to delete old avatar from Cloudinary:", destroyError);
        // Continue saving the new one even if delete fails, but log it
      }
    }

    // Update user document
    const avatarUrl = uploadResponse.secure_url;
    user.avatarUrl = avatarUrl;
    user.profilePic = avatarUrl;
    user.avatarCloudinaryId = uploadResponse.public_id;
    
    // Save updated user (triggering select("-password") logic is tricky when saving directly, 
    // so we'll re-fetch or just delete password from the response object)
    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.avatarUrl = avatarUrl;
    userResponse.profilePic = avatarUrl;

    return res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error in uploadAvatar controller:", error.message);
    return res.status(502).json({ message: "Failed to upload avatar to cloud storage. Please try again." });
  }
};export const uploadBanner = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;

    if (req.user._id.toString() !== userIdToUpdate) {
      return res.status(403).json({ message: "Forbidden: You can only update your own banner." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }

    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;

    let bannerUrl = dataURI;
    let bannerCloudinaryId = "";

    try {
      const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        folder: "fortflux_banners",
        transformation: [
          { width: 1400, height: 450, crop: "limit", quality: "auto" }
        ]
      });
      bannerUrl = uploadResponse.secure_url;
      bannerCloudinaryId = uploadResponse.public_id;

      if (user.bannerCloudinaryId) {
        try {
          await cloudinary.uploader.destroy(user.bannerCloudinaryId);
        } catch (destroyError) {
          console.error("Failed to delete old banner from Cloudinary:", destroyError);
        }
      }
    } catch (cloudErr) {
      console.warn("Cloudinary banner upload failed, using dataURI fallback:", cloudErr.message);
      bannerUrl = dataURI;
    }

    user.bannerUrl = bannerUrl;
    user.bannerCloudinaryId = bannerCloudinaryId;
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;
    userResponse.bannerUrl = bannerUrl;

    return res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error in uploadBanner controller:", error.message);
    return res.status(500).json({ message: "Failed to upload banner photo. Please try again." });
  }
};

export const removeBanner = async (req, res) => {
  try {
    const userIdToUpdate = req.params.id;

    if (req.user._id.toString() !== userIdToUpdate) {
      return res.status(403).json({ message: "Forbidden: You can only update your own banner." });
    }

    const user = await User.findById(userIdToUpdate);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    if (user.bannerCloudinaryId) {
      try {
        await cloudinary.uploader.destroy(user.bannerCloudinaryId);
      } catch (destroyError) {
        console.error("Failed to delete old banner from Cloudinary:", destroyError);
      }
    }

    user.bannerUrl = "";
    user.bannerCloudinaryId = "";
    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    return res.status(200).json(userResponse);
  } catch (error) {
    console.error("Error in removeBanner controller:", error.message);
    return res.status(500).json({ message: "Failed to remove banner. Please try again." });
  }
};
