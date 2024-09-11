const mongoose = require("mongoose");

const dbURI = "mongodb://127.0.0.1:27017/pharmacy-db";

mongoose
  .connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected..."))
  .catch((err) => console.log("MongoDB connection error:", err));

module.exports = mongoose;
