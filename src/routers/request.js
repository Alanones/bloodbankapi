const { express, Router } = require("express");
const Request = require("../models/request");
const Blood = require("../models/blood");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = Router();
router.post("/requests", auth, async (req, res) => {
  console.log();
  const { blood, quantity, bank, date } = req.body;
  let status = "Pending";
  let newQnty = 0;
  let qty = 0;

  try {
    const units = await Blood.find({ bloodType: blood });
    if (units.length === 0) {
      status = "Pending";
    }

    // Assignment
    if (units[0].quantity >= quantity) {
      status = "Approved";
      newQnty = units[0].quantity - quantity;
      await Blood.findOneAndUpdate({ _id: units[0]._id }, { quantity: newQnty });
    } else {
      for (let i = 0; i < units; i++) {
        qty += units[i].quantity;
        if (qty <= quantity) {
          status = "Approved";
          await Blood.findOneAndUpdate({ _id: units[i]._id }, { quantity: qty });
          for (let j = 0; i < units[i]; j++) {
            await Blood.findByIdAndDelete(units[i][j]._id);
          }
          break;
        }
      }
    }
  } catch (err) {
    console.log(err);
  }

  const request = new Request({
    blood,
    quantity,
    bank,
    status,
    date,
    owner: req.user._id,
  });
  try {
    await request.save();
    res.status(201).send(request);
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/requests", admin, async (req, res) => {
  try {
    const requests = await Request.find();
    res.send(requests);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/requests/me", auth, async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user._id });
    res.send(requests).populate("bank", "name");
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/requests/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    const request = await Request.findOne({ _id, owner: req.user.id });
    if (!request) {
      return res.status(404).send("Request not found");
    }
    res.send(request);
  } catch (e) {
    res.status(500).send();
  }
});

router.patch("/requests/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ["location", "blood", "date", "quantity"];
  const isAllowed = updates.every((update) => allowed.includes(update));
  if (!isAllowed) {
    return res.status(400).send({ error: "Invalid update" });
  }
  try {
    const doc = await Request.findByIdAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
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

// Approve/decline request
router.patch("/requests/approve/:id", admin, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowed = ["status"];
  const isAllowed = updates.every((update) => allowed.includes(update));
  if (!isAllowed) {
    return res.status(400).send({ error: "Invalid update" });
  }
  try {
    const doc = await Request.findByIdAndUpdate(
      {
        _id: req.params.id,
        owner: req.user._id,
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

router.delete("/requests/:id", auth, async (req, res) => {
  try {
    const request = await Request.findOne({
      _id: req.params.id,
      owner: req.user._id,
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
