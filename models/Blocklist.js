const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlocklistSchema = new Schema(
  {
    batchId: { type: Schema.Types.ObjectId, ref: "Batch", required: true },
    blockedUser: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    blockedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    note: { type: String, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blocklist", BlocklistSchema);
