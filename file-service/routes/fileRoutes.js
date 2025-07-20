const express = require("express");
const {
  register,
  login,
  uploadSmallFile,
  getDownloadUrl,
  completeUpload,
  initiateUpload,
  uploadFullFile
} = require("../controllers/fileController");

const {
  registerValidator,
  loginValidator,
} = require("../validators/authValidator");

const validateRequest = require("../middleware/validateRequest");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();
const multer = require("multer");

// Configure multer to store uploaded files in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

/**
 * @route   POST /upload-single-small-file
 * @desc    Upload a small file directly to AWS S3 (suitable for small-sized files)
 * @access  Public
 */
router.post('/upload-single-small-file', upload.any(), verifyToken,uploadSmallFile);

/**
 * @route   POST /files/upload-full
 * @desc    Upload a large file directly to AWS S3 using a single request (without presigned URL)
 * @access  Protected (Requires JWT token)
 */
router.post('/upload-full', upload.single('file'), verifyToken, uploadFullFile);

/**
 * Below APIs are used for multipart file upload using presigned URLs.
 * The client application handles file chunking and PUT requests to S3 using the presigned URLs.
 */

/**
 * @route   POST /files/initiate
 * @desc    Initiate a multipart upload on AWS S3 and return uploadId and presigned URLs
 * @access  Public / Client-side initiated
 */
router.post("/initiate",verifyToken, initiateUpload);

/**
 * @route   POST /files/complete
 * @desc    Complete the multipart upload after all chunks have been uploaded
 * @access  Public / Client-side initiated
 */
router.post("/complete", verifyToken , completeUpload);

/**
 * @route   GET /files/:fileId
 * @desc    Get a downloadable presigned URL for an uploaded file
 * @access  Public
 */
router.get("/:fileId", verifyToken, getDownloadUrl);

module.exports = router;
