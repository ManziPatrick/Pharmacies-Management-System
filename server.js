const express = require("express");
const app = express();
const pharmacyRoutes = require("./routes/pharmacyRoutes");
const medicineRoutes = require("./routes/medicineRoutes");
require("./config/db");

app.use(express.json());

app.use("/pharmacies", pharmacyRoutes);
app.use("/medicines", medicineRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
