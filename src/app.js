const express = require("express");
require("./db/mongoose");
const User = require("./models/user");
const Request = require("./models/request");
const Blood = require("./models/blood");
const Bank = require("./models/bank");
const userRouter = require("./routers/user");
const requestRouter = require("./routers/request");
const bloodRouter = require("./routers/blood");
const bankRouter = require("./routers/bank");

const app = express();
app.use(express.json());
app.use(userRouter);
app.use(requestRouter);
app.use(bloodRouter);
app.use(bankRouter);

module.exports = app;
