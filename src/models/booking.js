"use strict";
const { Model } = require("sequelize");
const { Enum } = require("../utils/common");
const { BOOKED, PENDING, CANCELLED, INITIATED } = Enum.STATUS_TYPE;

module.exports = (sequelize, DataTypes) => {
  class booking extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  booking.init(
    {
      flightId: { type: DataTypes.INTEGER, allowNull: false },
      userId: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM,
        values: [BOOKED, PENDING, CANCELLED, INITIATED],
        defaultValue: INITIATED,
        allowNull: false,
      },
      noOfSeats: { type: DataTypes.INTEGER, allowNull: false },
      totalCost: { type: DataTypes.INTEGER, allowNull: false },
    },
    {
      sequelize,
      modelName: "booking",
    }
  );
  return booking;
};
