const mongoose = require("mongoose");

const bloodSchema = new mongoose.Schema(
  {
    bloodType: {
      type: String,
      trim: true,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    expiry: {
      type: Date,
      required: true,
    },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Bank",
    },
  },
  {
    timestamps: true,
  }
);

const Blood = mongoose.model("Blood", bloodSchema);

module.exports = Blood;
