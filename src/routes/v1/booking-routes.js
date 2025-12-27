const express = require("express");
const { BookingController } = require("../../controllers");
const { BookingMiddleware } = require("../../middleware");
const router = express.Router();

router.post(
  "/",
  BookingMiddleware.validateCreateBooking,
  BookingController.createBooking
);

module.exports = router;
