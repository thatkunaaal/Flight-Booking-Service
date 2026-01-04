const amqp = require("amqplib");
const { RABBIT_MQ } = require("./server-config");

let connection;
let channel;
const queue = RABBIT_MQ;

async function connectQueue() {
  try {
    connection = await amqp.connect("amqp://localhost");
    console.log("Queue connection established");

    channel = await connection.createChannel();

    await channel.assertQueue(queue);
  } catch (error) {
    console.log(error);
  }
}

function sendMessageToQueue(data) { 
  channel.sendToQueue(queue, Buffer.from(data));
}

module.exports = {
  connectQueue,
  sendMessageToQueue,
};
