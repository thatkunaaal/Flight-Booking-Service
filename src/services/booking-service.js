const AppError = require("../utils/errors/app-error");
const { default: axios } = require("axios");
const { ServerConfig } = require("../config");
const { StatusCodes } = require("http-status-codes");
const { sequelize, booking } = require("../models");
const { BookingRepository } = require("../repositories");
const bookingRepo = new BookingRepository();
const { Enum } = require("../utils/common");
const { BOOKED, CANCELLED } = Enum.STATUS_TYPE;
const { QueueConfig } = require("../config");

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
          "Number of seats you requested to book is more than the available seats",
          StatusCodes.BAD_REQUEST
        );
      }

      const totalAmount = noOfSeats * flightData.price;

      response = await bookingRepo.createBooking(
        { ...data, totalCost: totalAmount },
        t
      );

      const bookingPayload = { flightId, seats: noOfSeats };
      await axios.patch(
        `${ServerConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${flightId}/seats`,
        bookingPayload
      );
    });

    return response;
  } catch (error) {
    if (error?.StatusCodes === StatusCodes.BAD_REQUEST) {
      throw new AppError(error.explanation, error.StatusCodes);
    } else if (error?.response?.status === StatusCodes.NOT_FOUND) {
      throw new AppError(
        "The flight you are trying to book is not present",
        StatusCodes.BAD_REQUEST
      );
    }
    throw error;
  }
}

async function makePayment(data) {
  const t = await sequelize.transaction();
  try {
    const { bookingId, amount, userId, user } = data;

    const booking = await bookingRepo.getBooking(bookingId, t);

    if (booking.userId != userId) {
      throw new AppError(
        "You have not booked any tickets",
        StatusCodes.BAD_REQUEST
      );
    }

    if (booking.status === BOOKED) {
      throw new AppError(
        "You have already make an payment for this seat",
        StatusCodes.BAD_REQUEST
      );
    }

    if (booking.status === CANCELLED) {
      throw new AppError(
        "Your booking has been expired",
        StatusCodes.BAD_REQUEST
      );
    }

    if (booking.totalCost != amount) {
      throw new AppError(
        "The amount you have paid is not matching with the expected amount",
        StatusCodes.BAD_REQUEST
      );
    }

    const dt = new Date(booking.createdAt);
    const currTime = new Date();

    if (currTime - dt > 1000 * 60 * 5) {
      //greater than 5 minutes

      await cancelBooking(bookingId, booking.flightId, booking.noOfSeats);

      throw new AppError(
        "Your booking has been expired",
        StatusCodes.BAD_REQUEST
      );
    }

    const response = await bookingRepo.confirmBooking(bookingId, t);
    const flightObj = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${booking.flightId}`
    );

    const flightData = flightObj.data.data;

    const jsonData = JSON.stringify({
      mailtTo: user.email,
      subject: "Booking Confirmed!",
      text: `
      Your tickets has been successfully booked with booking-id: ${booking.id}.
      Passenger: ${booking.noOfSeats}
      Flight: ${flightData.flightNumber},
      From: ${flightData.departureAirportId},
      To: ${flightData.arrivalAirportId},
      Date: ${flightData.departureTime},
      `,
    });

    console.log(jsonData);
    QueueConfig.sendMessageToQueue(Buffer.from(jsonData));

    await t.commit();

    return response;
  } catch (error) {
    await t.rollback();
    if (error?.StatusCodes === StatusCodes.BAD_REQUEST) {
      throw new AppError(error.explanation, error.StatusCodes);
    } else if (error?.response?.status === StatusCodes.NOT_FOUND) {
      throw new AppError(
        "The flight you are trying to book is not present",
        StatusCodes.BAD_REQUEST
      );
    }
    throw error;
  }
}

async function cancelBooking(bookingId, flightId, noOfSeats) {
  const t = await sequelize.transaction();
  try {
    await bookingRepo.cancelBooking(bookingId, t);

    const response = await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${flightId}/seats`,
      {
        seats: noOfSeats,
        dec: false,
      }
    );
    await t.commit();
    return response;
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

async function cancelOldBooking() {
  const t = await sequelize.transaction();
  try {
    const time = new Date(Date.now() - 1000 * 60 * 5);

    const data = await bookingRepo.cancelOldBooking(time, t);

    data.map(async (item) => {
      const { flightId, noOfSeats } = item.dataValues;
      await axios.patch(
        `${ServerConfig.FLIGHT_SERVICE_URL}/api/v1/flights/${flightId}/seats`,
        {
          seats: noOfSeats,
          dec: false,
        }
      );
    });

    await t.commit();
  } catch (error) {
    await t.rollback();
    throw error;
  }
}

module.exports = {
  createBooking,
  makePayment,
  cancelOldBooking,
};
