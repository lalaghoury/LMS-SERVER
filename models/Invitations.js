const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  inviteCode: {
    type: String,
    required: [true, "Please provide invite code"],
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: [true, "Please provide expiry date"],
  },
  MadeBy: {
    type: String,
    required: [true, "Please provide user id"],
  },
  email: {
    type: String,
  },
});

module.exports = mongoose.model("Invitation", invitationSchema);
