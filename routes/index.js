import express from "express";
const router = express.Router();

const title = "IRoads Node.js server";
const description = `Service is up and running on Platform: ${process.platform}, Node version ${process.version}`;

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title, description });
});

export default router;
