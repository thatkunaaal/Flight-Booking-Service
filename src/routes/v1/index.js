const express = require("express");
const { infoController } = require("../../controllers");
const router = express.Router();
const bookingRoutes = require("./booking-routes");

router.use("/bookings", bookingRoutes);
router.get("/info", infoController);

module.exports = router;
