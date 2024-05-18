const express = require('express');
const playerRouter = require('./api/players');
const uploadRouter = require('./api/upload');
const multer = require('multer');
const { google } = require('googleapis');
const { Readable } = require('stream');

const app = express();

// Middleware
app.use(express.json());
app.use('/api/players',playerRouter)
app.use('/api/upload',uploadRouter)




// Configure multer to use memory storage
const upload = multer({ storage: multer.memoryStorage() });

const KEYFILEPATH = 'lib/key.json';
const FOLDER_ID = '1Z4JeKEAo2IYUfFch2XQMXzuqFeRl264g';

const auth = new google.auth.GoogleAuth({
  keyFile: KEYFILEPATH,
  scopes: ['https://www.googleapis.com/auth/drive.file'],
});

const driveService = google.drive({ version: 'v3', auth });

function bufferToStream(buffer) {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null); // Signifies the end of the stream
  return stream;
}

app.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const fileMetadata = {
    name: req.file.originalname,
    parents: [FOLDER_ID],
  };

  const media = {
    mimeType: req.file.mimetype,
    body: bufferToStream(req.file.buffer),
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

    res.status(200).send({ fileId: file.data.id });
  } catch (error) {
    res.status(500).send('Error uploading file: ' + error.message);
  }
});

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


module.exports = { app, server }

