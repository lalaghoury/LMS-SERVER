const mongoose = require("mongoose");

const invitationSchema = new mongoose.Schema({
  inviteCode: {
    type: String,
    required: true,
    // unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  MadeBy: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Invitation", invitationSchema);
