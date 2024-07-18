const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assignmentSchema = new Schema(
  {
    title: { type: String, required: [true, "Title is required"] },
    instructions: {
      type: String,
      required: [true, "Instructions are required"],
    },
    attachments: [],
    state: {
      type: String,
      default: "PUBLISHED",
      enum: ["PUBLISHED", "DRAFT", "DELETED"],
    },
    alternateLink: { type: String, default: "" },
    batchId: {
      type: Schema.Types.ObjectId,
      ref: "Batch",
      required: [true, "Batch ID is required"],
    },
    teacherId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
    submissions: [{ type: Schema.Types.ObjectId, ref: "Submissions" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
