const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

async function createBooking(req, res) {
  try {
    const booking = await BookingService.createBooking({
      flightId: req.body.flightId,
      noOfSeats: req.body.noOfSeats,
      userId: req.body.userId,
    });

    SuccessResponse.data = booking;
    SuccessResponse.message = "Successfully booked the ticket";

    return res.status(StatusCodes.CREATED).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res
      .status(
        error.StatusCodes === undefined
          ? StatusCodes.INTERNAL_SERVER_ERROR
          : error.StatusCodes
      )
      .json(ErrorResponse);
  }
}

async function makePayment(req, res) {
  try {
    const payment = await BookingService.makePayment({
      bookingId: req.body.bookingId,
      amount: req.body.amount,
      userId: req.body.userId,
    });

    SuccessResponse.data = payment;

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    return res.status(error.StatusCodes).json(ErrorResponse);
  }
}

module.exports = {
  createBooking,
  makePayment,
};
