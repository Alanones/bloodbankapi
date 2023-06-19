const { express, Router } = require("express");
const Blood = require("../models/blood");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");

const router = Router();
router.post("/bloods", admin, async (req, res) => {
  const blood = new Blood({
    ...req.body,
  });
  try {
    await blood.save();
    res.status(201).send(blood);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/bloods", admin, async (req, res) => {
  try {
    const bloods = await Blood.find();
    res.send(bloods);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/bloods/:id", admin, async (req, res) => {
  const _id = req.params.id;
  try {
    const blood = await Blood.findOne({ _id });
    if (!blood) {
      return res.status(404).send("Request not found");
    }
    res.send(blood);
  } catch (e) {
    res.status(500).send();
  }
});

// blood units for specific bank
router.get("/bank-blood/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const blood = await Blood.find({
      bank: _id,
      expiry: {
        $gte: new Date(),
      },
    })
      .populate("bank", "name")
      .sort("expiry");
    if (!blood) {
      return res.status(404).send("Request not found");
    }
    res.send(blood);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/bloods/:id", admin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ["quantity", "bloodType", "location", "expiry"];
  const isAllowed = updates.every((update) => allowed.includes(update));
  if (!isAllowed) {
    return res.status(400).send({ error: "Invalid update" });
  }
  try {
    const doc = await Blood.findByIdAndUpdate(
      {
        _id: req.params.id,
      },
      req.body,
      {
        returnOriginal: false,
      }
    );
    res.send(doc);
  } catch (e) {
    res.status(500).send(e);
  }
});

router.delete("/bloods/:id", admin, async (req, res) => {
  try {
    const blood = await Blood.findOne({
      _id: req.params.id,
    });
    if (!blood) {
      return res.status(404).send();
    }
    await blood.remove();
    res.send(blood);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
