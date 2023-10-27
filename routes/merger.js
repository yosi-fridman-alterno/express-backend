import express from "express"
import hummus from "hummus"
import https from 'https';
import http from 'http';
import path from "path"
import tmp from "tmp"
import url from "url"
import eos from "end-of-stream"
import fs from "fs"
import { errorLogger } from "../utils/errorLogger.js"

const mergePDFhandler = async (req, res, next) => {

    const aPromises = saveTempFiles(req, res);

    try {
        const oData = await Promise.all(aPromises);

        if (!assertPDFfiles(oData)) {
            next(new Error("All files must be valid PDF files"));
            return;
            // res.write(JSON.stringify({ error: 'All files must be valid PDF files.', stack: "asserting downloaded PDF files merger.js:promise.all" }));
        } else {
            mergePDFs(res, oData);
        }

        cleanTempFiles(oData);
        res.end();

    } catch (error) {
        next(error);
    }

}

const saveTempFiles = (req, res) => {

    const aPromises = [];
    for (let url of req.body.fileUrls) {
        const download = downloadTempFile(url);
        aPromises.push(download);
    }

    return aPromises;
}

const downloadTempFile = (sUrl) => {

    return new Promise((resolve, reject) => {

        const lib = sUrl.startsWith('https') ? https : http;

        const request = lib.get(sUrl, (response) => {

            // handle http errors
            if (response.statusCode < 200 || response.statusCode > 299) {
                var errMsg = 'Failed to download file ' + (new url.URLSearchParams(sUrl).get('compId') || '') + '.';
                reject(new Error(errMsg));
            } else {
                let oTemp = tmp.fileSync();
                let file = fs.createWriteStream(oTemp.name);
                response.pipe(file);

                response.on('end', () => {

                });

                eos(file, function (err) { //end of stream, means file writing to file system completed for sure
                    if (err) {
                        reject(err);
                    } else {
                        resolve(oTemp);
                    }
                });
            }
        });
        // handle connection errors of the request
        request.on('error', (err) => reject(err))
    })
};

const assertPDFfiles = (aTempFiles) => {
    try {
        for (let oTempFile of aTempFiles) {
            hummus.createReader(oTempFile.name);
        }
        return true;
    } catch (oException) {
        return false;
    }
}

const mergePDFs = (res, aTempFiles) => {
    const pdfWriter = hummus.createWriter(new hummus.PDFStreamForResponse(res), { log: path.join(res.app.get('dirname'), 'hummus.log') });

    if (aTempFiles && aTempFiles.length) {
        for (let oTempFile of aTempFiles) {
            pdfWriter.appendPDFPagesFromPDF(oTempFile.name);
        }
    };

    pdfWriter.end();
}

const cleanTempFiles = (aTempFiles) => {
    for (let oTempFile of aTempFiles) {
        setTimeout(() => {
            try {
                oTempFile.removeCallback();
            } catch (error) {
                errorLogger(error); //do not stop process, but log the error
            }

        }, 100);
    }
}

const router = express.Router();
router.post('/', mergePDFhandler);

export default router;

