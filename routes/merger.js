import express from "express"
import hummus from "hummus"
import tmp from "tmp"
import fs from "fs"
import path from "path"
import url from "url"
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

const downloadTempFile = async (sUrl) => {

    const response = await fetch(sUrl);

    if (response.status < 200 || response.status > 299) {
        const errMsg = 'Failed to download file ' + (new url.URLSearchParams(sUrl).get('compId') || '') + '.';

        throw new Error(errMsg);

    } else {
        const blob = await response.blob();
        const oTemp = tmp.fileSync();
        const buffer = Buffer.from(await blob.arrayBuffer());

        fs.writeFileSync(oTemp.name, buffer);

        return oTemp;

    }

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

