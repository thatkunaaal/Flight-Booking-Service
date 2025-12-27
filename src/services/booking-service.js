const { BookingRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const bookingRepo = new BookingRepository();
const { default: axios } = require("axios");
const { ServerConfig } = require("../config");
const { StatusCodes } = require("http-status-codes");
const { sequelize } = require("../models");

async function createBooking(data) {
  try {
    let response;
    const { flightId, userId, noOfSeats } = data;
    await sequelize.transaction(async (t) => {
      const flights = await axios.get(
        `${ServerConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${flightId}`
      );

      const flightData = flights.data.data;

      // Optimistic concurrency control.
      if (noOfSeats > flightData.totalSeats) {
        throw new AppError(
          "Number of seats requested is more than the available seats",
          StatusCodes.BAD_REQUEST
        );
      }
    });

    return response;
  } catch (error) {
    if (error.StatusCodes === StatusCodes.BAD_REQUEST) {
      throw new AppError(error.explanation, error.StatusCodes);
    } else if (error.response.status === StatusCodes.NOT_FOUND) {
      throw new AppError(
        "The flight you are trying to book is not present",
        StatusCodes.BAD_REQUEST
      );
    }
    throw new AppError(
      "Something went wrong while booking the tickets",
      StatusCodes.INTERNAL_SERVER_ERROR
    );
  }
}

module.exports = {
  createBooking,
};
