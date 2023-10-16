import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import { __dirname } from './constants.js';

//Creates a write stream to log file in append mode
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' })

morgan.token('payload',
    (req, res) => {
        return JSON.stringify(req.body);
    });

const morganOptions = {
    stream: accessLogStream,
    skip: (req, res) => {
        return req.method === 'OPTIONS'
    }
};

const accessLogger = (format) => {
    return morgan(format, morganOptions);
}

export default accessLogger;
