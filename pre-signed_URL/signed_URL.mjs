import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const signed_URL = async event => {
  // Initialize the S3 client
  const s3Client = new S3Client();

  // Generate a unique object key (path) for the uploaded file
  const objectKey = `uploads/${Date.now()}-${
    event.queryStringParameters.filename
  }`;

  // Set the expiration time for the pre-signed URL (in seconds)
  const expirationSeconds = 300; // Adjust the expiration time as needed

  // Create an instance of the PutObjectCommand to generate the pre-signed URL for upload
  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.bucketName,
    Key: objectKey,
  });

  try {
    // Generate the pre-signed URL for uploading
    const url = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: expirationSeconds,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ url }),
    };
  } catch (error) {
    console.error('Error generating pre-signed URL for upload:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: 'Internal Server Error' }),
    };
  }
};
