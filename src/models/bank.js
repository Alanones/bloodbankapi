const mongoose = require("mongoose");
const validator = require("validator");

const bankSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true,
    },
    address: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const Bank = mongoose.model("Bank", bankSchema);

module.exports = Bank;
