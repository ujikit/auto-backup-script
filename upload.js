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

function getYesterday() {
  // Get the current timestamp
  let now = new Date().getTime();
  // Number of milliseconds in a day (24 hours * 60 minutes * 60 seconds * 1000 milliseconds)
  let oneDay = 24 * 60 * 60 * 1000;
  // Subtract one day
  let yesterday = now - oneDay;

  return yesterday;
}

async function uploadFile() {
  try {
    const files = fs.readdirSync(SOURCE_TO_LOCAL_DIRECTORY);

    files.forEach(async file => {
      let splitted = parseInt(file.split('.')[0], 10);

      // the file is backed up once a day, in one day before
      if (
        new Date(splitted).getTime() >= getYesterday() &&
        new Date(splitted).getTime() <= new Date().getTime()
      ) {
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
      }
    });
  } catch (err) {
    console.log('Unable to scan directory: ' + err);
  }
}

uploadFile();
