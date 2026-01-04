const express = require("express");
const { ServerConfig } = require("./config");
const apiRoutes = require("./routes");
const { CronUtil } = require("./utils/common");
const { QueueConfig } = require("./config");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", apiRoutes);

app.listen(ServerConfig.PORT, () => {
  console.log(`Server is up and running on port: ${ServerConfig.PORT}`);
  CronUtil.ScheduleCron();
  QueueConfig.connectQueue();
});
