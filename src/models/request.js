const mongoose = require("mongoose");
const validator = require("validator");

const requestSchema = new mongoose.Schema(
  {
    blood: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      default: "Pending",
    },
    date: {
      type: Date,
      required: true,
      default: false,
    },
    bank: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Bank",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Request = mongoose.model("Request", requestSchema);

module.exports = Request;
