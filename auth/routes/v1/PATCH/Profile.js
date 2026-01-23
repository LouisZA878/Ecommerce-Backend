const router = require("express").Router();

const User = require("../../../models/User");

const {
  Email,
  Password,
  Username,
  matchedData,
} = require("../../../components/validators/Output");
const ValidationArray = require("../../../components/middleware/ValidationArray");
