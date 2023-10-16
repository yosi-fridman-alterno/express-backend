import express from "express"
import createError from 'http-errors';

// catch 404 and forward to error handler
const notFoundHandler = (req, res, next) => {

  const err = createError(404);
  next(err);

}

// const router = express.Router();
// router.post('/', notFoundHandler);
// router.get('/', (req, res, next) => {

//   res.send("OK");

// });

export default notFoundHandler;
