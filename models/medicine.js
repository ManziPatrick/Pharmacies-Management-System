const mongoose = require("mongoose");
const { Schema } = mongoose;

const medicineSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  pharmacy_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Pharmacy",
    required: true,
  },
  expiry_date: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("Medicine", medicineSchema);
