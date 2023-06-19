const { express, Router } = require("express");
const Request = require("../models/request");
const Blood = require("../models/blood");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const router = Router();
router.post("/requests", auth, async (req, res) => {
  const { blood, quantity, bank, date } = req.body;
  let status = "Pending";
  let rem = quantity;

  try {
    const units = await Blood.find({
      bloodType: blood,
      bank: bank,
      expiry: {
        $gte: new Date(),
      },
    }).sort("expiry");
    if (units.length === 0) {
      status = "Pending";
    } else if (units[0].quantity > rem) {
      status = "Approved";
      await Blood.findOneAndUpdate({ _id: units[0]._id }, { $inc: { quantity: -rem } });
    } else if (units[0].quantity === rem) {
      status = "Approved";
      await Blood.findByIdAndRemove(units[0]._id);
    } else {
      /**
       * Not optimized for large orders.
       * For large orders, we need to ensure that either available units are not deleted
       * or create a new entry with the pending quantity to be fullfilled.
       */

      for (let i = 0; i < units.length; i++) {
        if (rem >= units[i].quantity) {
          rem -= units[i].quantity;
          await Blood.findByIdAndRemove(units[i]._id);
        } else if (rem === 0) {
          status = "Approved";
          break;
        } else {
          rem = 0;
          status = "Approved";
          await Blood.findOneAndUpdate({ _id: units[i]._id }, { $inc: { quantity: -rem } });
          break;
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
  try {
    // When you have a request that has been partially fullfiled.
    if (rem < quantity && rem !== 0) {
      const request1 = new Request({
        blood,
        quantity: quantity - rem,
        bank,
        status: "Approved",
        date,
        owner: req.user._id,
      });
      await request1.save();
      const request2 = new Request({
        blood,
        quantity: rem,
        bank,
        status: "Pending",
        date,
        owner: req.user._id,
      });
      request2.save();
    } else {
      const request = new Request({
        blood,
        quantity,
        bank,
        status,
        date,
        owner: req.user._id,
      });
      await request.save();
    }
    res.status(201).send({ success: "Request successfully completed" });
  } catch (e) {
    res.status(400).send(e);
  }
});

router.get("/requests", admin, async (req, res) => {
  try {
    const requests = await Request.find().populate("owner", "name location").sort({ createdAt: -1 })
    res.send(requests);
  } catch (e) {
    res.status(500).send();
  }
});

router.get("/requests/me", auth, async (req, res) => {
  try {
    const requests = await Request.find({ owner: req.user._id }).populate("bank", "name").sort({ createdAt: -1 });
    res.send(requests);
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
