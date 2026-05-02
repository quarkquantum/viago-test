import os from 'node:os';
import path from 'node:path';
import { DeleteObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { fileTypeFromBuffer } from 'file-type';
import fs from 'fs-extra';
import { env } from '@/env';

const R2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: env.CLOUDFLARE_R2_ACCESS_KEY_SECRET,
  },
});

const bucketName = env.CLOUDFLARE_R2_BUCKET_NAME;

const getFileType = async (input: Buffer) => {
  if (Buffer.isBuffer(input)) {
    return await fileTypeFromBuffer(input);
  }
  throw new Error('Unsupported input type');
};

/**
 * Download a file from R2 storage
 *
 * @param fileName The key of the file to download
 * @param downloadPath Optional path where to save the file
 * @returns The path to the downloaded file
 */
export const downloadFromR2 = async (fileName: string, downloadPath?: string): Promise<string> => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileName,
  });
  const response = await R2Client.send(command);

  // Create temp file path
  const tempPath = downloadPath ?? path.join(os.tmpdir(), path.basename(fileName));

  // Convert stream to buffer and write to temp file
  if (response.Body) {
    const buffer = await response.Body.transformToByteArray();
    await fs.promises.writeFile(tempPath, buffer);
    return tempPath;
  }

  throw new Error('No file body received from R2');
};

/**
 * Upload a file to R2 storage
 *
 * @param input The file buffer to upload
 * @param fileName Optional filename to use (generated if not provided)
 * @returns The key of the uploaded file
 */
export const uploadR2File = async (input: Buffer, fileName?: string) => {
  const fileType = await getFileType(input);

  const finalFileName = fileName || `${Date.now()}.${fileType?.ext}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Body: input,
    Key: finalFileName,
    CacheControl: 'public, max-age=31536000',
    ContentDisposition: 'inline',
  });
  await R2Client.send(command);
  return finalFileName;
};

/**
 * Delete a file from R2 storage
 *
 * @param key The key of the file to delete
 */
export const deleteR2File = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  await R2Client.send(command);
  return true;
};

export const getR2ObjectStream = async (key: string) => {
  const command = new GetObjectCommand({
    Bucket: env.CLOUDFLARE_R2_BUCKET_NAME,
    Key: key,
  });

  const response = await R2Client.send(command);

  return {
    data: response.Body,
    contentType: response.ContentType,
    contentLength: response.ContentLength,
    lastModified: response.LastModified,
  };
};

/**
 * Generate a signed URL for an R2 object
 *
 * @param key The key of the file to generate URL for
 * @param expiresIn The number of seconds the URL will be valid, default is 1 hour
 * @returns A presigned URL that can be used to access the file
 */
export const getSignedR2Url = async (key: string, expiresIn = 3600) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  });
  // Generate a signed URL that expires after specified seconds
  const signedUrl = await getSignedUrl(R2Client, command, {
    expiresIn,
  });

  return signedUrl;
};

const trailingSlashRegex = /\/$/;

export const getPublicR2Url = (key: string) => {
  const publicBase =
    env.CLOUDFLARE_R2_PUBLIC_URL ||
    `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${env.CLOUDFLARE_R2_BUCKET_NAME}`;
  return `${publicBase.replace(trailingSlashRegex, '')}/${key}`;
};
