import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|webp/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mime = file.mimetype.toLowerCase();
  if (allowedExtensions.test(ext) && mime.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, PNG, and WebP image files are allowed.'));
  }
};

let storage;

if (
  process.env.NODE_ENV === 'production' &&
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
) {
  // Production: upload directly to Cloudinary
  const { CloudinaryStorage } = await import('multer-storage-cloudinary');
  const { default: cloudinary } = await import('../config/cloudinary.js');

  storage = new CloudinaryStorage({
    cloudinary,
    params: {
      folder: 'jansetu/complaints',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }],
    },
  });
} else {
  // Development: save to local disk
  const uploadDir = path.join(__dirname, '../uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `jansetu-${uniqueSuffix}${ext}`);
    },
  });
}

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});
