const cron = require("node-cron");

function ScheduleCron() {
  const { BookingService } = require("../../services");
  console.log("Scheduled Cron has been started.");
  cron.schedule("*/30 * * * *", () => {
    console.log("Calling cancel old booking every 30 minutes.");
    BookingService.cancelOldBooking();
  });
}

module.exports = {
  ScheduleCron,
};
