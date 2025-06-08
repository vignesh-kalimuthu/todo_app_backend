const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/aws");

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.AWS_BUCKET_NAME,
    acl: "public-read",
    key: function (req, file, cb) {
      const fileName = `tasks/${Date.now()}_${file.originalname}`;
      cb(null, fileName);
    },
  }),
});

module.exports = upload;
