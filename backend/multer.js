const multer = require("multer");

// store file in memory (required for Cloudinary)
const storage = multer.memoryStorage();

const upload = multer({ storage });

module.exports = upload;