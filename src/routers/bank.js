const { express, Router } = require("express");
const Bank = require("../models/bank");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = Router();
router.post("/banks", admin, async (req, res) => {
  const bank = new Bank({
    ...req.body,
  });
  try {
    await bank.save();
    res.status(201).send(bank);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/banks", auth, async (req, res) => {
  try {
    const banks = await Bank.find();
    res.send(banks);
  } catch (e) {
    res.status(500).send();
  }
});

// router.get("/banks/me", auth, async (req, res) => {
//   try {
//     const requests = await Bank.find({ owner: req.user._id });
//     res.send(requests);
//   } catch (e) {
//     res.status(500).send();
//   }
// });

router.get("/banks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const request = await Bank.findOne({ _id });
    if (!request) {
      return res.status(404).send("Bank not found");
    }
    res.send(request);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/banks/:id", admin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ["name", "address"];
  const isAllowed = updates.every((update) => allowed.includes(update));
  if (!isAllowed) {
    return res.status(400).send({ error: "Invalid update" });
  }
  try {
    const doc = await Bank.findByIdAndUpdate(
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

router.delete("/banks/:id", admin, async (req, res) => {
  try {
    const request = await Bank.findOne({
      _id: req.params.id,
    });
    if (!request) {
      return res.status(404).send();
    }
    await request.remove();
    res.send(request);
  } catch (e) {
    res.status(500).send();
  }
});

module.exports = router;
