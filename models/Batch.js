const mongoose = require("mongoose");
const crypto = require("node:crypto");

const batchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      unique: true,
      maxlength: 50,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Owner is required"],
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    teachers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    assignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],
    batchCode: {
      type: String,
      unique: true,
      default: () => `${crypto.randomBytes(20).toString("hex")}_${Date.now()}`,
      required: true,
    },
    section: String,
    room: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Batch", batchSchema);
