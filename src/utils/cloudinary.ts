import { v2 as cloudinary } from 'cloudinary';
import { config } from '../config';
import { logger } from '../config/logger';

cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

export async function uploadToCloudinary(filePath: string, folder: string): Promise<{ secure_url: string; public_id: string }> {
  const result = await cloudinary.uploader.upload(filePath, {
    folder,
    resource_type: 'image',
    transformation: [{ width: 500, height: 500, crop: 'limit', quality: 'auto' }],
  });
  return { secure_url: result.secure_url, public_id: result.public_id };
}

export async function deleteFromCloudinary(imageUrl: string): Promise<void> {
  const publicId = extractPublicId(imageUrl);
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    logger.warn({ err, publicId }, 'Failed to delete from Cloudinary');
  }
}

function extractPublicId(url: string): string | null {
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

export function getCloudinary(): typeof cloudinary {
  return cloudinary;
}
