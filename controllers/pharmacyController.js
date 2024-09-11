const Pharmacy = require("../models/pharmacy");

exports.getAllPharmacies = async (req, res) => {
  try {
    const pharmacies = await Pharmacy.find();
    res.status(200).json(pharmacies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPharmacyById = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }
    res.status(200).json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createPharmacy = async (req, res) => {
  const { name, address, contact, commission_rate } = req.body;
  try {
    const pharmacy = new Pharmacy({ name, address, contact, commission_rate });
    await pharmacy.save();
    res.status(201).json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updatePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findById(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    pharmacy.name = req.body.name;
    pharmacy.address = req.body.address;
    pharmacy.contact = req.body.contact;
    pharmacy.commission_rate = req.body.commission_rate;

    await pharmacy.save();
    res.status(200).json(pharmacy);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deletePharmacy = async (req, res) => {
  try {
    const pharmacy = await Pharmacy.findByIdAndDelete(req.params.id);
    if (!pharmacy) {
      return res.status(404).json({ message: "Pharmacy not found" });
    }

    res.status(200).json({ message: "Pharmacy deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
