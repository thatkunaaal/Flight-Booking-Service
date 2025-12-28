const CrudRepository = require("./crud-repository");
const { booking } = require("../models");
const { Enum } = require("../utils/common");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
const { Op } = require("sequelize");
const { BOOKED, CANCELLED } = Enum.STATUS_TYPE;

class BookingRepository extends CrudRepository {
  constructor() {
    super(booking);
  }

  async createBooking(data, transaction) {
    const response = await booking.create(
      { ...data },
      { transaction: transaction }
    );
    return response;
  }

  async getBooking(bookingId, transaction) {
    const response = await booking.findByPk(bookingId, {
      transaction: transaction,
    });

    if (!response) {
      throw new AppError(
        "The booking you are requesting is not present",
        StatusCodes.BAD_REQUEST
      );
    }

    return response;
  }

  async confirmBooking(bookingId, transaction) {
    const response = await booking.update(
      {
        status: BOOKED,
      },
      {
        where: {
          id: bookingId,
        },
        transaction: transaction,
      }
    );

    return response;
  }

  async cancelBooking(bookingId, transaction) {
    const response = await booking.update(
      {
        status: CANCELLED,
      },
      {
        where: {
          id: bookingId,
        },
        transaction: transaction,
      }
    );

    return response;
  }

  async cancelOldBooking(time, transaction) {
    const bookings = await booking.findAll({
      where: {
        createdAt: {
          [Op.lt]: time,
        },
        status: {
          [Op.in]: ["PENDING", "INITIATED"],
        },
      },
      attributes: ["flightId", "noOfSeats"],
      transaction: transaction,
    });

    await booking.update(
      { status: CANCELLED },
      {
        where: {
          createdAt: {
            [Op.lt]: time,
          },
          status: {
            [Op.in]: ["PENDING", "INITIATED"],
          },
        },
        transaction: transaction,
      }
    );

    return bookings;
  }
}

module.exports = BookingRepository;
