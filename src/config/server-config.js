const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  PORT: process.env.PORT,
  FLIGHT_SERVICE_URL: process.env.FLIGHT_SERVICE_URL,
  RABBIT_MQ: process.env.RABBITMQ_QUEUE_NAME,
};
