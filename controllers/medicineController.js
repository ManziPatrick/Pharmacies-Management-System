const Medicine = require("../models/medicine");

exports.getAllMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.status(200).json(medicines);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMedicineById = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }
    res.status(200).json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createMedicine = async (req, res) => {
  const { name, price, quantity, pharmacy_id, expiry_date } = req.body;
  try {
    const medicine = new Medicine({
      name,
      price,
      quantity,
      pharmacy_id,
      expiry_date,
    });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    medicine.name = req.body.name;
    medicine.price = req.body.price;
    medicine.quantity = req.body.quantity;
    medicine.pharmacy_id = req.body.pharmacy_id;
    medicine.expiry_date = req.body.expiry_date;

    await medicine.save();
    res.status(200).json(medicine);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: "Medicine not found" });
    }

    await medicine.remove();
    res.status(204).json({ message: "Medicine deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
