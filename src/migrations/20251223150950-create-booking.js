"use strict";
/** @type {import('sequelize-cli').Migration} */
const { Enum } = require("../utils/common");
const { BOOKED, INITIATED, PENDING, CANCELLED } = Enum.STATUS_TYPE;

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      flightId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM,
        values: [BOOKED, PENDING, CANCELLED, INITIATED],
        defaultValue: INITIATED,
        allowNull: false,
      },
      noOfSeats: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
      },
      totalCost: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("bookings");
  },
};
