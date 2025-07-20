const s3 = require("../utils/s3Client");

const {
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  UploadPartCommand,
  GetObjectCommand,
  PutObjectCommand,
} = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { v4: uuidv4 } = require("uuid");

const BUCKET = process.env.AWS_BUCKET;

const File = require("../models/File");

exports.uploadSmallFile = async (req, res) => {
  try {
    const files = req.files || (req.file ? [req.file] : []);

    if (!files.length) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const uploadedUrls = [];

    for (const file of files) {
      const fileKey = `${Date.now()}-${file.originalname}`;
      const uploadParams = {
        Bucket: process.env.AWS_BUCKET,
        Key: fileKey,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      await s3.send(new PutObjectCommand(uploadParams));

      const fileUrl = `https://${process.env.AWS_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileKey}`;
      uploadedUrls.push(fileUrl);
    }

    res.json({
      status: 201,
      message:
        uploadedUrls.length === 1
          ? "Files uploaded successfully"
          : "File uploaded successfully",
      fileUrls: uploadedUrls.length === 1 ? uploadedUrls[0] : uploadedUrls,
    });
  } catch (error) {
    console.error("Error uploading files:", error);
    res.status(500).json({ error: "Error uploading files" });
  }
};



exports.uploadFullFile = async (req, res) => {
  try {
    const file = req.file;
    const user_id = req.user.id;
    const uploaderId = user_id;

    if (!file) return res.status(400).json({ error: "File is required" });

    const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB
    const s3Key = `uploads/${uuidv4()}_${file.originalname}`;

    // Step 1: Initiate multipart upload
    const createCommand = new CreateMultipartUploadCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: s3Key,
    });
    const { UploadId } = await s3.send(createCommand);

    // Step 2: Split file into chunks and upload each part
    const fileBuffer = file.buffer;
    const totalParts = Math.ceil(fileBuffer.length / CHUNK_SIZE);
    const uploadedParts = [];

    for (let i = 0; i < totalParts; i++) {
      const partBuffer = fileBuffer.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      const partNumber = i + 1;

      const uploadCommand = new UploadPartCommand({
        Bucket: process.env.AWS_BUCKET,
        Key: s3Key,
        UploadId,
        PartNumber: partNumber,
        Body: partBuffer,
      });

      const result = await s3.send(uploadCommand);
      uploadedParts.push({
        PartNumber: partNumber,
        ETag: result.ETag,
      });
    }

    // Step 3: Complete multipart upload
    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: process.env.AWS_BUCKET,
      Key: s3Key,
      UploadId,
      MultipartUpload: {
        Parts: uploadedParts,
      },
    });

    const finalResult = await s3.send(completeCommand);

    // Step 4: Store metadata in DB
    const savedFile = await File.create({
      filename: file.originalname,
      size: file.size,
      uploaderId,
      s3Key,
      uploadId: UploadId,
    });

    res.status(200).json({
      message: "File uploaded successfully",
      fileId: savedFile._id,
      location: finalResult.Location,
    });
  } catch (err) {
    console.error("Upload failed:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.initiateUpload = async (req, res) => {
  try {
    const { filename, size } = req.body;
       const user_id = req.user.id;
    const uploaderId = user_id;
    const s3Key = `uploads/${uuidv4()}_${filename}`;

    const createCommand = new CreateMultipartUploadCommand({
      Bucket: BUCKET,
      Key: s3Key,
    });

    const { UploadId } = await s3.send(createCommand);
    const partCount = Math.ceil(size / (5 * 1024 * 1024)); // 5MB parts
    const parts = [];

    for (let i = 1; i <= partCount; i++) {
      const uploadPartCommand = new UploadPartCommand({
        Bucket: BUCKET,
        Key: s3Key,
        UploadId,
        PartNumber: i,
      });

      const presignedUrl = await getSignedUrl(s3, uploadPartCommand, {
        expiresIn: 3600,
      });
      parts.push({ partNumber: i, presignedUrl });
    }

    await File.create({ filename, size, s3Key, uploadId: UploadId, uploaderId });

    res.json({ uploadId: UploadId, parts });
  } catch (err) {
    console.error("Initiate Error:", err);
    res.status(500).json({ error: "Failed to initiate upload" });
  }
};

exports.completeUpload = async (req, res) => {
  try {
    
    const { uploadId, parts } = req.body;
    const file = await File.findOne({ uploadId });

    if (!file) return res.status(404).json({ error: "Upload not found" });

    const completeCommand = new CompleteMultipartUploadCommand({
      Bucket: BUCKET,
      Key: file.s3Key,
      UploadId: uploadId,
      MultipartUpload: {
        Parts: parts.map((p) => ({ PartNumber: p.partNumber, ETag: p.eTag })),
      },
    });

    const result = await s3.send(completeCommand);
    res.json({ fileId: file._id, location: result.Location });
  } catch (err) {
    console.error("Complete Error:", err);
    res.status(500).json({ error: "Failed to complete upload" });
  }
};

exports.getDownloadUrl = async (req, res) => {
  try {
    const { fileId } = req.params;
    const file = await File.findById(fileId);

    if (!file) return res.status(404).json({ error: "File not found" });

    const getObjectCommand = new GetObjectCommand({
      Bucket: BUCKET,
      Key: file.s3Key,
    });

    const presignedUrl = await getSignedUrl(s3, getObjectCommand, {
      expiresIn: 3600,
    });
    res.json({ downloadUrl: presignedUrl });
  } catch (err) {
    console.error("Download URL Error:", err);
    res.status(500).json({ error: "Failed to get download URL" });
  }
};
