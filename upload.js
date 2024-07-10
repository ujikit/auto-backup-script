const fs = require('fs');
const path = require('path');
const { Storage } = require('@google-cloud/storage');

require('dotenv').config();

const {
  PROJECT_ID,
  BUCKET_NAME,
  SERVICE_KEY_PATH,
  SOURCE_TO_LOCAL_DIRECTORY,
  DESTINATION_TO_CLOUD_DIRECTORY
} = process.env;

// Path to your service account key file
const serviceKeyPath = path.join(__dirname, SERVICE_KEY_PATH);

// Create a new storage instance
const storage = new Storage({
  keyFilename: serviceKeyPath,
  projectId: PROJECT_ID
});

async function uploadFile() {
  try {
    const files = fs.readdirSync(SOURCE_TO_LOCAL_DIRECTORY);

    files.forEach(async file => {
      try {
        await storage
          .bucket(BUCKET_NAME)
          .upload(`${SOURCE_TO_LOCAL_DIRECTORY}/${file}`, {
            // Support for HTTP requests made with `Accept-Encoding: gzip`
            gzip: true,
            // By setting the option `destination`, you can change the name of the
            // object you are uploading to a bucket.
            destination: `${DESTINATION_TO_CLOUD_DIRECTORY}/${file}`,
            // Optional:
            metadata: {
              cacheControl: 'public, max-age=31536000'
            }
          });
        console.log(`${file} uploaded to ${BUCKET_NAME}.`);
      } catch (error) {
        console.error('ERROR:', error);
      }
    });
  } catch (err) {
    console.log('Unable to scan directory: ' + err);
  }
}

uploadFile();
