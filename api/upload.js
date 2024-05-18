const express = require('express');
const uploadRouter = express.Router();

const multer = require('multer');
const { google } = require('googleapis');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });

const KEYFILEPATH = 'lib\\key.json';
const FOLDER_ID = '1Z4JeKEAo2IYUfFch2XQMXzuqFeRl264g';

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const driveService = google.drive({ version: 'v3', auth });

uploadRouter.post('/', async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileMetadata = {
    name: req.file.originalname,
    parents: [FOLDER_ID],
  };

  const media = {
    mimeType: req.file.mimetype,
    body: fs.createReadStream(req.file.path),
  };

  try {
    const file = await driveService.files.create({
      resource: fileMetadata,
      media: media,
      fields: 'id',
    });

     // Make the file public
     await driveService.permissions.create({
        fileId: file.data.id,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

    fs.unlinkSync(req.file.path); // Remove the file from the server after upload

    res.status(200).send({fileId: file.data.id});
  } catch (error) {
    res.status(500).send('Error uploading file: ' + error.message);
  }
});

module.exports = uploadRouter;