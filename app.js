import express from 'express';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import indexRouter from './routes/index.js';
import usersRouter from './routes/notFound.js';
import mergerRouter from './routes/merger.js';
import zipperRouter from './routes/zipper.js';
import notFoundHandler from './routes/notFound.js'
import accessLogger from './utils/accessLogger.js';
import { errorHandler } from './utils/errorLogger.js';
import { __dirname } from './utils/constants.js';

/**
 * Fix for CA problem. SAP CS moved to TLS and CA is unauthorized.
 * Caution! Security problems may arise.
 */
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

const app = express();

app.set('views', path.join(__dirname, 'views')); // views folder for view engine
app.set('view engine', 'jade'); // view engine setup
app.set('dirname', __dirname);
app.set('tmpdir', path.join(__dirname, '\\temp\\'));

/**
 * Express application middlewares
 */

/**
* Body-parser for URL params and POST requests body parsing.
*/
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors()); //Cross-site headers, HTTP OPTIONS, etc.

/**
* Access logger for backend (Morgan middleware logger)
*/
app.use(accessLogger("combined"));
app.use(accessLogger(":payload")); //dual logging for payload in new line

/**
 * Express Router APIs
 */
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/merger', mergerRouter);
app.use('/zipper', zipperRouter);
app.use(notFoundHandler)

/**
 * Error handler
 */
app.use(errorHandler);

export default app;
