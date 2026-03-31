const express = require("express");
const router = express.Router();

const upload = require("./multer");
const cloudinary = require("./cloudinary");

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    console.log("✅ API HIT"); // 🔥 ADD THIS

    const file = req.file;
    const folder = req.body.folder || "general";

    console.log("📂 File:", file); // 🔥 ADD THIS

    if (!file) {
      console.log("❌ No file received");
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 300KB limit
    if (file.size > 300 * 1024) {
      console.log("❌ File too large");
      return res.status(400).json({ message: "File exceeds 300KB" });
    }

    const stream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          console.log("❌ Cloudinary error:", error);
          return res.status(500).json({ error });
        }

        console.log("✅ Uploaded URL:", result.secure_url); // 🔥 ADD

        res.json({
          url: result.secure_url,
        });
      }
    );

    stream.end(file.buffer);

  } catch (err) {
    console.log("❌ Server error:", err); // 🔥 ADD
    res.status(500).json(err);
  }
});

module.exports = router;