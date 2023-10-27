import express from "express";
import archiver from "archiver";
import https from 'https';
import http from 'http';
import url from "url";
import { errorLogger } from "../utils/errorLogger.js";

const zipHandler = (req, res, next) => {

  const archive = createArchive(res, next);
  const aPromises = processPayload(req, archive);

  Promise.all(aPromises).then(
    (data) => {
      data.forEach(
        (fnPipe) => {
          fnPipe();
        }
      )
      archive.finalize();
    }).catch(next);
}

const processPayload = (req, archive) => {
  const aPromises = [];
  if (req?.body?.fileUrls) {
    for (let elem of req.body.fileUrls) {
      const request = pipeRemoteFile(elem, archive);
      aPromises.push(request);
    }
  }

  return aPromises;
}

const pipeRemoteFile = (sUrl, archive) => {

  return new Promise((resolve, reject) => {

    const lib = sUrl.startsWith('https') ? https : http;

    const request = lib.get(sUrl, (response) => {

      const sFullFileName = (new url.URLSearchParams(sUrl).get('compId') || sUrl);
      const sFileName = sFullFileName.substring(0, sFullFileName.lastIndexOf('.'));
      const sFileType = sFullFileName.substring(sFullFileName.lastIndexOf('.'));

      // handle http errors
      if (response.statusCode < 200 || response.statusCode > 299) {

        const errMsg = 'Failed to download file ' + sFileName + '.';
        reject(new Error(errMsg));

      } else {
        const data = [];

        response.on('data', (chunk) => {
          data.push(chunk);
        }).on('end', () => {
          const rawFile = Buffer.concat(data);

          resolve(() => {
            const decodedName = decodeURIComponent(sFileName);
            archive.append(rawFile, { name: decodedName + sFileType });
          }
          )
        });

      }
    });
    // handle connection errors of the request
    request.on('error', (err) => reject(err))
  })
};


const createArchive = (output, next) => { //output=res

  // create a file to stream archive data to.
  const archive = archiver('zip', {
    zlib: { level: 9 } // Sets the compression level.
  });

  // good practice to catch warnings (ie stat failures and other non-blocking errors)
  archive.on('warning', errorLogger).on('error', next);

  // pipe archive data to the HTTP response
  archive.pipe(output);

  return archive;
}

const router = express.Router();
router.post('/', zipHandler);

export default router;
