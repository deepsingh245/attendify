/* eslint-disable @typescript-eslint/no-explicit-any */

import * as functions from 'firebase-functions';
import * as cors from 'cors';
import * as Busboy from 'busboy';
import { mainAppAuth, sharedStorage } from './firebase-admin';
import { DecodedIdToken } from 'firebase-admin/auth';

// Enable CORS for your frontend URL
const corsHandler = cors({ origin: true });

export const attendifyUploadFile = functions.https.onRequest((req, res) => {
  // Handle CORS preflight requests
  corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      res.status(405).send('Method Not Allowed');
      return;
    }

    // 1. Authenticate the user
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).send('Unauthorized: No token provided.');
      return;
    }
    const idToken = authHeader.split('Bearer ')[1];

    let decodedToken: DecodedIdToken;
    try {
      decodedToken = await mainAppAuth.verifyIdToken(idToken);
    } catch (error) {
      console.error('Error verifying Firebase ID token:', error);
      res.status(403).send('Unauthorized: Invalid token.');
      return;
    }

    const userId = decodedToken.uid;

    // 2. Process the file upload using busboy
    const busboy = Busboy({ headers: req.headers });
    const bucket = sharedStorage.bucket();
    
    let uploadData: { file: NodeJS.ReadableStream | null, filename: string, mimeType: string } = {
      file: null,
      filename: '',
      mimeType: ''
    };

    busboy.on('file', (fieldname: any, file: any, filename: any, encoding: any, mimetype: any) => {
      if (fieldname !== 'file') {
        // Here you could decide to ignore or fail
        return;
      }
      
      // File validation
      const FIVE_MB = 5 * 1024 * 1024;
      if (parseInt(req.headers['content-length'] || '0') > FIVE_MB) {
        res.status(413).send('File size exceeds 5MB limit.');
        return;
      }

      if (!mimetype.startsWith('image/')) {
        res.status(412).send('Invalid file type. Only images are allowed.');
        return;
      }
      
      uploadData = { file, filename: filename, mimeType: mimetype };
    });

    busboy.on('finish', () => {
      if (!uploadData.file) {
        res.status(400).send('No file provided for upload.');
        return;
      }

      // 3. Upload to Shared Storage Bucket
      const destination = `attendify/uploads/${userId}/${Date.now()}-${uploadData.filename}`;
      const file = bucket.file(destination);

      const stream = file.createWriteStream({
        metadata: {
          contentType: uploadData.mimeType,
        },
        resumable: false,
      });

      stream.on('error', (err) => {
        console.error('File stream error:', err);
        res.status(500).send({ message: 'Failed to upload file.', error: err.message });
      });

      stream.on('finish', async () => {
        try {
          await file.makePublic();
          res.status(200).send({
            message: 'File uploaded successfully.',
            url: file.publicUrl(),
            path: destination,
          });
        } catch(err) {
            console.error('Error making file public:', err);
            res.status(500).send({ message: 'Upload succeeded but failed to make file public.'});
        }
      });

      uploadData.file.pipe(stream);
    });

    req.pipe(busboy);
  });
});
