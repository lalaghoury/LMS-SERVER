const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const submissionSchema = new Schema(
  {
    assignmentId: {
      type: Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    studentId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    attachments: [],
    feedback: { type: String, default: "" },
    grade: {
      type: String,
      enum: ["A", "B", "C", "D", "E", "F", "Not Graded"],
      default: "Not Graded",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Submissions", submissionSchema);
