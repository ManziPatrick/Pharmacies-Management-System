const mongoose = require("mongoose");
const { Schema } = mongoose;

const pharmacySchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  contact: {
    type: String,
    required: true,
  },
  commission_rate: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("Pharmacy", pharmacySchema);
