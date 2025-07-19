import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Setup __dirname manually (required in ES module style)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Set storage engine
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.resolve('uploads'));

  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname); // Use timestamp to avoid filename conflicts
  },
});

// Initialize multer upload
const upload = multer({ storage: storage });

export default upload;
