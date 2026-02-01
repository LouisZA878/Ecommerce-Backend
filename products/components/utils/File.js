const { GridFSBucket, ObjectId } = require("mongodb");
const stream = require("stream");
const multer = require("multer");
const mongoose = require("mongoose");

const bucketConnection = (collection) => {
  const conn = mongoose.connection;
  const bucket = new GridFSBucket(conn.db, {
    bucketName: collection,
  });

  return bucket;
};

const uploadToGridFS = async (collection, file) => {
  const bucket = bucketConnection(collection);

  const bufferStream = stream.Readable.from(file.buffer);
  const uploadStream = bucket.openUploadStream(file.originalname, {
    metadata: {
      mimetype: file.mimetype,
    },
  });

  return new Promise((resolve, reject) => {
    bufferStream
      .pipe(uploadStream)
      .on("error", reject)
      .on("finish", () => resolve(uploadStream));
  });
};

const deleteImage = async (collection, imageId) => {
  const bucket = bucketConnection(collection);
  const id = new mongoose.Types.ObjectId(imageId);
  await bucket.delete(id);
};

const FetchFile = (collection, id) => {
  const conn = mongoose.connection;
  const bucket = new GridFSBucket(conn.db, {
    bucketName: collection,
  });

  const fileId = ObjectId.createFromHexString(id);
  const downloadStream = bucket.openDownloadStream(fileId);

  return downloadStream;
};

const FetchFiles = async (collection) => {
  const conn = mongoose.connection;
  const files = await conn.db
    .collection(`${collection}.files`)
    .find()
    .toArray();

  return files;
};

const uploadArray = (files) => (req, res, next) => {
  const storage = multer.memoryStorage();
  const uploadType = multer({ storage }).array(files, 5);

  uploadType(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log(err.message);
      console.log(err.code);
      return res.status(400).send({
        data: {},
        success: false,
        description: "An error occured while uploading your files",
      });
    } else if (err) {
      console.log(err.message);
      return res.status(400).send({
        data: {},
        success: false,
        description: "An error occured while uploading your files",
      });
    }

    next();
  });
};
const uploadSingle = (files) => (req, res, next) => {
  const storage = multer.memoryStorage();
  const uploadType = multer({ storage }).single(files);

  uploadType(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.log(err.message);
      console.log(err.code);
      return res.status(400).send({
        data: {},
        success: false,
        description: "An error occured while uploading your files",
      });
    } else if (err) {
      console.log(err.message);
      return res.status(400).send({
        data: {},
        success: false,
        description: "An error occured while uploading your files",
      });
    }

    next();
  });
};

module.exports = {
  uploadToGridFS,
  FetchFile,
  FetchFiles,
  uploadArray,
  uploadSingle,
  deleteImage,
};
