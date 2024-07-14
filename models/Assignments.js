const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const assignmentSchema = new Schema(
  {
    title: { type: String, required: true },
    instructions: { type: String, required: true },
    attachments: [],
    state: {
      type: String,
      default: "PUBLISHED",
      enum: ["PUBLISHED", "DRAFT", "DELETED"],
    },
    alternateLink: { type: String, default: "" },
    courseId: { type: String, required: true },
    teacherId: { type: String, required: true },
    students: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
