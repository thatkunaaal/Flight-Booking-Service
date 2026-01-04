const { StatusCodes } = require("http-status-codes");
const { ErrorResponse } = require("../utils/common");

function validateCreateBooking(req, res, next) {
  console.log("Middleware controller: ", req.body);

  if (!req.body) {
    ErrorResponse.message =
      "You should pass necessary properties while booking a flight.";

    ErrorResponse.error = {
      explanation:
        "You should pass flightId, userId and noOfSeats while booking the flight",
    };

    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  if (!req.body.flightId) {
    ErrorResponse.message = "You should pass flightId while booking a flight.";

    ErrorResponse.error = {
      explanation: "You should pass flightId while booking the flight",
    };

    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  if (!req.body.userId) {
    ErrorResponse.message = "You should pass userId while booking a flight.";

    ErrorResponse.error = {
      explanation: "You should pass userId while booking the flight",
    };

    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  if (!req.body.noOfSeats) {
    ErrorResponse.message = "You should pass noOfSeats while booking a flight.";

    ErrorResponse.error = {
      explanation: "You should pass noOfSeats while booking the flight",
    };

    return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
  }

  next();
}

module.exports = {
  validateCreateBooking,
};
