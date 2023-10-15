// dependencies
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
} from '@aws-sdk/client-s3';

import sharp from 'sharp';

// create S3 client
const s3 = new S3Client();

export const thumbnail_app = async event => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;

  console.log(`the value of the key is = ${key}`);
  console.log(`the value of the bucket is = ${bucket}`);

  try {
    const originalImage = await s3.send(
      new GetObjectCommand({ Bucket: bucket, Key: key })
    );

    console.log(originalImage);

    // Determine the content type of the original image
    const contentType = originalImage.ContentType || 'image/jpeg'; // Default to JPEG

    const resizedImages = await Promise.all([
      resizeAndUpload(
        originalImage.Body,
        bucket,
        'resized/small',
        100,
        100,
        contentType
      ),
      resizeAndUpload(
        originalImage.Body,
        bucket,
        'resized/medium',
        200,
        200,
        contentType
      ),
      resizeAndUpload(
        originalImage.Body,
        bucket,
        'resized/large',
        300,
        300,
        contentType
      ),
    ]);

    console.log('Resized images:', resizedImages);

    return {
      statusCode: 200,
      body: JSON.stringify('Image resized and saved successfully.'),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Internal Server Error'),
    };
  }
};

async function resizeAndUpload(
  originalImageBuffer,
  bucket,
  folder,
  width,
  height,
  contentType
) {
  const resizedImageBuffer = await sharp(originalImageBuffer)
    .resize({ width, height })
    .toBuffer();

  const resizedKey = `${folder}/${width}x${height}-${Date.now()}.jpg`;

  await s3.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: resizedKey,
      Body: resizedImageBuffer,
      ContentType: contentType, // Use the detected or default content type
    })
  );

  return resizedKey;
}
