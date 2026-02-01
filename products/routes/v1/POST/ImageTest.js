const express = require("express");
const { GridFSBucket, ObjectId } = require("mongodb");
const stream = require("stream");
const multer = require("multer");
const mongoose = require("mongoose");

const {
  uploadToGridFS,
  FetchFile,
  FetchFiles,
  upload,
} = require("../../../components/utils/File");

const collectionName = process.env.MONGO_IMAGE_COLLECTION;

const router = express.Router();

router.post("/images/upload", upload.array("files", 3), async (req, res) => {
  try {
    if (!req.files) {
      return res.status(400).json({ message: "No file(s) uploaded" });
    }
    const results = await Promise.all(
      req.files.map(async (file) => {
        const image_mimes = [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/jpg",
        ];
        if (!image_mimes.includes(file.mimetype)) {
          return;
        }
        const result = await uploadToGridFS(collectionName, file);
        return result.gridFSFile._id;
      }),
    );

    const ImageIDs = results.filter((x) => !!x === true);
    console.log(ImageIDs);

    res.json({
      message: "File uploaded successfully!",
      file: req.file,
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: "Error uploading file" });
  }
});

router.get("/files/images", async (req, res) => {
  try {
    const files = await FetchFiles(collectionName);
    console.log(files);
    res.json(files.flatMap((id) => id._id));
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching files" });
  }
});

// Views the file in the browser (if image or video)
router.get("/show/:id", async (req, res) => {
  try {
    const downloadStream = FetchFile(collectionName, req.params.id);

    downloadStream.on("file", (file) => {
      res.setHeader("Content-Type", file.metadata.mimetype);
    });

    downloadStream.on("error", (err) => {
      console.error(err);
      res.status(404).json({ message: "File not found" });
    });

    downloadStream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error fetching file" });
  }
});

module.exports = router;
