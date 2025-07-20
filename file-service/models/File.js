// const mongoose = require('mongoose');

// const FileSchema = new mongoose.Schema({
//   fileName: String,
//   fileSize: Number,
//   fileType: String,
//   s3Key: String,
//   uploadedAt: { type: Date, default: Date.now },
// });

// module.exports = mongoose.model('File', FileSchema);

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,             // Original filename
  size: Number,                 // File size in bytes
  uploaderId: mongoose.Schema.Types.ObjectId, // (Optional) Who uploaded the file
  s3Key: String,                // Key used to store the file in S3
  uploadId: String,             // AWS multipart uploadId
});

module.exports = mongoose.model('File', fileSchema);
