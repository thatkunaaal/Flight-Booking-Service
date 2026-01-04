const { StatusCodes } = require("http-status-codes");
const { BookingService } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");
const { MemoryDB } = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const { inMemory } = MemoryDB;

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
    const jsonData = req.get("user");
    console.log(jsonData);
    const user = JSON.parse(jsonData);

    const idompotencyKey = req.headers["x-idompotency-key"];

    if (!idompotencyKey) {
      ErrorResponse.error = {
        explanation: "Cannot make a request as Idompotent key is not present",
      };

      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    if (inMemory[idompotencyKey]) {
      ErrorResponse.error = {
        explanation: "Cannot retry on a successful payment",
      };

      return res.status(StatusCodes.BAD_REQUEST).json(ErrorResponse);
    }

    const payment = await BookingService.makePayment({
      bookingId: req.body.bookingId,
      amount: req.body.amount,
      userId: req.body.userId,
      user: user,
    });

    inMemory[idompotencyKey] = "completed";
    console.log(inMemory);
    SuccessResponse.data = payment;

    return res.status(StatusCodes.OK).json(SuccessResponse);
  } catch (error) {
    ErrorResponse.error = error;

    if (error instanceof AppError)
      return res.status(error.StatusCodes).json(ErrorResponse);

    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error);
  }
}

module.exports = {
  createBooking,
  makePayment,
};
